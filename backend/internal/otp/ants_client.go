package otp

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

const (
	pathRequestOTP = "/otp/requestOTP"
	pathResendOTP = "/otp/resendOTP"
	pathVerifyOTP = "/otp/verifyOTP"
)

type AntsClient struct {
	host     string
	username string
	password string
	otcID    string
	client   *http.Client
}

func NewAntsClient(host, username, password, otcID string) *AntsClient {
	return &AntsClient{
		host:     strings.TrimSuffix(host, "/"),
		username: username,
		password: password,
		otcID:    otcID,
		client:   &http.Client{Timeout: 15 * time.Second},
	}
}

func (c *AntsClient) authHeader() string {
	return "Basic " + base64.StdEncoding.EncodeToString([]byte(c.username+":"+c.password))
}

type requestOTPReq struct {
	OTCID string `json:"otcId"`
	Mobile string `json:"mobile"`
}

type requestOTPRes struct {
	OTPID          string `json:"otpId"`
	ReferenceCode  string `json:"referenceCode"`
	Success        *struct {
		Message string `json:"message"`
	} `json:"success"`
	Error *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (c *AntsClient) RequestOTP(mobile string) (otpID, refCode string, err error) {
	body, _ := json.Marshal(requestOTPReq{OTCID: c.otcID, Mobile: normalizePhone(mobile)})
	req, _ := http.NewRequest("POST", c.host+pathRequestOTP, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", c.authHeader())

	resp, err := c.client.Do(req)
	if err != nil {
		return "", "", fmt.Errorf("request OTP: %w", err)
	}
	defer resp.Body.Close()

	var res requestOTPRes
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return "", "", fmt.Errorf("decode response: %w", err)
	}

	if res.Error != nil && res.Error.Message != "" {
		return "", "", fmt.Errorf("ants api: %s", res.Error.Message)
	}
	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("ants api: status %d", resp.StatusCode)
	}

	return res.OTPID, res.ReferenceCode, nil
}

type verifyOTPReq struct {
	OTPID   string `json:"otpId"`
	OTPCode string `json:"otpCode"`
}

type verifyOTPRes struct {
	Result       bool `json:"result"`
	IsErrorCount bool `json:"isErrorCount"`
	IsExprCode   bool `json:"isExprCode"`
	Error        *struct {
		Message string `json:"message"`
	} `json:"error"`
}

func (c *AntsClient) VerifyOTP(otpID, otpCode string) (ok bool, err error) {
	body, _ := json.Marshal(verifyOTPReq{OTPID: otpID, OTPCode: otpCode})
	req, _ := http.NewRequest("POST", c.host+pathVerifyOTP, bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", c.authHeader())

	resp, err := c.client.Do(req)
	if err != nil {
		return false, fmt.Errorf("verify OTP: %w", err)
	}
	defer resp.Body.Close()

	var res verifyOTPRes
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return false, fmt.Errorf("decode response: %w", err)
	}

	if res.Error != nil && res.Error.Message != "" {
		return false, fmt.Errorf("ants api: %s", res.Error.Message)
	}
	if res.IsExprCode {
		return false, fmt.Errorf("otp expired")
	}
	if res.IsErrorCount {
		return false, fmt.Errorf("too many wrong attempts")
	}

	return res.Result, nil
}

func normalizePhone(s string) string {
	s = strings.TrimSpace(s)
	s = strings.TrimPrefix(s, "+66")
	s = strings.TrimPrefix(s, "66")
	if strings.HasPrefix(s, "0") {
		return s
	}
	if len(s) == 9 && s[0] >= '6' && s[0] <= '9' {
		return "0" + s
	}
	return s
}
