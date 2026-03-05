package codegen

import (
	"encoding/csv"
	"fmt"
	"strings"
)

// RecordsToCSV converts export records to CSV string
func RecordsToCSV(records []ExportRecord) string {
	var b strings.Builder
	w := csv.NewWriter(&b)

	// Header
	_ = w.Write([]string{"serial_number", "code", "ref1", "ref2", "url", "lot_number"})

	for _, r := range records {
		_ = w.Write([]string{
			fmt.Sprintf("%d", r.SerialNumber),
			r.Code,
			excelText(r.Ref1),
			excelText(r.Ref2),
			r.URL,
			r.LotNumber,
		})
	}

	w.Flush()
	return b.String()
}

// excelText forces Excel to treat the value as text
// and prevents scientific notation like 2E+12.
func excelText(v string) string {
	escaped := strings.ReplaceAll(v, `"`, `""`)
	return `="` + escaped + `"`
}
