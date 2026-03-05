package codegen

// ExportConfig holds configurable settings for QR code export (ref1, ref2).
// Can be set per tenant (default) and overridden per campaign.
type ExportConfig struct {
	// ref1: customer-facing code for manual entry
	Ref1Length   int    `json:"ref1_length"`    // default 10
	Ref1Format   string `json:"ref1_format"`    // "numeric" | "alphanumeric"
	Ref1MinValue int64  `json:"ref1_min_value"` // min running number for ref1

	// URL for scan
	ScanBaseURL string `json:"scan_base_url"` // e.g. "https://q.wejlc.com"

	// QR URL format
	URLFormat    string `json:"url_format"`     // "query" (?code=X) | "path" (/X)
	CompactCode  bool   `json:"compact_code"`   // true = base62 serial + short HMAC, no hyphens
	HMACLength   int    `json:"hmac_length"`    // 8 (standard) | 6 (compact) — chars of HMAC hex in code
	MaxURLLength int    `json:"max_url_length"` // 0 = unlimited, 36 = 1cm sticker

	// Lot size for printer roll split
	LotSize int64 `json:"lot_size"` // default 10000
}

// DefaultExportConfig returns default config
func DefaultExportConfig() ExportConfig {
	return ExportConfig{
		Ref1Length:   10,
		Ref1Format:   "alphanumeric",
		Ref1MinValue: 1000000000,
		ScanBaseURL:  "https://scan.saversure.com",
		URLFormat:    "query",
		CompactCode:  false,
		HMACLength:   8,
		MaxURLLength: 0,
		LotSize:      10000,
	}
}

// MergeWith merges non-zero values from other into c
func (c ExportConfig) MergeWith(other ExportConfig) ExportConfig {
	if other.Ref1Length > 0 {
		c.Ref1Length = other.Ref1Length
	}
	if other.Ref1Format != "" {
		c.Ref1Format = other.Ref1Format
	}
	if other.Ref1MinValue > 0 {
		c.Ref1MinValue = other.Ref1MinValue
	}
	if other.ScanBaseURL != "" {
		c.ScanBaseURL = other.ScanBaseURL
	}
	if other.URLFormat != "" {
		c.URLFormat = other.URLFormat
	}
	if other.CompactCode {
		c.CompactCode = true
	}
	if other.HMACLength > 0 {
		c.HMACLength = other.HMACLength
	}
	if other.MaxURLLength > 0 {
		c.MaxURLLength = other.MaxURLLength
	}
	if other.LotSize > 0 {
		c.LotSize = other.LotSize
	}
	return c
}
