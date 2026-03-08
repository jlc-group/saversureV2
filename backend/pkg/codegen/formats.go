package codegen

import (
	"encoding/csv"
	"fmt"
	"io"
)

// FactoryExportConfig holds factory-specific export settings
type FactoryExportConfig struct {
	ExportFormat int // 1=flat, 2=multi-4col, 3=multi-Ncol, 4=single-col-no-header
	CodesPerRoll int
	RollsPerFile int
}

// RollRecords holds records grouped per roll
type RollRecords struct {
	RollNumber int
	Records    []ExportRecord
}

// WriteFormat1Flat writes Format 1: flat CSV with header.
// Columns: URL, SerialNumber, Ref1, Ref2, LotNumber, Roll
func WriteFormat1Flat(w io.Writer, rollGroups []RollRecords) {
	cw := csv.NewWriter(w)
	cw.Write([]string{"url", "serial_number", "ref1", "ref2", "lot_number", "roll"})
	for _, rg := range rollGroups {
		for _, r := range rg.Records {
			cw.Write([]string{
				r.URL,
				excelText(fmt.Sprintf("%d", r.SerialNumber)),
				excelText(r.Ref1),
				excelText(r.Ref2),
				r.LotNumber,
				fmt.Sprintf("%d", rg.RollNumber),
			})
		}
	}
	cw.Flush()
}

// WriteFormat2Multi4 writes Format 2: multi-column with fixed 4 rolls side-by-side.
// Each row: URL×4, Serial×4, Ref1×4, Ref2×4, Roll×4 (roll only on first row)
func WriteFormat2Multi4(w io.Writer, rollGroups []RollRecords) {
	writeMultiColumn(w, rollGroups, 4, true)
}

// WriteFormat3MultiN writes Format 3: multi-column with N rolls side-by-side (TAVORN style).
// Each row: URL×N, Serial×N, Ref1×N, Ref2×N, Roll×N (roll on every row)
func WriteFormat3MultiN(w io.Writer, rollGroups []RollRecords, rollsPerFile int) {
	writeMultiColumn(w, rollGroups, rollsPerFile, false)
}

// WriteFormat4SingleNoHeader writes Format 4: single column per code, no header.
// Columns: URL, SerialNumber, Ref1, Ref2, Roll
func WriteFormat4SingleNoHeader(w io.Writer, rollGroups []RollRecords) {
	cw := csv.NewWriter(w)
	for _, rg := range rollGroups {
		for _, r := range rg.Records {
			cw.Write([]string{
				r.URL,
				excelText(fmt.Sprintf("%d", r.SerialNumber)),
				excelText(r.Ref1),
				excelText(r.Ref2),
				fmt.Sprintf("%d", rg.RollNumber),
			})
		}
	}
	cw.Flush()
}

func writeMultiColumn(w io.Writer, rollGroups []RollRecords, cols int, rollOnlyFirstRow bool) {
	cw := csv.NewWriter(w)

	maxLen := 0
	for _, rg := range rollGroups {
		if len(rg.Records) > maxLen {
			maxLen = len(rg.Records)
		}
	}

	// Pad rollGroups to `cols` entries
	for len(rollGroups) < cols {
		rollGroups = append(rollGroups, RollRecords{})
	}

	nCols := cols
	if len(rollGroups) < nCols {
		nCols = len(rollGroups)
	}

	for rowIdx := 0; rowIdx < maxLen; rowIdx++ {
		row := make([]string, 0, nCols*5)

		// URL columns
		for c := 0; c < nCols; c++ {
			if rowIdx < len(rollGroups[c].Records) {
				row = append(row, rollGroups[c].Records[rowIdx].URL)
			} else {
				row = append(row, "")
			}
		}

		// SerialNumber columns
		for c := 0; c < nCols; c++ {
			if rowIdx < len(rollGroups[c].Records) {
				row = append(row, excelText(fmt.Sprintf("%d", rollGroups[c].Records[rowIdx].SerialNumber)))
			} else {
				row = append(row, "")
			}
		}

		// Ref1 columns
		for c := 0; c < nCols; c++ {
			if rowIdx < len(rollGroups[c].Records) {
				row = append(row, excelText(rollGroups[c].Records[rowIdx].Ref1))
			} else {
				row = append(row, "")
			}
		}

		// Ref2 columns
		for c := 0; c < nCols; c++ {
			if rowIdx < len(rollGroups[c].Records) {
				row = append(row, excelText(rollGroups[c].Records[rowIdx].Ref2))
			} else {
				row = append(row, "")
			}
		}

		// Roll columns
		if rollOnlyFirstRow {
			if rowIdx == 0 {
				for c := 0; c < nCols; c++ {
					if len(rollGroups[c].Records) > 0 {
						row = append(row, fmt.Sprintf("%d", rollGroups[c].RollNumber))
					} else {
						row = append(row, "")
					}
				}
			}
		} else {
			for c := 0; c < nCols; c++ {
				if rowIdx < len(rollGroups[c].Records) {
					row = append(row, fmt.Sprintf("%d", rollGroups[c].RollNumber))
				} else {
					row = append(row, "")
				}
			}
		}

		cw.Write(row)
	}
	cw.Flush()
}
