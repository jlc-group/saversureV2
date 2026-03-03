package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"saversure/internal/audit"
	"saversure/internal/auth"
	"saversure/internal/batch"
	"saversure/internal/campaign"
	"saversure/internal/code"
	"saversure/internal/config"
	"saversure/internal/inventory"
	"saversure/internal/ledger"
	mw "saversure/internal/middleware"
	"saversure/internal/redemption"
	"saversure/internal/tenant"
	"saversure/pkg/cache"
	"saversure/pkg/database"
	qrhmac "saversure/pkg/hmac"
	"saversure/pkg/queue"
)

func main() {
	godotenv.Load()

	cfg, err := config.Load()
	if err != nil {
		slog.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	setupLogger(cfg.App.Env)

	// --- Infrastructure ---
	db, err := database.NewPool(cfg.DB.DSN(), cfg.DB.MaxConns, cfg.DB.MinConns)
	if err != nil {
		slog.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	defer db.Close()
	slog.Info("connected to PostgreSQL")

	rdb, err := cache.NewRedisClient(cfg.Redis.Addr(), cfg.Redis.Password, cfg.Redis.DB)
	if err != nil {
		slog.Error("failed to connect to Redis", "error", err)
		os.Exit(1)
	}
	defer rdb.Close()
	slog.Info("connected to Redis")

	nc, err := queue.NewNATSConn(cfg.NATS.URL)
	if err != nil {
		slog.Warn("failed to connect to NATS (non-fatal for MVP)", "error", err)
	} else {
		defer nc.Close()
		slog.Info("connected to NATS")
	}
	_ = nc // Will be used for async notifications in the future

	signer := qrhmac.NewSigner(cfg.HMAC.Secret)

	// --- Services ---
	tenantSvc := tenant.NewService(db)
	authSvc := auth.NewService(db, cfg.JWT.Secret, cfg.JWT.AccessTTL, cfg.JWT.RefreshTTL)
	campaignSvc := campaign.NewService(db)
	batchSvc := batch.NewService(db, signer)
	inventorySvc := inventory.NewService(db)
	ledgerSvc := ledger.NewService(db)
	auditSvc := audit.NewService(db)
	codeSvc := code.NewService(db, signer, ledgerSvc)
	redemptionSvc := redemption.NewService(db, inventorySvc, ledgerSvc)

	// --- Handlers ---
	tenantHandler := tenant.NewHandler(tenantSvc)
	authHandler := auth.NewHandler(authSvc)
	campaignHandler := campaign.NewHandler(campaignSvc)
	batchHandler := batch.NewHandler(batchSvc)
	inventoryHandler := inventory.NewHandler(inventorySvc)
	ledgerHandler := ledger.NewHandler(ledgerSvc)
	auditHandler := audit.NewHandler(auditSvc)
	codeHandler := code.NewHandler(codeSvc)
	redemptionHandler := redemption.NewHandler(redemptionSvc)

	// --- Router ---
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())
	r.Use(mw.RequestLogger())
	r.Use(mw.CORS())

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "ok",
			"service": "saversure-api",
			"version": "2.0.0",
		})
	})

	api := r.Group("/api/v1")

	// --- Auth (public) ---
	authRoutes := api.Group("/auth")
	{
		authRoutes.POST("/register", authHandler.Register)
		authRoutes.POST("/login", authHandler.Login)
		authRoutes.POST("/refresh", authHandler.Refresh)
	}

	// --- Protected routes ---
	protected := api.Group("")
	protected.Use(mw.JWTAuth(cfg.JWT.Secret))

	// Tenant (Super Admin)
	tenantRoutes := protected.Group("/tenants")
	tenantRoutes.Use(mw.RequireRole("super_admin"))
	{
		tenantRoutes.POST("", tenantHandler.Create)
		tenantRoutes.GET("", tenantHandler.List)
		tenantRoutes.PATCH("/:id", tenantHandler.Update)
	}

	// Routes that require tenant context
	tenanted := protected.Group("")
	tenanted.Use(mw.TenantIsolation())

	// Campaign (Brand Admin)
	campaignRoutes := tenanted.Group("/campaigns")
	campaignRoutes.Use(mw.RequireRole("super_admin", "brand_admin"))
	{
		campaignRoutes.POST("", campaignHandler.Create)
		campaignRoutes.GET("", campaignHandler.List)
		campaignRoutes.GET("/:id", campaignHandler.GetByID)
		campaignRoutes.PATCH("/:id", campaignHandler.Update)
		campaignRoutes.POST("/:id/publish", campaignHandler.Publish)
	}

	// Batch (Brand Admin / Factory User)
	batchRoutes := tenanted.Group("/batches")
	batchRoutes.Use(mw.RequireRole("super_admin", "brand_admin", "factory_user"))
	{
		batchRoutes.POST("", batchHandler.Create)
		batchRoutes.GET("", batchHandler.List)
		batchRoutes.PATCH("/:id/status", batchHandler.UpdateStatus)
		batchRoutes.POST("/:id/recall", batchHandler.Recall)
	}

	// Rewards / Inventory (Brand Admin)
	rewardRoutes := tenanted.Group("/rewards")
	rewardRoutes.Use(mw.RequireRole("super_admin", "brand_admin"))
	{
		rewardRoutes.POST("", inventoryHandler.CreateReward)
		rewardRoutes.GET("", inventoryHandler.List)
		rewardRoutes.PATCH("/:id/inventory", inventoryHandler.UpdateInventory)
	}

	// QR Scan (Public users, rate limited)
	scanRoutes := tenanted.Group("/scan")
	scanRoutes.Use(mw.RateLimit(rdb, "scan", cfg.RateLimit.Scan, time.Minute))
	{
		scanRoutes.POST("", codeHandler.Scan)
	}

	// Redemption (rate limited, idempotent)
	redeemRoutes := tenanted.Group("/redeem")
	redeemRoutes.Use(mw.RateLimit(rdb, "redeem", cfg.RateLimit.Redeem, time.Minute))
	{
		redeemRoutes.POST("", mw.Idempotency(rdb, 10*time.Minute), redemptionHandler.Redeem)
		redeemRoutes.POST("/:id/confirm", redemptionHandler.Confirm)
	}

	// Points / Ledger
	pointsRoutes := tenanted.Group("/points")
	{
		pointsRoutes.GET("/balance", ledgerHandler.GetBalance)
		pointsRoutes.GET("/history", ledgerHandler.GetHistory)
	}

	// Audit (Super Admin)
	auditRoutes := tenanted.Group("/audit")
	auditRoutes.Use(mw.RequireRole("super_admin"))
	{
		auditRoutes.GET("", auditHandler.List)
	}

	// Dashboard
	dashboardRoutes := tenanted.Group("/dashboard")
	dashboardRoutes.Use(mw.RequireRole("super_admin", "brand_admin"))
	{
		dashboardRoutes.GET("/summary", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{"message": "dashboard coming soon"})
		})
	}

	// --- Server ---
	srv := &http.Server{
		Addr:         cfg.ListenAddr(),
		Handler:      r,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	go func() {
		slog.Info("starting server", "addr", cfg.ListenAddr(), "env", cfg.App.Env)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server error", "error", err)
			os.Exit(1)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	slog.Info("shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("server forced to shutdown", "error", err)
	}

	slog.Info("server stopped")
}

func setupLogger(env string) {
	opts := &slog.HandlerOptions{
		Level: slog.LevelDebug,
	}
	if env == "production" {
		opts.Level = slog.LevelInfo
	}
	handler := slog.NewJSONHandler(os.Stdout, opts)
	slog.SetDefault(slog.New(handler))
}
