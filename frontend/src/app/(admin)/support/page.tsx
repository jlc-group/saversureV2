"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface SupportCase {
  id: string;
  tenant_id: string;
  user_id: string;
  subject: string;
  category: "general" | "scan" | "reward" | "account" | "other";
  status: "open" | "in_progress" | "waiting_customer" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  user_email: string | null;
  message_count: number;
}

interface Message {
  id: string;
  case_id: string;
  sender_id: string;
  sender_role: "customer" | "admin";
  message: string;
  image_url: string | null;
  created_at: string;
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  open: { bg: "bg-[var(--md-info-light)]", text: "text-[var(--md-info)]" },
  in_progress: { bg: "bg-[var(--md-primary-light)]", text: "text-[var(--md-primary)]" },
  waiting_customer: { bg: "bg-[var(--md-warning-light)]", text: "text-[var(--md-warning)]" },
  resolved: { bg: "bg-[var(--md-success-light)]", text: "text-[var(--md-success)]" },
  closed: { bg: "bg-[var(--md-surface-container)]", text: "text-[var(--md-on-surface-variant)]" },
};

const priorityStyle: Record<string, { bg: string; text: string }> = {
  low: { bg: "bg-[var(--md-surface-container)]", text: "text-[var(--md-on-surface-variant)]" },
  normal: { bg: "bg-[var(--md-info-light)]", text: "text-[var(--md-info)]" },
  high: { bg: "bg-[var(--md-warning-light)]", text: "text-[var(--md-warning)]" },
  urgent: { bg: "bg-[var(--md-error-light)]", text: "text-[var(--md-error)]" },
};

const categoryStyle: Record<string, string> = {
  general: "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]",
  scan: "bg-[var(--md-info-light)] text-[var(--md-info)]",
  reward: "bg-[var(--md-primary-light)] text-[var(--md-primary)]",
  account: "bg-[var(--md-warning-light)] text-[var(--md-warning)]",
  other: "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]",
};

const statusFilters = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "In Progress", value: "in_progress" },
  { label: "Resolved", value: "resolved" },
  { label: "Closed", value: "closed" },
];

export default function SupportPage() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<{ case: SupportCase; messages: Message[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      const data = await api.get<{ data: SupportCase[]; total: number }>(`/api/v1/support/cases?${params}`);
      setCases(data.data || []);
      setTotal(data.total || 0);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const data = await api.get<{ case: SupportCase; messages: Message[] }>(`/api/v1/support/cases/${id}`);
      setDetail(data);
    } catch { /* ignore */ } finally { setDetailLoading(false); }
  };

  useEffect(() => { fetchCases(); }, [statusFilter]);

  useEffect(() => {
    if (selectedId) fetchDetail(selectedId);
    else setDetail(null);
  }, [selectedId]);

  const handleBack = () => {
    setSelectedId(null);
    setDetail(null);
    fetchCases();
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/v1/support/cases/${id}`, { status });
      if (selectedId === id) fetchDetail(id);
      fetchCases();
    } catch { alert("Failed to update"); } finally { setActionId(null); }
  };

  const handleUpdatePriority = async (id: string, priority: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/v1/support/cases/${id}`, { priority });
      if (selectedId === id) fetchDetail(id);
      fetchCases();
    } catch { alert("Failed to update"); } finally { setActionId(null); }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId || !replyText.trim()) return;
    setReplySubmitting(true);
    try {
      await api.post(`/api/v1/support/cases/${selectedId}/reply`, { message: replyText.trim() });
      setReplyText("");
      fetchDetail(selectedId);
      fetchCases();
    } catch { alert("Failed to send reply"); } finally { setReplySubmitting(false); }
  };

  if (selectedId) {
    const c = detail?.case;
    const s = c ? (statusStyle[c.status] || statusStyle.open) : { bg: "", text: "" };
    const p = c ? (priorityStyle[c.priority] || priorityStyle.normal) : { bg: "", text: "" };

    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={handleBack} className="h-[40px] px-3 text-[14px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] hover:bg-[var(--md-surface-container-high)] transition-all flex items-center gap-2">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
            Back
          </button>
          <div className="flex-1">
            <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">{c?.subject || "Loading..."}</h1>
            <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">{c ? `${c.user_email || "—"} · ${new Date(c.created_at).toLocaleString()}` : ""}</p>
          </div>
        </div>

        {c && (
          <>
            <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${categoryStyle[c.category] || categoryStyle.other}`}>{c.category}</span>
                <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${s.bg} ${s.text}`}>{c.status.replace("_", " ")}</span>
                <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${p.bg} ${p.text}`}>{c.priority}</span>
                {c.resolved_at && <span className="text-[12px] text-[var(--md-on-surface-variant)]">Resolved {new Date(c.resolved_at).toLocaleString()}</span>}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["open", "in_progress", "waiting_customer", "resolved", "closed"].map((st) => (
                  <button key={st} onClick={() => handleUpdateStatus(c.id, st)} disabled={actionId === c.id || c.status === st} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] disabled:opacity-40 hover:bg-[var(--md-surface-container-high)] transition-all">
                    {st.replace("_", " ")}
                  </button>
                ))}
                {["low", "normal", "high", "urgent"].map((pr) => (
                  <button key={pr} onClick={() => handleUpdatePriority(c.id, pr)} disabled={actionId === c.id || c.priority === pr} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] disabled:opacity-40 hover:bg-[var(--md-surface-container-high)] transition-all">
                    {pr}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden flex flex-col" style={{ minHeight: 400 }}>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[400px]">
                {detailLoading ? (
                  <div className="flex justify-center py-12">
                    <svg className="animate-spin w-5 h-5 text-[var(--md-on-surface-variant)]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  </div>
                ) : !detail || detail.messages.length === 0 ? (
                  <div className="text-center py-12 text-[var(--md-on-surface-variant)]">No messages yet</div>
                ) : (
                  detail.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] px-4 py-2.5 rounded-[var(--md-radius-lg)] ${m.sender_role === "admin" ? "bg-[var(--md-primary)] text-white" : "bg-[var(--md-surface-container)] text-[var(--md-on-surface)]"}`}>
                        <p className="text-[13px] whitespace-pre-wrap">{m.message}</p>
                        {m.image_url && <img src={m.image_url} alt="" className="mt-2 rounded-[var(--md-radius-sm)] max-w-full" />}
                        <p className={`text-[11px] mt-1 ${m.sender_role === "admin" ? "text-white/80" : "text-[var(--md-on-surface-variant)]"}`}>{new Date(m.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {!detailLoading && c.status !== "closed" && (
                <form onSubmit={handleReply} className="p-4 border-t border-[var(--md-outline-variant)]">
                  <div className="flex gap-2">
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your reply..." rows={2} className="flex-1 min-h-[48px] px-4 py-3 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none resize-none focus:border-[var(--md-primary)] transition-all" />
                    <button type="submit" disabled={replySubmitting || !replyText.trim()} className="h-[48px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-sm)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] disabled:opacity-50 transition-all">
                      Send
                    </button>
                  </div>
                </form>
              )}
            </div>
          </>
        )}

        {!c && detailLoading && (
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-12 flex justify-center">
            <svg className="animate-spin w-5 h-5 text-[var(--md-on-surface-variant)]" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Support Cases</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">{total.toLocaleString()} cases</p>
        </div>
      </div>

      <div className="flex gap-1.5 mb-6">
        {statusFilters.map((f) => (
          <button key={f.value} onClick={() => setStatusFilter(f.value)} className={`h-[36px] px-4 text-[13px] font-medium rounded-[var(--md-radius-sm)] transition-all ${statusFilter === f.value ? "bg-[var(--md-primary)] text-white" : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)]"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Subject</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">User Email</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Priority</th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Messages</th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Created</th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]"><svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></td></tr>
            ) : cases.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">No cases found</td></tr>
            ) : cases.map((c) => {
              const s = statusStyle[c.status] || statusStyle.open;
              const p = priorityStyle[c.priority] || priorityStyle.normal;
              return (
                <tr key={c.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${categoryStyle[c.category] || categoryStyle.other}`}>{c.category}</span>
                      <span className="text-[13px] font-medium text-[var(--md-on-surface)]">{c.subject}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[13px] text-[var(--md-on-surface-variant)]">{c.user_email || "—"}</td>
                  <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${s.bg} ${s.text}`}>{c.status.replace("_", " ")}</span></td>
                  <td className="px-5 py-3"><span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${p.bg} ${p.text}`}>{c.priority}</span></td>
                  <td className="px-5 py-3 text-right text-[13px] text-[var(--md-on-surface)]">{c.message_count}</td>
                  <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => setSelectedId(c.id)} className="h-[26px] px-2.5 text-[11px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[6px] hover:opacity-80 transition-all">
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
