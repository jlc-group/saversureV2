"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

interface Roll {
  id: string;
  tenant_id: string;
  batch_id: string;
  roll_number: number;
  serial_start: number;
  serial_end: number;
  code_count: number;
  status: string;
  product_id: string | null;
  factory_id: string | null;
  mapped_by: string | null;
  mapped_at: string | null;
  qc_by: string | null;
  qc_at: string | null;
  qc_note: string | null;
  qc_evidence_urls: string[];
  distributed_at: string | null;
  created_at: string;
  batch_prefix: string | null;
  product_name: string | null;
  product_sku: string | null;
  factory_name: string | null;
  mapped_by_name: string | null;
  qc_by_name: string | null;
}

interface Stats {
  pending_print: number;
  printed: number;
  mapped: number;
  qc_approved: number;
  qc_rejected: number;
  distributed: number;
  recalled: number;
  total: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  points_per_scan: number;
}

interface Factory {
  id: string;
  name: string;
  code: string | null;
}

type StatusKey = "pending_print" | "printed" | "mapped" | "qc_approved" | "qc_rejected" | "distributed" | "recalled";

const statusConfig: Record<StatusKey, { label: string; labelTh: string; bg: string; text: string; dot: string; icon: string }> = {
  pending_print: { label: "Pending Print", labelTh: "รอพิมพ์", bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", dot: "bg-gray-400", icon: "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" },
  printed: { label: "Printed", labelTh: "พิมพ์แล้ว", bg: "bg-blue-50 dark:bg-blue-950", text: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500", icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" },
  mapped: { label: "Mapped", labelTh: "Map แล้ว", bg: "bg-amber-50 dark:bg-amber-950", text: "text-amber-600 dark:text-amber-400", dot: "bg-amber-500", icon: "M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM5 15h14v3H5z" },
  qc_approved: { label: "QC Approved", labelTh: "QC ผ่าน", bg: "bg-green-50 dark:bg-green-950", text: "text-green-600 dark:text-green-400", dot: "bg-green-500", icon: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" },
  qc_rejected: { label: "QC Rejected", labelTh: "QC ไม่ผ่าน", bg: "bg-red-50 dark:bg-red-950", text: "text-red-600 dark:text-red-400", dot: "bg-red-500", icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" },
  distributed: { label: "Distributed", labelTh: "จัดส่งแล้ว", bg: "bg-emerald-50 dark:bg-emerald-950", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-600", icon: "M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" },
  recalled: { label: "Recalled", labelTh: "เรียกคืน", bg: "bg-red-100 dark:bg-red-900", text: "text-red-700 dark:text-red-300", dot: "bg-red-600", icon: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" },
};

const pipelineStatuses: StatusKey[] = ["pending_print", "printed", "mapped", "qc_approved", "distributed"];

export default function RollsPage() {
  const searchParams = useSearchParams();
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterBatchId, setFilterBatchId] = useState(searchParams.get("batch_id") || "");

  // Dialog states
  const [mapDialog, setMapDialog] = useState<{ rollIds: string[]; mode: "single" | "bulk" } | null>(null);
  const [mapForm, setMapForm] = useState({ product_id: "", factory_id: "" });
  const [qcDialog, setQcDialog] = useState<Roll | null>(null);
  const [qcForm, setQcForm] = useState({ action: "", note: "", evidence_urls: [] as string[] });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchRolls = useCallback(async () => {
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (filterStatus) params.set("status", filterStatus);
      if (filterBatchId) params.set("batch_id", filterBatchId);
      const data = await api.get<{ data: Roll[]; total: number }>(`/api/v1/rolls?${params}`);
      setRolls(data.data || []);
      setTotal(data.total);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [filterStatus, filterBatchId]);

  const fetchStats = async () => {
    try {
      const data = await api.get<Stats>("/api/v1/rolls/stats");
      setStats(data);
    } catch { /* ignore */ }
  };

  const fetchProducts = async () => {
    try {
      const data = await api.get<{ data: Product[] }>("/api/v1/products?status=active");
      setProducts(data.data || []);
    } catch { /* ignore */ }
  };

  const fetchFactories = async () => {
    try {
      const data = await api.get<{ data: Factory[] }>("/api/v1/factories");
      setFactories(data.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { fetchStats(); fetchProducts(); fetchFactories(); }, []);
  useEffect(() => { setLoading(true); fetchRolls(); }, [fetchRolls]);

  const refresh = () => { fetchRolls(); fetchStats(); setSelectedIds(new Set()); };

  const handleMarkPrinted = async (ids: string[]) => {
    if (!confirm(`Mark ${ids.length} roll(s) as printed?`)) return;
    try {
      await api.post("/api/v1/rolls/bulk-status", { roll_ids: ids, status: "printed" });
      refresh();
    } catch { alert("Failed to update status"); }
  };

  const handleMarkDistributed = async (ids: string[]) => {
    if (!confirm(`Mark ${ids.length} roll(s) as distributed?`)) return;
    try {
      await api.post("/api/v1/rolls/bulk-status", { roll_ids: ids, status: "distributed" });
      refresh();
    } catch { alert("Failed to update status"); }
  };

  const handleOpenMapDialog = (ids: string[], mode: "single" | "bulk") => {
    setMapForm({ product_id: "", factory_id: "" });
    setMapDialog({ rollIds: ids, mode });
  };

  const handleSubmitMap = async () => {
    if (!mapForm.product_id) return alert("Please select a product");
    setSubmitting(true);
    try {
      if (mapDialog!.mode === "bulk") {
        await api.post("/api/v1/rolls/bulk-map", {
          roll_ids: mapDialog!.rollIds,
          product_id: mapForm.product_id,
          factory_id: mapForm.factory_id || undefined,
        });
      } else {
        await api.post(`/api/v1/rolls/${mapDialog!.rollIds[0]}/map`, {
          product_id: mapForm.product_id,
          factory_id: mapForm.factory_id || undefined,
        });
      }
      setMapDialog(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to map product");
    } finally { setSubmitting(false); }
  };

  const handleUnmap = async (id: string) => {
    if (!confirm("Remove product mapping from this roll?")) return;
    try {
      await api.post(`/api/v1/rolls/${id}/unmap`, {});
      refresh();
    } catch { alert("Failed to unmap"); }
  };

  const handleOpenQcDialog = (roll: Roll) => {
    setQcForm({ action: "", note: "", evidence_urls: [] });
    setQcDialog(roll);
  };

  const handleUploadEvidence = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.upload("/api/v1/upload/image", file, "file");
      setQcForm((prev) => ({ ...prev, evidence_urls: [...prev.evidence_urls, result.url] }));
    } catch {
      alert("Failed to upload file");
    } finally { setUploading(false); }
  };

  const handleSubmitQc = async (action: "approve" | "reject") => {
    setSubmitting(true);
    try {
      await api.post(`/api/v1/rolls/${qcDialog!.id}/qc`, {
        action,
        evidence_urls: qcForm.evidence_urls,
        note: qcForm.note,
      });
      setQcDialog(null);
      refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "QC review failed");
    } finally { setSubmitting(false); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === rolls.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(rolls.map((r) => r.id)));
    }
  };

  const selectedRolls = rolls.filter((r) => selectedIds.has(r.id));
  const canBulkPrint = selectedRolls.length > 0 && selectedRolls.every((r) => r.status === "pending_print");
  const canBulkMap = selectedRolls.length > 0 && selectedRolls.every((r) => r.status === "printed" || r.status === "qc_rejected");
  const canBulkDistribute = selectedRolls.length > 0 && selectedRolls.every((r) => r.status === "qc_approved");

  const fieldClass = "w-full h-[44px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  const formatDate = (d: string | null) => d ? new Date(d).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Roll Management</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">จัดการม้วนสติ๊กเกอร์ QR Code — Map Product, QC, จัดส่ง</p>
        </div>
      </div>

      {/* Pipeline View */}
      {stats && (
        <div className="grid grid-cols-5 gap-3 mb-6">
          {pipelineStatuses.map((status, i) => {
            const cfg = statusConfig[status];
            const count = stats[status];
            const isActive = filterStatus === status;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(isActive ? "" : status)}
                className={`relative flex flex-col items-center p-4 rounded-[var(--md-radius-lg)] border-2 transition-all duration-200 ${
                  isActive
                    ? `${cfg.bg} border-current ${cfg.text}`
                    : "bg-[var(--md-surface)] border-transparent hover:border-[var(--md-outline-variant)]"
                }`}
              >
                <span className={`text-[28px] font-semibold ${isActive ? cfg.text : "text-[var(--md-on-surface)]"}`}>
                  {count}
                </span>
                <span className={`text-[11px] font-medium mt-1 ${isActive ? cfg.text : "text-[var(--md-on-surface-variant)]"}`}>
                  {cfg.labelTh}
                </span>
                {i < pipelineStatuses.length - 1 && (
                  <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-[var(--md-outline-variant)] text-[16px] z-10">→</span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Extra status badges for rejected + recalled */}
      {stats && (stats.qc_rejected > 0 || stats.recalled > 0) && (
        <div className="flex gap-3 mb-6">
          {stats.qc_rejected > 0 && (
            <button
              onClick={() => setFilterStatus(filterStatus === "qc_rejected" ? "" : "qc_rejected")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--md-radius-sm)] text-[13px] font-medium border-2 transition-all ${
                filterStatus === "qc_rejected"
                  ? "bg-red-50 dark:bg-red-950 border-red-300 text-red-600"
                  : "bg-[var(--md-surface)] border-transparent text-red-500 hover:border-red-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              QC ไม่ผ่าน: {stats.qc_rejected}
            </button>
          )}
          {stats.recalled > 0 && (
            <button
              onClick={() => setFilterStatus(filterStatus === "recalled" ? "" : "recalled")}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-[var(--md-radius-sm)] text-[13px] font-medium border-2 transition-all ${
                filterStatus === "recalled"
                  ? "bg-red-100 dark:bg-red-900 border-red-400 text-red-700"
                  : "bg-[var(--md-surface)] border-transparent text-red-600 hover:border-red-200"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-600" />
              เรียกคืน: {stats.recalled}
            </button>
          )}
          {filterStatus && (
            <button
              onClick={() => setFilterStatus("")}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] transition-all"
            >
              ✕ ล้าง filter
            </button>
          )}
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)]">
          <span className="text-[13px] font-medium text-[var(--md-primary)]">
            เลือก {selectedIds.size} ม้วน
          </span>
          {canBulkPrint && (
            <button onClick={() => handleMarkPrinted([...selectedIds])} className="h-[32px] px-4 text-[12px] font-medium bg-blue-600 text-white rounded-[var(--md-radius-sm)] hover:bg-blue-700">
              Mark Printed
            </button>
          )}
          {canBulkMap && (
            <button onClick={() => handleOpenMapDialog([...selectedIds], "bulk")} className="h-[32px] px-4 text-[12px] font-medium bg-amber-600 text-white rounded-[var(--md-radius-sm)] hover:bg-amber-700">
              Map Product
            </button>
          )}
          {canBulkDistribute && (
            <button onClick={() => handleMarkDistributed([...selectedIds])} className="h-[32px] px-4 text-[12px] font-medium bg-emerald-600 text-white rounded-[var(--md-radius-sm)] hover:bg-emerald-700">
              Mark Distributed
            </button>
          )}
          <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-[12px] text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)]">
            ยกเลิกเลือก
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="w-10 px-3 py-3.5">
                <input type="checkbox" checked={rolls.length > 0 && selectedIds.size === rolls.length} onChange={toggleSelectAll} className="w-4 h-4 accent-[var(--md-primary)]" />
              </th>
              <th className="text-left px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Roll #</th>
              <th className="text-left px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Serial Range</th>
              <th className="text-left px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Product</th>
              <th className="text-left px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Factory</th>
              <th className="text-left px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-left px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Mapped / QC</th>
              <th className="text-right px-4 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center">
                <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Loading...
                </div>
              </td></tr>
            ) : rolls.length === 0 ? (
              <tr><td colSpan={8} className="px-6 py-12 text-center">
                <div className="text-[var(--md-on-surface-variant)]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg>
                  <p className="text-[14px]">{filterStatus ? "ไม่มี roll ในสถานะนี้" : "ยังไม่มี roll — สร้าง Batch ใหม่เพื่อสร้าง rolls"}</p>
                </div>
              </td></tr>
            ) : rolls.map((r) => {
              const sc = statusConfig[r.status as StatusKey] || statusConfig.pending_print;
              return (
                <tr key={r.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150">
                  <td className="w-10 px-3 py-3">
                    <input type="checkbox" checked={selectedIds.has(r.id)} onChange={() => toggleSelect(r.id)} className="w-4 h-4 accent-[var(--md-primary)]" />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[14px] font-medium text-[var(--md-on-surface)]">
                      {r.batch_prefix || "?"} #{r.roll_number}
                    </p>
                    <p className="text-[11px] text-[var(--md-on-surface-variant)]">{r.code_count.toLocaleString()} codes</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[13px] text-[var(--md-on-surface)]">
                      {r.serial_start.toLocaleString()} – {r.serial_end.toLocaleString()}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    {r.product_name ? (
                      <div>
                        <p className="text-[13px] text-[var(--md-on-surface)]">{r.product_name}</p>
                        {r.product_sku && <p className="text-[11px] text-[var(--md-on-surface-variant)] font-mono">{r.product_sku}</p>}
                      </div>
                    ) : (
                      <span className="text-[13px] text-[var(--md-on-surface-variant)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[13px] text-[var(--md-on-surface-variant)]">
                    {r.factory_name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                      {sc.labelTh}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r.mapped_by_name && (
                      <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                        Map: {r.mapped_by_name} · {formatDate(r.mapped_at)}
                      </p>
                    )}
                    {r.qc_by_name && (
                      <p className="text-[11px] text-[var(--md-on-surface-variant)]">
                        QC: {r.qc_by_name} · {formatDate(r.qc_at)}
                      </p>
                    )}
                    {r.qc_note && (
                      <p className="text-[11px] text-[var(--md-on-surface-variant)] italic mt-0.5 truncate max-w-[160px]" title={r.qc_note}>
                        &quot;{r.qc_note}&quot;
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-end">
                      {r.status === "pending_print" && (
                        <ActionBtn label="Mark Printed" color="blue" onClick={() => handleMarkPrinted([r.id])} />
                      )}
                      {(r.status === "printed" || r.status === "qc_rejected") && (
                        <ActionBtn label="Map Product" color="amber" onClick={() => handleOpenMapDialog([r.id], "single")} />
                      )}
                      {r.status === "mapped" && (
                        <>
                          <ActionBtn label="QC Review" color="green" onClick={() => handleOpenQcDialog(r)} />
                          <ActionBtn label="Unmap" color="gray" onClick={() => handleUnmap(r.id)} />
                        </>
                      )}
                      {r.status === "qc_approved" && (
                        <ActionBtn label="Distribute" color="emerald" onClick={() => handleMarkDistributed([r.id])} />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {total > rolls.length && (
          <div className="px-6 py-3 border-t border-[var(--md-outline-variant)] text-center">
            <span className="text-[13px] text-[var(--md-on-surface-variant)]">
              แสดง {rolls.length} จาก {total} rolls
            </span>
          </div>
        )}
      </div>

      {/* Map Product Dialog */}
      {mapDialog && (
        <DialogOverlay onClose={() => setMapDialog(null)}>
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] p-6 w-[480px] max-w-full md-elevation-3">
            <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-1">Map Product</h2>
            <p className="text-[13px] text-[var(--md-on-surface-variant)] mb-5">
              {mapDialog.mode === "bulk" ? `เลือก ${mapDialog.rollIds.length} ม้วน` : "เลือกสินค้าและโรงงานสำหรับม้วนนี้"}
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 uppercase tracking-[0.4px]">Product *</label>
                <select value={mapForm.product_id} onChange={(e) => setMapForm({ ...mapForm, product_id: e.target.value })} className={fieldClass}>
                  <option value="">-- เลือกสินค้า --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku}) — {p.points_per_scan} pts</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 uppercase tracking-[0.4px]">Factory (optional)</label>
                <select value={mapForm.factory_id} onChange={(e) => setMapForm({ ...mapForm, factory_id: e.target.value })} className={fieldClass}>
                  <option value="">— ไม่ระบุ —</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}{f.code ? ` (${f.code})` : ""}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setMapDialog(null)} className="h-[40px] px-5 text-[14px] font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] rounded-[var(--md-radius-xl)] transition-all">
                Cancel
              </button>
              <button onClick={handleSubmitMap} disabled={submitting || !mapForm.product_id} className="h-[40px] px-6 text-[14px] font-medium bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] hover:bg-[var(--md-primary-dark)] disabled:opacity-50 transition-all">
                {submitting ? "Mapping..." : "Confirm Mapping"}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}

      {/* QC Review Dialog */}
      {qcDialog && (
        <DialogOverlay onClose={() => setQcDialog(null)}>
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] p-6 w-[540px] max-w-full md-elevation-3">
            <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-1">QC Review</h2>
            <p className="text-[13px] text-[var(--md-on-surface-variant)] mb-5">ตรวจสอบการ mapping ของม้วนนี้</p>

            {/* Roll info */}
            <div className="grid grid-cols-2 gap-3 p-4 bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] mb-5">
              <InfoRow label="Roll #" value={`${qcDialog.batch_prefix || "?"} #${qcDialog.roll_number}`} />
              <InfoRow label="Serial" value={`${qcDialog.serial_start.toLocaleString()} – ${qcDialog.serial_end.toLocaleString()}`} />
              <InfoRow label="Product" value={qcDialog.product_name || "—"} />
              <InfoRow label="Factory" value={qcDialog.factory_name || "—"} />
              <InfoRow label="Mapped by" value={qcDialog.mapped_by_name || "—"} />
              <InfoRow label="Mapped at" value={formatDate(qcDialog.mapped_at)} />
            </div>

            {/* Evidence upload */}
            <div className="mb-4">
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 uppercase tracking-[0.4px]">หลักฐาน (รูปถ่าย) *</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {qcForm.evidence_urls.map((url, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-[var(--md-radius-sm)] overflow-hidden border border-[var(--md-outline-variant)]">
                    <img src={url} alt={`evidence-${i}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => setQcForm((prev) => ({ ...prev, evidence_urls: prev.evidence_urls.filter((_, j) => j !== i) }))}
                      className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-bl"
                    >✕</button>
                  </div>
                ))}
                <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] cursor-pointer hover:border-[var(--md-primary)] transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUploadEvidence(e.target.files[0])} />
                  {uploading ? (
                    <svg className="animate-spin w-5 h-5 text-[var(--md-on-surface-variant)]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[var(--md-on-surface-variant)]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                  )}
                </label>
              </div>
            </div>

            {/* Note */}
            <div className="mb-5">
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 uppercase tracking-[0.4px]">หมายเหตุ</label>
              <textarea
                value={qcForm.note}
                onChange={(e) => setQcForm({ ...qcForm, note: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 resize-none"
                placeholder="หมายเหตุ QC (บังคับกรณี reject)"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button onClick={() => setQcDialog(null)} className="h-[40px] px-5 text-[14px] font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] rounded-[var(--md-radius-xl)] transition-all">
                Cancel
              </button>
              <button
                onClick={() => handleSubmitQc("reject")}
                disabled={submitting || !qcForm.note}
                className="h-[40px] px-5 text-[14px] font-medium bg-[var(--md-error)] text-white rounded-[var(--md-radius-xl)] hover:opacity-90 disabled:opacity-50 transition-all"
              >
                Reject
              </button>
              <button
                onClick={() => handleSubmitQc("approve")}
                disabled={submitting || qcForm.evidence_urls.length === 0}
                className="h-[40px] px-6 text-[14px] font-medium bg-green-600 text-white rounded-[var(--md-radius-xl)] hover:bg-green-700 disabled:opacity-50 transition-all"
              >
                {submitting ? "Processing..." : "Approve"}
              </button>
            </div>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900",
    amber: "text-amber-600 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950 dark:hover:bg-amber-900",
    green: "text-green-600 bg-green-50 hover:bg-green-100 dark:bg-green-950 dark:hover:bg-green-900",
    emerald: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900",
    gray: "text-gray-600 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700",
    red: "text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-950 dark:hover:bg-red-900",
  };
  return (
    <button
      onClick={onClick}
      className={`h-[28px] px-3 text-[11px] font-medium rounded-[var(--md-radius-sm)] transition-all duration-200 ${colorMap[color] || colorMap.gray}`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-[var(--md-on-surface-variant)] uppercase tracking-[0.4px]">{label}</p>
      <p className="text-[13px] text-[var(--md-on-surface)] font-medium mt-0.5">{value}</p>
    </div>
  );
}

function DialogOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
