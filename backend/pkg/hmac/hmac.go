package hmac

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

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

// GenerateCode creates a QR code string from batch prefix, serial, and signs it.
// Format: {prefix}-{serial}-{signature[:8]}
func (s *Signer) GenerateCode(prefix string, serial int64) string {
	data := fmt.Sprintf("%s-%d", prefix, serial)
	sig := s.Sign(data)
	return fmt.Sprintf("%s-%s", data, sig[:8])
}

// ValidateCode verifies a QR code string and extracts its components.
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
