package hmac

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
)

const base62Chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

type Signer struct {
	secret []byte
}

func NewSigner(secret string) *Signer {
	return &Signer{secret: []byte(secret)}
}

// Sign generates an HMAC-SHA256 signature for the given data.
func (s *Signer) Sign(data string) string {
	h := hmac.New(sha256.New, s.secret)
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// Verify checks that the signature matches the data.
func (s *Signer) Verify(data, signature string) bool {
	expected := s.Sign(data)
	return hmac.Equal([]byte(expected), []byte(signature))
}

// GenerateCode creates a QR code string (standard format with hyphens).
// Format: {prefix}-{serial}-{signature[:8]}
func (s *Signer) GenerateCode(prefix string, serial int64) string {
	data := fmt.Sprintf("%s-%d", prefix, serial)
	sig := s.Sign(data)
	return fmt.Sprintf("%s-%s", data, sig[:8])
}

// ValidateCode verifies a standard QR code string and extracts its components.
func (s *Signer) ValidateCode(code string) (prefix string, serial int64, valid bool) {
	var sig string
	n, err := fmt.Sscanf(code, "%[^-]-%d-%s", &prefix, &serial, &sig)
	if err != nil || n != 3 || len(sig) != 8 {
		return "", 0, false
	}
	data := fmt.Sprintf("%s-%d", prefix, serial)
	expected := s.Sign(data)
	return prefix, serial, sig == expected[:8]
}

// GenerateCompactCode creates a compact QR code (no hyphens, base62 serial).
// Format: {prefix}{serial_base62}{hmac_hex[:hmacLen]}
func (s *Signer) GenerateCompactCode(prefix string, serial int64, hmacLen int) string {
	if hmacLen <= 0 || hmacLen > 16 {
		hmacLen = 6
	}
	data := fmt.Sprintf("%s-%d", prefix, serial)
	sig := s.Sign(data)
	return prefix + Base62Encode(uint64(serial)) + sig[:hmacLen]
}

// ValidateCompactCode verifies a compact code by trying known prefixes.
// Returns (prefix, serial, valid). Tries each prefix: strip prefix, extract
// base62 serial (variable length) + fixed-length HMAC suffix.
func (s *Signer) ValidateCompactCode(code string, knownPrefixes []string, hmacLen int) (string, int64, bool) {
	if hmacLen <= 0 || hmacLen > 16 {
		hmacLen = 6
	}
	if len(code) < hmacLen+2 {
		return "", 0, false
	}

	hmacSuffix := code[len(code)-hmacLen:]
	body := code[:len(code)-hmacLen]

	for _, pfx := range knownPrefixes {
		if !strings.HasPrefix(body, pfx) {
			continue
		}
		serialB62 := body[len(pfx):]
		if serialB62 == "" {
			continue
		}
		serial, ok := Base62Decode(serialB62)
		if !ok {
			continue
		}
		data := fmt.Sprintf("%s-%d", pfx, serial)
		expected := s.Sign(data)
		if expected[:hmacLen] == hmacSuffix {
			return pfx, int64(serial), true
		}
	}
	return "", 0, false
}

func Base62Encode(n uint64) string {
	if n == 0 {
		return "0"
	}
	var b []byte
	for n > 0 {
		b = append([]byte{base62Chars[n%62]}, b...)
		n /= 62
	}
	return string(b)
}

func Base62Decode(s string) (uint64, bool) {
	var n uint64
	for _, c := range s {
		idx := strings.IndexRune(base62Chars, c)
		if idx < 0 {
			return 0, false
		}
		n = n*62 + uint64(idx)
	}
	return n, true
}
