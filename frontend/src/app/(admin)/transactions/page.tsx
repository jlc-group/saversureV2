"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Transaction {
  id: string;
  user_id: string;
  reward_id: string;
  reward_name: string | null;
  status: string;
  tracking: string | null;
  expires_at: string;
  created_at: string;
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-[var(--md-warning-light)]", text: "text-[var(--md-warning)]" },
  CONFIRMED: { bg: "bg-[var(--md-info-light)]", text: "text-[var(--md-info)]" },
  SHIPPING: { bg: "bg-[#fff3e0]", text: "text-[#e65100]" },
  SHIPPED: { bg: "bg-[#e8f5e9]", text: "text-[#2e7d32]" },
  COMPLETED: { bg: "bg-[var(--md-success-light)]", text: "text-[var(--md-success)]" },
  EXPIRED: { bg: "bg-[var(--md-surface-container)]", text: "text-[var(--md-on-surface-variant)]" },
  CANCELLED: { bg: "bg-[var(--md-error-light)]", text: "text-[var(--md-error)]" },
};

const nextStatus: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["SHIPPED"],
  SHIPPED: ["COMPLETED"],
};

export default function TransactionsPage() {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);
  const limit = 30;

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(page * limit) });
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ data: Transaction[]; total: number }>(`/api/v1/redeem-transactions?${params}`);
      setTxns(data.data || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleUpdateStatus = async (id: string, status: string) => {
    let tracking = "";
    if (status === "SHIPPING" || status === "SHIPPED") {
      tracking = prompt("Tracking number (optional):") || "";
    }
    setActionId(id);
    try {
      await api.patch(`/api/v1/redeem-transactions/${id}`, { status, tracking });
      fetchData();
    } catch { alert("Failed to update"); } finally { setActionId(null); }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const fieldClass = "h-[36px] px-3 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)]";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Transactions</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">{total.toLocaleString()} redeem transactions</p>
        </div>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }} className={fieldClass}>
          <option value="">All Status</option>
          {Object.keys(statusStyle).map((s) => (<option key={s} value={s}>{s}</option>))}
        </select>
      </div>

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Reward</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">User</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Tracking</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Date</th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]"><svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
            ) : txns.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">No transactions found</td></tr>
            ) : txns.map((t) => {
              const s = statusStyle[t.status] || statusStyle.PENDING;
              const actions = nextStatus[t.status] || [];
              return (
                <tr key={t.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors">
                  <td className="px-5 py-3 text-[13px] font-medium text-[var(--md-on-surface)]">{t.reward_name || t.reward_id.slice(0, 8)}</td>
                  <td className="px-5 py-3 font-mono text-[11px] text-[var(--md-on-surface-variant)]">{t.user_id.slice(0, 8)}...</td>
                  <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${s.bg} ${s.text}`}>{t.status}</span></td>
                  <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">{t.tracking || "—"}</td>
                  <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">{new Date(t.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-end">
                      {actions.map((a) => (
                        <button
                          key={a}
                          onClick={() => handleUpdateStatus(t.id, a)}
                          disabled={actionId === t.id}
                          className={`h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] transition-all disabled:opacity-50 ${
                            a === "CANCELLED"
                              ? "text-[var(--md-error)] bg-[var(--md-error-light)] hover:opacity-80"
                              : "text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80"
                          }`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
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
