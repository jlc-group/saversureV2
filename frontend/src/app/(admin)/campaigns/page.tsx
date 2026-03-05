"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  terms_conditions?: string;
  settings?: Record<string, unknown>;
  created_at: string;
}

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  draft: { bg: "bg-[var(--md-surface-container)]", text: "text-[var(--md-on-surface-variant)]", dot: "bg-[var(--md-on-surface-variant)]" },
  active: { bg: "bg-[var(--md-success-light)]", text: "text-[var(--md-success)]", dot: "bg-[var(--md-success)]" },
  paused: { bg: "bg-[var(--md-warning-light)]", text: "text-[var(--md-warning)]", dot: "bg-[var(--md-warning)]" },
  ended: { bg: "bg-[var(--md-error-light)]", text: "text-[var(--md-error)]", dot: "bg-[var(--md-error)]" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", type: "loyalty" });
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<{ data: Campaign[] }>("/api/v1/campaigns");
      setCampaigns(data.data || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await api.patch(`/api/v1/campaigns/${editingId}`, form);
      } else {
        await api.post("/api/v1/campaigns", form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: "", description: "", type: "loyalty" });
      fetchCampaigns();
    } catch {
      alert("Failed to save campaign");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm("Publish this campaign? It will become active.")) return;
    setActionId(id);
    try {
      await api.post(`/api/v1/campaigns/${id}/publish`, {});
      fetchCampaigns();
    } catch {
      alert("Failed to publish campaign");
    } finally {
      setActionId(null);
    }
  };

  const handleEdit = (c: Campaign) => {
    setEditingId(c.id);
    setForm({ name: c.name, description: c.description || "", type: c.type });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ name: "", description: "", type: "loyalty" });
  };

  const fieldClass = `
    w-full h-[48px] px-4 border border-[var(--md-outline)]
    rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)]
    bg-transparent outline-none
    focus:border-[var(--md-primary)] focus:border-2
    transition-all duration-200
  `;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Campaigns</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">Manage marketing campaigns and promotions</p>
        </div>
        <button
          onClick={() => showForm ? cancelForm() : setShowForm(true)}
          className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {showForm ? (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>Cancel</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>New Campaign</>
          )}
        </button>
      </div>

      {/* Create/Edit form */}
      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
            {editingId ? "Edit Campaign" : "Create Campaign"}
          </h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={fieldClass} placeholder="Campaign name" />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={fieldClass}>
                  <option value="loyalty">Loyalty</option>
                  <option value="promotion">Promotion</option>
                  <option value="flash">Flash Event</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none resize-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200" />
            </div>
            <button type="submit" disabled={submitting} className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 active:scale-[0.98] transition-all duration-200">
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Name</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Type</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Created</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]"><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Loading...</div></td></tr>
            ) : campaigns.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="text-[var(--md-on-surface-variant)]"><svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" /></svg><p className="text-[14px]">No campaigns yet</p></div></td></tr>
            ) : (
              campaigns.map((c) => {
                const s = statusStyle[c.status] || statusStyle.draft;
                return (
                  <tr key={c.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150">
                    <td className="px-6 py-4 text-[14px] font-medium text-[var(--md-on-surface)]">{c.name}</td>
                    <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface-variant)] capitalize">{c.type}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[var(--md-on-surface-variant)]">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 justify-end">
                        <button onClick={() => handleEdit(c)} className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] hover:bg-[var(--md-surface-container-high)] transition-all duration-200">
                          Edit
                        </button>
                        {c.status === "draft" && (
                          <button
                            onClick={() => handlePublish(c.id)}
                            disabled={actionId === c.id}
                            className="h-[30px] px-3 text-[12px] font-medium text-white bg-[var(--md-success)] rounded-[var(--md-radius-sm)] hover:opacity-90 disabled:opacity-50 transition-all duration-200"
                          >
                            {actionId === c.id ? "..." : "Publish"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
