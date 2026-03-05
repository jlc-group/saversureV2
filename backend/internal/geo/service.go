package geo

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Service struct {
	db     *pgxpool.Pool
	client *http.Client
}

func NewService(db *pgxpool.Pool) *Service {
	return &Service{
		db:     db,
		client: &http.Client{Timeout: 5 * time.Second},
	}
}

type ReverseGeoResult struct {
	Province    string `json:"province"`
	District    string `json:"district"`
	SubDistrict string `json:"sub_district"`
}

// ReverseGeocode uses OpenStreetMap Nominatim (free, no API key required)
func (s *Service) ReverseGeocode(lat, lng float64) (*ReverseGeoResult, error) {
	url := fmt.Sprintf(
		"https://nominatim.openstreetmap.org/reverse?format=json&lat=%f&lon=%f&zoom=10&accept-language=th",
		lat, lng,
	)

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Set("User-Agent", "SaversureV2/1.0")

	resp, err := s.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("nominatim request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("nominatim returned %d", resp.StatusCode)
	}

	var data struct {
		Address struct {
			State       string `json:"state"`
			County      string `json:"county"`
			City        string `json:"city"`
			Town        string `json:"town"`
			Suburb      string `json:"suburb"`
			Village     string `json:"village"`
			StateDistrict string `json:"state_district"`
		} `json:"address"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
		return nil, fmt.Errorf("decode nominatim: %w", err)
	}

	province := data.Address.State
	district := data.Address.County
	if district == "" {
		district = data.Address.StateDistrict
	}
	subDistrict := data.Address.Suburb
	if subDistrict == "" {
		subDistrict = data.Address.Village
	}

	return &ReverseGeoResult{
		Province:    province,
		District:    district,
		SubDistrict: subDistrict,
	}, nil
}

// UpdateScanProvince fills in province for a scan_history record
func (s *Service) UpdateScanProvince(ctx context.Context, scanID string, lat, lng float64) error {
	result, err := s.ReverseGeocode(lat, lng)
	if err != nil {
		return err
	}

	_, err = s.db.Exec(ctx,
		`UPDATE scan_history SET province = $2 WHERE id = $1`,
		scanID, result.Province,
	)
	return err
}

// BackfillProvinces fills province for scan records that have lat/lng but no province
func (s *Service) BackfillProvinces(ctx context.Context, tenantID string, limit int) (int, error) {
	if limit <= 0 {
		limit = 100
	}

	rows, err := s.db.Query(ctx,
		`SELECT id, latitude, longitude FROM scan_history
		 WHERE tenant_id = $1 AND latitude IS NOT NULL AND longitude IS NOT NULL AND province IS NULL
		 LIMIT $2`,
		tenantID, limit,
	)
	if err != nil {
		return 0, fmt.Errorf("query scans: %w", err)
	}
	defer rows.Close()

	updated := 0
	for rows.Next() {
		var id string
		var lat, lng float64
		if err := rows.Scan(&id, &lat, &lng); err != nil {
			continue
		}

		if err := s.UpdateScanProvince(ctx, id, lat, lng); err != nil {
			continue
		}
		updated++

		time.Sleep(1100 * time.Millisecond) // Nominatim rate limit: 1 req/sec
	}

	return updated, nil
}
