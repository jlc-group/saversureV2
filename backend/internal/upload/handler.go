package upload

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"

	"saversure/internal/apperror"
)

type Handler struct {
	client       *minio.Client
	bucket       string
	publicURL    string
	geminiAPIKey string
}

type Config struct {
	Endpoint     string
	AccessKey    string
	SecretKey    string
	Bucket       string
	UseSSL       bool
	PublicURL    string
	GeminiAPIKey string
}

func NewHandler(cfg Config) (*Handler, error) {
	client, err := minio.New(cfg.Endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKey, cfg.SecretKey, ""),
		Secure: cfg.UseSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("minio client: %w", err)
	}

	return &Handler{
		client:       client,
		bucket:       cfg.Bucket,
		publicURL:    cfg.PublicURL,
		geminiAPIKey: cfg.GeminiAPIKey,
	}, nil
}

var allowedTypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/gif":  true,
	"image/webp": true,
}

var allowedFileTypes = map[string]bool{
	"image/jpeg":      true,
	"image/png":       true,
	"image/gif":       true,
	"image/webp":      true,
	"application/pdf": true,
	"text/csv":        true,
}

func (h *Handler) UploadImage(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file provided"})
		return
	}
	defer file.Close()

	if header.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (max 10MB)"})
		return
	}

	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only JPEG, PNG, GIF, WebP allowed"})
		return
	}

	ext := filepath.Ext(header.Filename)
	objectName := fmt.Sprintf("images/%s/%s%s",
		time.Now().Format("2006/01"),
		uuid.New().String(),
		strings.ToLower(ext),
	)

	_, err = h.client.PutObject(c.Request.Context(), h.bucket, objectName, file, header.Size,
		minio.PutObjectOptions{ContentType: contentType},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
		return
	}

	url := fmt.Sprintf("%s/%s/%s", strings.TrimRight(h.publicURL, "/"), h.bucket, objectName)
	c.JSON(http.StatusOK, gin.H{"url": url, "filename": header.Filename, "size": header.Size})
}

func (h *Handler) UploadFile(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "no file provided"})
		return
	}
	defer file.Close()

	if header.Size > 50*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (max 50MB)"})
		return
	}

	buf := make([]byte, 512)
	n, _ := file.Read(buf)
	contentType := http.DetectContentType(buf[:n])
	if _, err := file.(io.Seeker).Seek(0, io.SeekStart); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "read error"})
		return
	}

	if !allowedFileTypes[contentType] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file type not allowed"})
		return
	}

	ext := filepath.Ext(header.Filename)
	objectName := fmt.Sprintf("files/%s/%s%s",
		time.Now().Format("2006/01"),
		uuid.New().String(),
		strings.ToLower(ext),
	)

	_, err = h.client.PutObject(c.Request.Context(), h.bucket, objectName, file, header.Size,
		minio.PutObjectOptions{ContentType: contentType},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload failed"})
		return
	}

	url := fmt.Sprintf("%s/%s/%s", strings.TrimRight(h.publicURL, "/"), h.bucket, objectName)
	c.JSON(http.StatusOK, gin.H{"url": url, "filename": header.Filename, "size": header.Size})
}

type aiGenerateRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

type geminiRequest struct {
	Contents         []geminiContent  `json:"contents"`
	GenerationConfig *geminiGenConfig `json:"generationConfig,omitempty"`
}

type geminiContent struct {
	Parts []geminiPart `json:"parts"`
}

type geminiPart struct {
	Text       string        `json:"text,omitempty"`
	InlineData *geminiInline `json:"inlineData,omitempty"`
}

type geminiInline struct {
	MimeType string `json:"mimeType"`
	Data     string `json:"data"`
}

type geminiGenConfig struct {
	ResponseModalities []string `json:"responseModalities,omitempty"`
}

type geminiResponse struct {
	Candidates []struct {
		Content struct {
			Parts []struct {
				Text       string `json:"text,omitempty"`
				InlineData *struct {
					MimeType string `json:"mimeType"`
					Data     string `json:"data"`
				} `json:"inlineData,omitempty"`
			} `json:"parts"`
		} `json:"content"`
	} `json:"candidates"`
	Error *struct {
		Message string `json:"message"`
		Code    int    `json:"code"`
	} `json:"error,omitempty"`
}

func (h *Handler) AIGenerateImage(c *gin.Context) {
	if h.geminiAPIKey == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error":   "ai_not_configured",
			"message": "GEMINI_API_KEY is not set",
		})
		return
	}

	var req aiGenerateRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		apperror.RespondValidation(c, err.Error())
		return
	}

	prompt := fmt.Sprintf(
		"Generate a high-quality product/marketing image based on this description. "+
			"Create a clean, professional image suitable for a consumer loyalty program. "+
			"Description: %s",
		req.Prompt,
	)

	gemReq := geminiRequest{
		Contents: []geminiContent{
			{Parts: []geminiPart{{Text: prompt}}},
		},
		GenerationConfig: &geminiGenConfig{
			ResponseModalities: []string{"TEXT", "IMAGE"},
		},
	}

	reqBody, _ := json.Marshal(gemReq)

	apiURL := fmt.Sprintf(
		"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=%s",
		h.geminiAPIKey,
	)

	httpReq, err := http.NewRequestWithContext(c.Request.Context(), "POST", apiURL, bytes.NewReader(reqBody))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "request_failed"})
		return
	}
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		apperror.Respond(c, err)
		return
	}
	defer resp.Body.Close()

	var gemResp geminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&gemResp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "parse_failed"})
		return
	}

	if gemResp.Error != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "gemini_error", "message": gemResp.Error.Message})
		return
	}

	var imageData []byte
	var mimeType string
	for _, candidate := range gemResp.Candidates {
		for _, part := range candidate.Content.Parts {
			if part.InlineData != nil && strings.HasPrefix(part.InlineData.MimeType, "image/") {
				decoded, err := base64.StdEncoding.DecodeString(part.InlineData.Data)
				if err == nil {
					imageData = decoded
					mimeType = part.InlineData.MimeType
					break
				}
			}
		}
		if imageData != nil {
			break
		}
	}

	if imageData == nil {
		c.JSON(http.StatusUnprocessableEntity, gin.H{
			"error":   "no_image_generated",
			"message": "Gemini did not return an image — try rephrasing your prompt.",
		})
		return
	}

	extMap := map[string]string{
		"image/png": ".png", "image/jpeg": ".jpg",
		"image/webp": ".webp", "image/gif": ".gif",
	}
	ext := extMap[mimeType]
	if ext == "" {
		ext = ".png"
	}

	objectName := fmt.Sprintf("ai-generated/%s/%s%s",
		time.Now().Format("2006/01"),
		uuid.New().String(),
		ext,
	)

	reader := bytes.NewReader(imageData)
	_, err = h.client.PutObject(c.Request.Context(), h.bucket, objectName, reader, int64(len(imageData)),
		minio.PutObjectOptions{ContentType: mimeType},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload_failed"})
		return
	}

	mediaURL := fmt.Sprintf("%s/%s/%s", strings.TrimRight(h.publicURL, "/"), h.bucket, objectName)
	c.JSON(http.StatusOK, gin.H{"url": mediaURL, "mime_type": mimeType, "size": len(imageData)})
}
