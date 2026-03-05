package upload

import (
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
)

type Handler struct {
	client     *minio.Client
	bucket     string
	publicURL  string
}

type Config struct {
	Endpoint  string
	AccessKey string
	SecretKey string
	Bucket    string
	UseSSL    bool
	PublicURL string
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
		client:    client,
		bucket:    cfg.Bucket,
		publicURL: cfg.PublicURL,
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
