package codegen

const settingsKey = "code_export"

// ConfigFromTenantSettings extracts ExportConfig from tenant settings JSONB
func ConfigFromTenantSettings(settings map[string]any) ExportConfig {
	cfg := DefaultExportConfig()
	if settings == nil {
		return cfg
	}
	if v, ok := settings[settingsKey]; ok && v != nil {
		if m, ok := v.(map[string]any); ok {
			cfg = mergeMapIntoConfig(cfg, m)
		}
	}
	return cfg
}

// ConfigFromCampaignSettings extracts ExportConfig from campaign settings (overrides)
func ConfigFromCampaignSettings(settings map[string]any) ExportConfig {
	cfg := ExportConfig{}
	if settings == nil {
		return cfg
	}
	if v, ok := settings[settingsKey]; ok && v != nil {
		if m, ok := v.(map[string]any); ok {
			cfg = mergeMapIntoConfig(cfg, m)
		}
	}
	return cfg
}

func mergeMapIntoConfig(cfg ExportConfig, m map[string]any) ExportConfig {
	if v, ok := m["ref1_length"]; ok {
		if n, ok := toInt(v); ok {
			cfg.Ref1Length = n
		}
	}
	if v, ok := m["ref1_format"]; ok {
		if s, ok := v.(string); ok {
			cfg.Ref1Format = s
		}
	}
	if v, ok := m["ref1_min_value"]; ok {
		if n, ok := toInt64(v); ok {
			cfg.Ref1MinValue = n
		}
	}
	if v, ok := m["scan_base_url"]; ok {
		if s, ok := v.(string); ok {
			cfg.ScanBaseURL = s
		}
	}
	if v, ok := m["url_format"]; ok {
		if s, ok := v.(string); ok {
			cfg.URLFormat = s
		}
	}
	if v, ok := m["compact_code"]; ok {
		if b, ok := v.(bool); ok {
			cfg.CompactCode = b
		}
	}
	if v, ok := m["hmac_length"]; ok {
		if n, ok := toInt(v); ok {
			cfg.HMACLength = n
		}
	}
	if v, ok := m["max_url_length"]; ok {
		if n, ok := toInt(v); ok {
			cfg.MaxURLLength = n
		}
	}
	if v, ok := m["lot_size"]; ok {
		if n, ok := toInt64(v); ok {
			cfg.LotSize = n
		}
	}
	return cfg
}

func toInt(v any) (int, bool) {
	switch x := v.(type) {
	case int:
		return x, true
	case int64:
		return int(x), true
	case float64:
		return int(x), true
	}
	return 0, false
}

func toInt64(v any) (int64, bool) {
	switch x := v.(type) {
	case int:
		return int64(x), true
	case int64:
		return x, true
	case float64:
		return int64(x), true
	}
	return 0, false
}
