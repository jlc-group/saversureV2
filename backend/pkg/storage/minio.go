package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
)

type Client struct {
	mc     *minio.Client
	bucket string
}

func NewMinIOClient(endpoint, accessKey, secretKey, bucket string, useSSL bool) (*Client, error) {
	mc, err := minio.New(endpoint, &minio.Options{
		Creds:  credentials.NewStaticV4(accessKey, secretKey, ""),
		Secure: useSSL,
	})
	if err != nil {
		return nil, fmt.Errorf("create minio client: %w", err)
	}

	ctx := context.Background()
	exists, err := mc.BucketExists(ctx, bucket)
	if err != nil {
		return nil, fmt.Errorf("check bucket: %w", err)
	}
	if !exists {
		if err := mc.MakeBucket(ctx, bucket, minio.MakeBucketOptions{}); err != nil {
			return nil, fmt.Errorf("create bucket: %w", err)
		}
	}

	return &Client{mc: mc, bucket: bucket}, nil
}

func (c *Client) Upload(ctx context.Context, objectName string, reader io.Reader, size int64, contentType string) error {
	_, err := c.mc.PutObject(ctx, c.bucket, objectName, reader, size, minio.PutObjectOptions{
		ContentType: contentType,
	})
	return err
}

func (c *Client) Download(ctx context.Context, objectName string) (io.ReadCloser, error) {
	return c.mc.GetObject(ctx, c.bucket, objectName, minio.GetObjectOptions{})
}

func (c *Client) Delete(ctx context.Context, objectName string) error {
	return c.mc.RemoveObject(ctx, c.bucket, objectName, minio.RemoveObjectOptions{})
}
