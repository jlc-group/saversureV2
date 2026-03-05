"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface ScanEntry {
  id: string;
  batch_id: string;
  serial_number: number;
  ref1: string;
  ref2: string;
  status: string;
  scanned_by: string | null;
  batch_prefix: string;
  campaign_name: string | null;
  created_at: string;
}

const statusStyle: Record<string, string> = {
  scanned: "bg-[var(--md-info-light)] text-[var(--md-info)]",
  redeemed: "bg-[var(--md-success-light)] text-[var(--md-success)]",
  expired: "bg-[var(--md-error-light)] text-[var(--md-error)]",
};

export default function ScanHistoryPage() {
  const [entries, setEntries] = useState<ScanEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 30;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ data: ScanEntry[]; total: number }>(`/api/v1/scan-history?${params}`);
      setEntries(data.data || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fieldClass = "h-[36px] px-3 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)]";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Scan History</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">{total.toLocaleString()} total scans</p>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className={fieldClass}>
          <option value="">All Status</option>
          <option value="scanned">Scanned</option>
          <option value="redeemed">Redeemed</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Prefix</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Serial</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Ref1</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Campaign</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Scanned At</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]"><svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">No scans found</td></tr>
            ) : entries.map((e) => (
              <tr key={e.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors">
                <td className="px-5 py-3 font-mono text-[13px] font-medium text-[var(--md-on-surface)]">{e.batch_prefix}</td>
                <td className="px-5 py-3 text-[13px] text-[var(--md-on-surface)]">{e.serial_number.toLocaleString()}</td>
                <td className="px-5 py-3 font-mono text-[12px] text-[var(--md-on-surface-variant)]">{e.ref1?.slice(0, 12) || "—"}</td>
                <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${statusStyle[e.status] || ""}`}>{e.status}</span></td>
                <td className="px-5 py-3 text-[13px] text-[var(--md-on-surface-variant)]">{e.campaign_name || "—"}</td>
                <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--md-outline-variant)]">
            <p className="text-[12px] text-[var(--md-on-surface-variant)]">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-1.5">
              <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] disabled:opacity-40 hover:bg-[var(--md-surface-container-high)] transition-all">Prev</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] disabled:opacity-40 hover:bg-[var(--md-surface-container-high)] transition-all">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
