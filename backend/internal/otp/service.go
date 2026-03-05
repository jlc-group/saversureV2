package otp

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

const (
	rateLimitKeyPrefix = "otp:ratelimit:"
	rateLimitWindow    = time.Hour
	rateLimitMax       = 5
)

type Service struct {
	client *AntsClient
	redis  *redis.Client
}

func NewService(client *AntsClient, rdb *redis.Client) *Service {
	return &Service{client: client, redis: rdb}
}

func (s *Service) RequestOTP(ctx context.Context, phone string) (otpID, refCode string, err error) {
	key := rateLimitKeyPrefix + phone
	count, err := s.redis.Incr(ctx, key).Result()
	if err != nil {
		return "", "", fmt.Errorf("rate limit check: %w", err)
	}
	if count == 1 {
		s.redis.Expire(ctx, key, rateLimitWindow)
	}
	if count > rateLimitMax {
		return "", "", fmt.Errorf("too many OTP requests, try again later")
	}

	otpID, refCode, err = s.client.RequestOTP(phone)
	if err != nil {
		return "", "", err
	}
	return otpID, refCode, nil
}

func (s *Service) VerifyOTP(ctx context.Context, otpID, otpCode string) (bool, error) {
	return s.client.VerifyOTP(otpID, otpCode)
}
