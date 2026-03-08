package codegen

import (
	"archive/zip"
	"encoding/csv"
	"fmt"
	"io"
	"strings"
)

var csvHeader = []string{"serial_number", "code", "ref1", "ref2", "url", "lot_number"}

// RecordsToCSV converts export records to CSV string (in-memory, for small batches)
func RecordsToCSV(records []ExportRecord) string {
	var b strings.Builder
	w := csv.NewWriter(&b)
	_ = w.Write(csvHeader)
	for _, r := range records {
		_ = w.Write(recordToRow(r))
	}
	w.Flush()
	return b.String()
}

// WriteCSVHeader writes the CSV header to writer
func WriteCSVHeader(w *csv.Writer) {
	_ = w.Write(csvHeader)
}

// WriteCSVRecord writes a single record row
func WriteCSVRecord(w *csv.Writer, r ExportRecord) {
	_ = w.Write(recordToRow(r))
}

// NewCSVWriter creates a csv.Writer for the given io.Writer
func NewCSVWriter(w io.Writer) *csv.Writer {
	return csv.NewWriter(w)
}

func recordToRow(r ExportRecord) []string {
	return []string{
		fmt.Sprintf("%d", r.SerialNumber),
		r.Code,
		excelText(r.Ref1),
		excelText(r.Ref2),
		r.URL,
		r.LotNumber,
	}
}

func excelText(v string) string {
	escaped := strings.ReplaceAll(v, `"`, `""`)
	return `="` + escaped + `"`
}

// ZipExporter writes multiple CSV files into a ZIP stream.
type ZipExporter struct {
	zw           *zip.Writer
	csvW         *csv.Writer
	currentFile  io.Writer
	CodesPerFile int64
}

func NewZipExporter(w io.Writer, codesPerFile int64) *ZipExporter {
	if codesPerFile <= 0 {
		codesPerFile = 40000
	}
	return &ZipExporter{
		zw:           zip.NewWriter(w),
		CodesPerFile: codesPerFile,
	}
}

func (z *ZipExporter) StartFile(name string) error {
	fw, err := z.zw.Create(name)
	if err != nil {
		return err
	}
	z.currentFile = fw
	z.csvW = csv.NewWriter(fw)
	return nil
}

// StartFileWithHeader creates a new file and writes the standard CSV header
func (z *ZipExporter) StartFileWithHeader(name string) error {
	if err := z.StartFile(name); err != nil {
		return err
	}
	WriteCSVHeader(z.csvW)
	return nil
}

func (z *ZipExporter) WriteRecord(r ExportRecord) {
	WriteCSVRecord(z.csvW, r)
}

// WriteRaw allows writing arbitrary formatted data to the current zip file entry.
func (z *ZipExporter) WriteRaw(fn func(w io.Writer)) {
	if z.csvW != nil {
		z.csvW.Flush()
	}
	fn(z.currentFile)
}




func (z *ZipExporter) FlushCSV() {
	if z.csvW != nil {
		z.csvW.Flush()
	}
}

func (z *ZipExporter) Close() error {
	return z.zw.Close()
}
