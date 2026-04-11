"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";

interface ScanEntry {
  id: string;
  code_id: string;
  batch_id: string;
  serial_number: number;
  ref1: string;
  ref2: string;
  code_status: string;
  scanned_by: string | null;
  scanner_name: string | null;
  scanner_phone: string | null;
  batch_prefix: string;
  product_name: string | null;
  product_sku: string | null;
  product_image_url: string | null;
  campaign_name: string | null;
  scan_type: string;
  points_earned: number;
  bonus_currency: string | null;
  bonus_currency_amount: number;
  promotion_id: string | null;
  promotion_name: string | null;
  latitude: number | null;
  longitude: number | null;
  province: string | null;
  legacy_qr_code_id: number | null;
  legacy_qr_code_serial: string | null;
  created_at: string;
}

interface SuspiciousItem {
  code_id: string;
  ref1: string;
  batch_prefix: string;
  serial_number: number;
  total_scans: number;
  duplicate_count: number;
  first_scanned_at: string;
}

type SortKey = "serial_number" | "ref1" | "product_name" | "scan_type" | "scanner_name" | "points_earned" | "scanned_at";
type SortDir = "asc" | "desc";

const scanTypeStyle: Record<string, string> = {
  success: "bg-[var(--md-success-light)] text-[var(--md-success)]",
  duplicate_self: "bg-amber-100 text-amber-800",
  duplicate_other: "bg-orange-100 text-orange-800",
};

const scanTypeLabel: Record<string, string> = {
  success: "สำเร็จ",
  duplicate_self: "ซ้ำตัวเอง",
  duplicate_other: "ซ้ำคนอื่น",
};

/** Format a UTC/TZ-aware ISO string to local-time yyyy-mm-dd hh:mm:ss */
function fmtLocal(raw: string): string {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d.getTime())) return raw;
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** Resolve a media URL (MinIO proxy or absolute) */
function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `/media/${url}`;
}

function hasV2Code(entry: ScanEntry): boolean {
  return Boolean(entry.code_id || entry.batch_id || entry.batch_prefix || entry.serial_number > 0 || entry.ref1);
}

function primaryCodeLabel(entry: ScanEntry): string {
  if (entry.batch_prefix || entry.serial_number > 0) {
    return `${entry.batch_prefix || "—"} · ${entry.serial_number > 0 ? entry.serial_number.toLocaleString() : "—"}`;
  }
  if (entry.legacy_qr_code_serial) return `V1 Code · ${entry.legacy_qr_code_serial}`;
  if (entry.legacy_qr_code_id != null && entry.legacy_qr_code_id > 0) return `V1 QR ID · ${entry.legacy_qr_code_id.toLocaleString()}`;
  return "—";
}

function secondaryCodeLabel(entry: ScanEntry): string | null {
  if (!hasV2Code(entry) && entry.legacy_qr_code_id != null && entry.legacy_qr_code_id > 0 && entry.legacy_qr_code_serial) {
    return `ID ${entry.legacy_qr_code_id.toLocaleString()}`;
  }
  if (hasV2Code(entry) && entry.legacy_qr_code_serial && (!entry.ref1 || entry.ref1 !== entry.legacy_qr_code_serial)) {
    return `V1 ${entry.legacy_qr_code_serial}`;
  }
  if (hasV2Code(entry) && entry.legacy_qr_code_id != null && entry.legacy_qr_code_id > 0) {
    return `V1 QR ID ${entry.legacy_qr_code_id.toLocaleString()}`;
  }
  return null;
}

function refDisplay(entry: ScanEntry): string {
  if (entry.ref1) return entry.ref1;
  if (entry.legacy_qr_code_serial) return entry.legacy_qr_code_serial;
  if (entry.legacy_qr_code_id != null && entry.legacy_qr_code_id > 0) return `V1-${entry.legacy_qr_code_id}`;
  return "—";
}

function legacyDisplay(entry: ScanEntry): { serial: string | null; qrId: string | null } {
  return {
    serial: entry.legacy_qr_code_serial || null,
    qrId: entry.legacy_qr_code_id != null && entry.legacy_qr_code_id > 0
      ? entry.legacy_qr_code_id.toLocaleString()
      : null,
  };
}

function normalizeSerial(value: string | null | undefined): string {
  return (value || "").trim().toUpperCase();
}

export default function ScanHistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [scanTypeFilter, setScanTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("scanned_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [alerts, setAlerts] = useState<SuspiciousItem[]>([]);
  const [codeDetail, setCodeDetail] = useState<{ id: string; entries: ScanEntry[] } | null>(null);
  const [codeDetailLoading, setCodeDetailLoading] = useState(false);
  const [legacyFallbackActive, setLegacyFallbackActive] = useState(false);
  const limit = 30;
  const legacySerialFilter = (searchParams.get("legacy_serial") || "").trim();
  const normalizedLegacySerialFilter = normalizeSerial(legacySerialFilter);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const requestLimit = legacySerialFilter ? 500 : limit;
      const requestOffset = legacySerialFilter ? 0 : page * limit;
      const params = new URLSearchParams({
        limit: String(requestLimit),
        offset: String(requestOffset),
        sort_by: sortBy,
        sort_dir: sortDir,
      });
      if (statusFilter) params.set("status", statusFilter);
      if (scanTypeFilter) params.set("scan_type", scanTypeFilter);
      if (legacySerialFilter) params.set("legacy_serial", legacySerialFilter);
      const data = await api.get<{ data: ScanEntry[]; total: number }>(`/api/v1/scan-history?${params}`);
      const responseRows = data.data || [];
      const matchesLegacySerial = (entry: ScanEntry) => {
        if (!normalizedLegacySerialFilter) return true;
        return [
          normalizeSerial(entry.legacy_qr_code_serial),
          normalizeSerial(entry.ref1),
        ].includes(normalizedLegacySerialFilter);
      };
      const filteredRows = normalizedLegacySerialFilter
        ? responseRows.filter(matchesLegacySerial)
        : responseRows;
      const serverAlreadyFiltered = normalizedLegacySerialFilter
        ? responseRows.length > 0 && responseRows.every(matchesLegacySerial)
        : false;
      setLegacyFallbackActive(Boolean(normalizedLegacySerialFilter) && !serverAlreadyFiltered);
      setEntries(filteredRows);
      setTotal(normalizedLegacySerialFilter
        ? (serverAlreadyFiltered ? (data.total || filteredRows.length) : filteredRows.length)
        : (data.total || 0));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [page, statusFilter, scanTypeFilter, sortBy, sortDir, legacySerialFilter, limit, normalizedLegacySerialFilter]);

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await api.get<{ data: SuspiciousItem[] }>("/api/v1/scan-history/alerts?limit=20");
      setAlerts(res.data || []);
    } catch { /* ignore */ }
  }, []);

  const openCodeDetail = async (codeId: string) => {
    if (!codeId) return;
    setCodeDetail({ id: codeId, entries: [] });
    setCodeDetailLoading(true);
    try {
      const res = await api.get<{ data: ScanEntry[] }>(`/api/v1/scan-history?code_id=${encodeURIComponent(codeId)}&limit=100&sort_by=scanned_at&sort_dir=asc`);
      setCodeDetail({ id: codeId, entries: res.data || [] });
    } catch { setCodeDetail(null); } finally { setCodeDetailLoading(false); }
  };

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchAlerts();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [fetchAlerts]);

  const handleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortBy !== col) return <span className="ml-1 opacity-30">⇅</span>;
    return <span className="ml-1 text-[var(--md-primary)]">{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  const ThSort = ({ col, label, className = "" }: { col: SortKey; label: string; className?: string }) => (
    <th
      className={`px-4 py-3 text-[11px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase cursor-pointer select-none hover:text-[var(--md-on-surface)] transition-colors whitespace-nowrap ${className}`}
      onClick={() => handleSort(col)}
    >
      {label}<SortIcon col={col} />
    </th>
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const sel = "h-[36px] px-3 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)]";
  const firstEntry = codeDetail?.entries[0];
  const applyLegacySerialFilter = (serial: string) => {
    if (!serial) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("legacy_serial", serial);
    params.delete("code_id");
    router.push(`/scan-history?${params.toString()}`);
    setPage(0);
  };
  const clearLegacySerialFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("legacy_serial");
    router.push(params.toString() ? `/scan-history?${params.toString()}` : "/scan-history");
    setPage(0);
  };

  // Detect browser's UTC offset for display
  const tzOffset = (() => {
    const off = -new Date().getTimezoneOffset();
    const sign = off >= 0 ? "+" : "-";
    const h = Math.floor(Math.abs(off) / 60).toString().padStart(2, "0");
    const m = (Math.abs(off) % 60).toString().padStart(2, "0");
    return `UTC${sign}${h}:${m}`;
  })();

  return (
    <div>
      {/* Alert bar */}
      {alerts.length > 0 && (
        <div className="mb-6 p-4 rounded-[var(--md-radius-lg)] border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700">
          <p className="text-[14px] font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
            ⚠️ รหัสที่น่าสงสัย — มีการสแกนซ้ำ ({alerts.length} รหัส)
          </p>
          <div className="flex flex-wrap gap-2">
            {alerts.map((a) => (
              <button
                key={a.code_id}
                type="button"
                onClick={() => openCodeDetail(a.code_id)}
                className="px-3 py-1 rounded-lg text-[12px] font-mono bg-white dark:bg-gray-800 border border-amber-300 hover:bg-amber-50 transition-colors"
              >
                {a.batch_prefix}-{a.serial_number} · {a.ref1}
                <span className="ml-1.5 text-amber-600">({a.duplicate_count} ซ้ำ)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Header + filters */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Scan History</h1>
          <p className="text-[13px] text-[var(--md-on-surface-variant)] mt-1">
            {total.toLocaleString()} รายการ — คลิกหัวคอลัมน์เพื่อเรียงลำดับ · คลิก REF1 ดูรายละเอียด · คลิกชื่อผู้สแกนไปหน้าลูกค้า
          </p>
          {legacySerialFilter && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[12px] text-blue-700">
              <span>กำลัง filter รหัส</span>
              <span className="font-mono font-semibold">{legacySerialFilter}</span>
              {legacyFallbackActive && (
                <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-blue-600">fallback</span>
              )}
              <button type="button" onClick={clearLegacySerialFilter} className="rounded-full bg-white px-2 py-0.5 text-[11px] hover:bg-blue-100">
                ล้าง
              </button>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className={sel}>
            <option value="">สถานะรหัส: ทั้งหมด</option>
            <option value="scanned">Scanned</option>
            <option value="redeemed">Redeemed</option>
          </select>
          <select value={scanTypeFilter} onChange={(e) => { setScanTypeFilter(e.target.value); setPage(0); }} className={sel}>
            <option value="">ประเภทสแกน: ทั้งหมด</option>
            <option value="success">สำเร็จ</option>
            <option value="duplicate_self">ซ้ำตัวเอง</option>
            <option value="duplicate_other">ซ้ำคนอื่น</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[1100px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <ThSort col="serial_number" label="รหัส / Serial" className="text-left" />
              <ThSort col="product_name" label="สินค้า" className="text-left" />
              <ThSort col="ref1" label="Ref / รหัสอ้างอิง" className="text-left" />
              <th className="px-4 py-3 text-[11px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase text-left whitespace-nowrap">ข้อมูล V1</th>
              <ThSort col="scan_type" label="ประเภท" className="text-left" />
              <ThSort col="scanner_name" label="ผู้สแกน" className="text-left" />
              <ThSort col="points_earned" label="แต้ม" className="text-right" />
              <ThSort col="scanned_at" label={`เวลา (Local ${tzOffset})`} className="text-left" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center">
                <svg className="animate-spin w-5 h-5 mx-auto text-[var(--md-on-surface-variant)]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              </td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-12 text-center text-[var(--md-on-surface-variant)]">ไม่พบข้อมูล</td></tr>
            ) : entries.map((e) => {
              const legacy = legacyDisplay(e);
              const displayPoints = e.scan_type === "success" ? e.points_earned : 0;
              return (
              <tr
                key={e.id}
                className={`border-b border-[var(--md-outline-variant)] last:border-b-0 transition-colors ${
                  e.scan_type !== "success" ? "bg-amber-50/50 hover:bg-amber-50 dark:bg-amber-950/10" : "hover:bg-[var(--md-surface-dim)]"
                }`}
              >
                {/* รหัส / Serial */}
                <td className="px-4 py-3">
                  <div className="min-w-[150px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[13px] font-semibold text-[var(--md-on-surface)]">{primaryCodeLabel(e)}</span>
                      {!hasV2Code(e) && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">V1 legacy</span>
                      )}
                    </div>
                    {secondaryCodeLabel(e) && (
                      <p className="mt-1 font-mono text-[11px] text-[var(--md-on-surface-variant)]">{secondaryCodeLabel(e)}</p>
                    )}
                  </div>
                </td>

                {/* Product — image + name/sku */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2.5">
                    {mediaUrl(e.product_image_url) ? (
                      <div className="w-9 h-9 rounded-[6px] overflow-hidden shrink-0 bg-[var(--md-surface-container)]">
                        <Image
                          src={mediaUrl(e.product_image_url)!}
                          alt={e.product_name || ""}
                          width={36}
                          height={36}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-[6px] shrink-0 bg-[var(--md-surface-container)] flex items-center justify-center text-[16px]">
                        🏷️
                      </div>
                    )}
                    {e.product_name ? (
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-[var(--md-on-surface)] truncate max-w-[160px]">{e.product_name}</p>
                        {e.product_sku && <p className="text-[11px] text-[var(--md-on-surface-variant)] font-mono">{e.product_sku}</p>}
                      </div>
                    ) : (
                      <span className="text-[12px] text-[var(--md-on-surface-variant)]">—</span>
                    )}
                  </div>
                </td>

                {/* Ref1 */}
                <td className="px-4 py-3">
                  {e.code_id ? (
                    <button
                      type="button"
                      onClick={() => openCodeDetail(e.code_id)}
                      className="font-mono text-[12px] text-[var(--md-primary)] hover:underline"
                      title="ดูรายละเอียดทั้งหมดของรหัสนี้"
                    >
                      {refDisplay(e)}
                    </button>
                  ) : (
                    <span className="font-mono text-[12px] text-[var(--md-on-surface-variant)]">
                      {refDisplay(e)}
                    </span>
                  )}
                </td>

                {/* Legacy V1 */}
                <td className="px-4 py-3">
                  {legacy.serial || legacy.qrId ? (
                    <div className="min-w-[140px]">
                      {legacy.serial ? (
                        <button
                          type="button"
                          onClick={() => applyLegacySerialFilter(legacy.serial!)}
                          className="font-mono text-[12px] font-semibold text-[var(--md-primary)] hover:underline"
                          title="filter ว่าใครเคยสแกนรหัสนี้บ้าง"
                        >
                          {legacy.serial}
                        </button>
                      ) : (
                        <p className="font-mono text-[12px] font-semibold text-[var(--md-on-surface)]">—</p>
                      )}
                      <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                        QR ID: {legacy.qrId || "—"}
                      </p>
                    </div>
                  ) : (
                    <span className="text-[12px] text-[var(--md-on-surface-variant)]">—</span>
                  )}
                </td>

                {/* Scan type */}
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-[6px] text-[11px] font-medium ${scanTypeStyle[e.scan_type] || ""}`}>
                    {scanTypeLabel[e.scan_type] || e.scan_type}
                  </span>
                </td>

                {/* Scanner — คลิกไปหน้า customer */}
                <td className="px-4 py-3">
                  {e.scanned_by ? (
                    <button
                      type="button"
                      onClick={() => router.push(`/customers/${e.scanned_by}`)}
                      className="text-[13px] text-[var(--md-primary)] hover:underline text-left"
                      title="ดูข้อมูลลูกค้า"
                    >
                      {e.scanner_name || e.scanned_by}
                    </button>
                  ) : (
                    <span className="text-[13px] text-[var(--md-on-surface-variant)]">—</span>
                  )}
                </td>

                {/* Points + Bonus */}
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-0.5">
                    {displayPoints > 0
                      ? <span className="text-[14px] font-bold text-green-600">+{displayPoints}</span>
                      : <span className="text-[12px] text-[var(--md-on-surface-variant)]">0</span>
                    }
                    {e.bonus_currency && e.bonus_currency_amount > 0 && (
                      <span className="text-[10px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-1.5 py-0.5 rounded whitespace-nowrap">
                        +{e.bonus_currency_amount} {e.bonus_currency}
                      </span>
                    )}
                    {e.promotion_name && (
                      <button
                        type="button"
                        onClick={() => router.push(`/promotions/${e.promotion_id}`)}
                        className="text-[9px] text-[var(--md-primary)] hover:underline truncate max-w-[120px]"
                        title={e.promotion_name}
                      >
                        🏷️ {e.promotion_name}
                      </button>
                    )}
                  </div>
                </td>

                {/* Time — local yyyy-mm-dd hh:mm:ss */}
                <td className="px-4 py-3 font-mono text-[12px] text-[var(--md-on-surface-variant)] whitespace-nowrap">
                  {fmtLocal(e.created_at)}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--md-outline-variant)]">
            <p className="text-[12px] text-[var(--md-on-surface-variant)]">หน้า {page + 1} / {totalPages}</p>
            <div className="flex gap-1.5">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] disabled:opacity-40 hover:bg-[var(--md-surface-container-high)] transition-all">← ก่อนหน้า</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] disabled:opacity-40 hover:bg-[var(--md-surface-container-high)] transition-all">ถัดไป →</button>
            </div>
          </div>
        )}
      </div>

      {/* ──── Detail Modal ──── */}
      {codeDetail !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setCodeDetail(null)}>
          <div
            className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(ev) => ev.stopPropagation()}
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-[var(--md-outline-variant)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-[17px] font-semibold text-[var(--md-on-surface)]">ประวัติการสแกนรหัสนี้</h3>
                  {firstEntry && (
                    <div className="mt-2 space-y-1">
                      {/* Product row */}
                      {firstEntry.product_name && (
                        <div className="flex items-center gap-2">
                          {mediaUrl(firstEntry.product_image_url) ? (
                            <div className="w-10 h-10 rounded-[6px] overflow-hidden bg-[var(--md-surface-container)]">
                              <Image src={mediaUrl(firstEntry.product_image_url)!} alt={firstEntry.product_name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                          ) : null}
                          <div>
                            <p className="text-[13px] font-semibold text-[var(--md-on-surface)]">{firstEntry.product_name}</p>
                            {firstEntry.product_sku && <p className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">{firstEntry.product_sku}</p>}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[12px] text-[var(--md-on-surface-variant)]">
                        <span><span className="font-medium">รหัส:</span> <span className="font-mono">{primaryCodeLabel(firstEntry)}</span></span>
                        {firstEntry.legacy_qr_code_serial && (
                          <span><span className="font-medium">V1 Serial:</span> <span className="font-mono">{firstEntry.legacy_qr_code_serial}</span></span>
                        )}
                        {firstEntry.legacy_qr_code_id != null && firstEntry.legacy_qr_code_id > 0 && (
                          <span><span className="font-medium">V1 QR ID:</span> <span className="font-mono">{firstEntry.legacy_qr_code_id.toLocaleString()}</span></span>
                        )}
                        <span><span className="font-medium">REF1:</span> <span className="font-mono">{refDisplay(firstEntry)}</span></span>
                        {firstEntry.ref2 && <span><span className="font-medium">REF2:</span> <span className="font-mono">{firstEntry.ref2}</span></span>}
                      </div>
                      {firstEntry.campaign_name && (
                        <p className="text-[12px] text-[var(--md-on-surface-variant)]">📢 {firstEntry.campaign_name}</p>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => setCodeDetail(null)} className="p-1.5 rounded-full hover:bg-[var(--md-surface-dim)] text-[var(--md-on-surface-variant)] shrink-0">✕</button>
              </div>
              {!codeDetailLoading && codeDetail.entries.length > 0 && (
                <p className="mt-2 text-[12px] text-[var(--md-on-surface-variant)]">
                  สแกนทั้งหมด {codeDetail.entries.length} ครั้ง
                  {codeDetail.entries.filter(e => e.scan_type !== "success").length > 0 && (
                    <span className="ml-2 text-amber-600">
                      (ซ้ำ {codeDetail.entries.filter(e => e.scan_type !== "success").length} ครั้ง)
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Modal body */}
            <div className="overflow-auto flex-1">
              {codeDetailLoading ? (
                <div className="flex justify-center py-10">
                  <svg className="animate-spin w-7 h-7 text-[var(--md-primary)]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
              ) : codeDetail.entries.length === 0 ? (
                <p className="text-center py-8 text-[var(--md-on-surface-variant)]">ไม่มีประวัติการสแกน</p>
              ) : (
                <div className="divide-y divide-[var(--md-outline-variant)]">
                  {codeDetail.entries.map((e, idx) => (
                    <div
                      key={e.id}
                      className={`px-6 py-4 ${e.scan_type !== "success" ? "bg-amber-50/60 dark:bg-amber-950/10" : ""}`}
                    >
                      {/* Row header */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {(() => {
                          const displayPoints = e.scan_type === "success" ? e.points_earned : 0;
                          return (
                            <>
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-[var(--md-surface-container)] text-[10px] font-bold text-[var(--md-on-surface-variant)]">{idx + 1}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${scanTypeStyle[e.scan_type] || ""}`}>
                          {scanTypeLabel[e.scan_type] || e.scan_type}
                        </span>
                        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
                          {displayPoints > 0
                            ? <span className="text-[13px] font-bold text-green-600">+{displayPoints} แต้ม</span>
                            : <span className="text-[12px] text-[var(--md-on-surface-variant)]">ไม่ได้รับแต้ม</span>
                          }
                          {e.bonus_currency && e.bonus_currency_amount > 0 && (
                            <span className="text-[11px] font-medium text-purple-600 bg-purple-50 dark:bg-purple-950/30 px-2 py-0.5 rounded-full">
                              +{e.bonus_currency_amount} {e.bonus_currency}
                            </span>
                          )}
                        </div>
                            </>
                          );
                        })()}
                      </div>
                      {e.promotion_name && (
                        <div className="mb-3 flex items-center gap-1.5 text-[12px] bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-[6px]">
                          <span>🏷️</span>
                          <span className="font-medium">โปรโมชั่น:</span>
                          <button
                            type="button"
                            onClick={() => { setCodeDetail(null); router.push(`/promotions/${e.promotion_id}`); }}
                            className="font-medium hover:underline"
                          >
                            {e.promotion_name}
                          </button>
                        </div>
                      )}

                      {/* Detail grid */}
                      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-[13px]">
                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-0.5">ผู้สแกน</p>
                          {e.scanned_by ? (
                            <button
                              type="button"
                              onClick={() => { setCodeDetail(null); router.push(`/customers/${e.scanned_by}`); }}
                              className="font-medium text-[var(--md-primary)] hover:underline text-left"
                            >
                              {e.scanner_name || "ไม่ทราบชื่อ"}
                            </button>
                          ) : (
                            <p className="font-medium text-[var(--md-on-surface)]">—</p>
                          )}
                          {e.scanner_phone && (
                            <p className="text-[12px] text-[var(--md-on-surface-variant)]">{e.scanner_phone}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-0.5">
                            วันที่และเวลา <span className="normal-case text-[9px]">(Local {tzOffset})</span>
                          </p>
                          <p className="font-mono text-[12px] text-[var(--md-on-surface)]">{fmtLocal(e.created_at)}</p>
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-0.5">รหัสที่ใช้สแกน</p>
                          <p className="font-mono text-[12px] text-[var(--md-on-surface)]">{primaryCodeLabel(e)}</p>
                          {e.legacy_qr_code_id != null && e.legacy_qr_code_id > 0 && (
                            <p className="text-[11px] text-[var(--md-on-surface-variant)]">V1 QR ID: {e.legacy_qr_code_id.toLocaleString()}</p>
                          )}
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-0.5">สถานที่</p>
                          <p className="text-[var(--md-on-surface)]">{e.province || "ไม่ทราบจังหวัด"}</p>
                        </div>

                        {e.latitude != null && e.longitude != null && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-0.5">พิกัด GPS</p>
                            <a
                              href={`https://www.google.com/maps?q=${e.latitude},${e.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[12px] text-[var(--md-primary)] hover:underline font-mono"
                            >
                              {e.latitude.toFixed(5)}, {e.longitude.toFixed(5)} ↗
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
