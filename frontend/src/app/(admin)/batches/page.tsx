"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Batch {
  id: string;
  campaign_id: string;
  prefix: string;
  serial_start: number;
  serial_end: number;
  code_count: number;
  status: string;
  created_at: string;
  product_id: string | null;
  factory_id: string | null;
  product_name: string | null;
  factory_name: string | null;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
  points_per_scan: number;
  status: string;
}

interface Factory {
  id: string;
  name: string;
  code: string | null;
  status: string;
}

const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
  generated: { bg: "bg-[var(--md-info-light)]", text: "text-[var(--md-info)]", dot: "bg-[var(--md-info)]" },
  printed: { bg: "bg-[var(--md-warning-light)]", text: "text-[var(--md-warning)]", dot: "bg-[var(--md-warning)]" },
  distributed: { bg: "bg-[var(--md-success-light)]", text: "text-[var(--md-success)]", dot: "bg-[var(--md-success)]" },
  recalled: { bg: "bg-[var(--md-error-light)]", text: "text-[var(--md-error)]", dot: "bg-[var(--md-error)]" },
};

const statusTransitions: Record<string, string> = {
  generated: "printed",
  printed: "distributed",
};

const quantityPresets = [10000, 50000, 100000, 500000, 1000000, 10000000];

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ campaign_id: "", prefix: "", quantity: 10000, codes_per_roll: 10000, product_id: "", factory_id: "" });
  const [submitting, setSubmitting] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [exportConfigByBatch, setExportConfigByBatch] = useState<Record<string, { lotSize: number; roll: number }>>({});

  const fetchBatches = async () => {
    try {
      const data = await api.get<{ data: Batch[] }>("/api/v1/batches");
      setBatches(data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  const fetchCampaigns = async () => {
    try {
      const data = await api.get<{ data: Campaign[] }>("/api/v1/campaigns");
      setCampaigns(data.data || []);
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

  useEffect(() => { fetchBatches(); fetchCampaigns(); fetchProducts(); fetchFactories(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        campaign_id: form.campaign_id,
        prefix: form.prefix,
        quantity: form.quantity,
        codes_per_roll: form.codes_per_roll,
      };
      if (form.product_id) payload.product_id = form.product_id;
      if (form.factory_id) payload.factory_id = form.factory_id;
      await api.post("/api/v1/batches", payload);
      setShowForm(false);
      setForm({ campaign_id: "", prefix: "", quantity: 10000, codes_per_roll: 10000, product_id: "", factory_id: "" });
      fetchBatches();
    } catch { alert("Failed to create batch"); } finally { setSubmitting(false); }
  };

  const getExportConfig = (batch: Batch) => exportConfigByBatch[batch.id] || { lotSize: 10000, roll: 1 };

  const updateExportConfig = (batchID: string, next: Partial<{ lotSize: number; roll: number }>) => {
    setExportConfigByBatch((prev) => ({
      ...prev,
      [batchID]: { ...(prev[batchID] || { lotSize: 10000, roll: 1 }), ...next },
    }));
  };

  const handleExport = async (batch: Batch, mode: "full" | "roll") => {
    setExportingId(batch.id);
    try {
      const cfg = getExportConfig(batch);
      const lotSize = Math.max(1, cfg.lotSize || 10000);
      const maxRoll = Math.max(1, Math.ceil(batch.code_count / lotSize));
      const roll = Math.min(Math.max(1, cfg.roll || 1), maxRoll);
      const query = mode === "roll" ? `?format=csv&lot_size=${lotSize}&roll=${roll}` : "?format=csv";
      const fileName = mode === "roll"
        ? `batch_${batch.prefix}_roll_${roll}_of_${maxRoll}.csv`
        : `batch_${batch.prefix}_${batch.serial_start}-${batch.serial_end}.csv`;
      await api.download(`/api/v1/batches/${batch.id}/export${query}`, fileName);
    } catch { alert("Failed to export batch"); } finally { setExportingId(null); }
  };

  const handleUpdateStatus = async (batch: Batch) => {
    const nextStatus = statusTransitions[batch.status];
    if (!nextStatus) return;
    if (!confirm(`Update status: ${batch.status} → ${nextStatus}?`)) return;
    setActionId(batch.id);
    try {
      await api.patch(`/api/v1/batches/${batch.id}/status`, { status: nextStatus });
      fetchBatches();
    } catch { alert("Failed to update status"); } finally { setActionId(null); }
  };

  const handleRecall = async (batch: Batch) => {
    const reason = prompt("Reason for recall:");
    if (!reason) return;
    setActionId(batch.id);
    try {
      await api.post(`/api/v1/batches/${batch.id}/recall`, { reason });
      fetchBatches();
    } catch { alert("Failed to recall batch"); } finally { setActionId(null); }
  };

  const fieldClass = "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Batches</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">Generate and export QR code batches</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {showForm ? (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>Cancel</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>Generate Batch</>
          )}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">Generate New Batch</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Campaign</label>
                <select value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })} required className={fieldClass}>
                  <option value="">-- Select Campaign --</option>
                  {campaigns.map((c) => (<option key={c.id} value={c.id}>{c.name} ({c.status})</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Prefix</label>
                <input type="text" value={form.prefix} onChange={(e) => setForm({ ...form, prefix: e.target.value.toUpperCase() })} required maxLength={10} className={`${fieldClass} font-mono`} placeholder="e.g. SV2026" />
                <p className="text-[11px] text-[var(--md-on-surface-variant)] mt-1.5">ระบบจะต่อเลข serial ให้อัตโนมัติ</p>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Product (optional)</label>
                <select value={form.product_id} onChange={(e) => setForm({ ...form, product_id: e.target.value })} className={fieldClass}>
                  <option value="">— No product —</option>
                  {products.map((p) => (<option key={p.id} value={p.id}>{p.name} ({p.points_per_scan} pts)</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Factory (optional)</label>
                <select value={form.factory_id} onChange={(e) => setForm({ ...form, factory_id: e.target.value })} className={fieldClass}>
                  <option value="">— No factory —</option>
                  {factories.map((f) => (<option key={f.id} value={f.id}>{f.name}{f.code ? ` (${f.code})` : ""}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Quantity</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 10000 })} min={1} required className={fieldClass} />
                <div className="flex flex-wrap gap-2 mt-3">
                  {quantityPresets.map((q) => (
                    <button key={q} type="button" onClick={() => setForm({ ...form, quantity: q })} className={`h-[32px] px-4 text-[12px] font-medium rounded-[var(--md-radius-sm)] border transition-all duration-200 ${form.quantity === q ? "bg-[var(--md-primary-light)] text-[var(--md-primary)] border-[var(--md-primary)]" : "bg-transparent text-[var(--md-on-surface-variant)] border-[var(--md-outline-variant)] hover:bg-[var(--md-surface-container)]"}`}>
                      {q.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Codes per Roll</label>
                <input type="number" value={form.codes_per_roll} onChange={(e) => setForm({ ...form, codes_per_roll: parseInt(e.target.value) || 10000 })} min={100} required className={fieldClass} />
                <p className="text-[11px] text-[var(--md-on-surface-variant)] mt-1.5">จำนวน QR Code ต่อ 1 ม้วน — จะสร้าง {Math.ceil(form.quantity / form.codes_per_roll)} roll(s)</p>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={submitting} className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 active:scale-[0.98] transition-all duration-200">
                {submitting ? "Generating..." : "Generate"}
              </button>
              <p className="text-[13px] text-[var(--md-on-surface-variant)]">Generate {form.quantity.toLocaleString()} QR codes</p>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Prefix</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Product</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Factory</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Codes</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Created</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]"><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Loading...</div></td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center"><div className="text-[var(--md-on-surface-variant)]"><svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" /></svg><p className="text-[14px]">No batches yet</p></div></td></tr>
            ) : (
              batches.map((b) => {
                const cfg = getExportConfig(b);
                const lotSize = Math.max(1, cfg.lotSize || 10000);
                const maxRoll = Math.max(1, Math.ceil(b.code_count / lotSize));
                const s = statusStyle[b.status] || statusStyle.generated;
                const nextStatus = statusTransitions[b.status];
                return (
                  <tr key={b.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <p className="font-mono text-[14px] font-medium text-[var(--md-on-surface)]">{b.prefix}</p>
                      <p className="text-[11px] text-[var(--md-on-surface-variant)]">{b.serial_start.toLocaleString()} – {b.serial_end.toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 text-[12px] text-[var(--md-on-surface-variant)]">{b.product_name || "—"}</td>
                    <td className="px-6 py-4 text-[12px] text-[var(--md-on-surface-variant)]">{b.factory_name || "—"}</td>
                    <td className="px-6 py-4 text-[14px] font-medium text-[var(--md-on-surface)]">{b.code_count.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium ${s.bg} ${s.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{b.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[var(--md-on-surface-variant)]">{new Date(b.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2.5 items-end">
                        {/* Status actions */}
                        <div className="flex gap-1.5">
                          {nextStatus && b.status !== "recalled" && (
                            <button
                              onClick={() => handleUpdateStatus(b)}
                              disabled={actionId === b.id}
                              className="h-[28px] px-3 text-[11px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 disabled:opacity-50 transition-all duration-200"
                            >
                              {actionId === b.id ? "..." : `→ ${nextStatus}`}
                            </button>
                          )}
                          {b.status !== "recalled" && (
                            <button
                              onClick={() => handleRecall(b)}
                              disabled={actionId === b.id}
                              className="h-[28px] px-3 text-[11px] font-medium text-[var(--md-error)] bg-[var(--md-error-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 disabled:opacity-50 transition-all duration-200"
                            >
                              Recall
                            </button>
                          )}
                        </div>
                        {/* Export controls */}
                        <div className="flex items-center gap-1.5 text-[11px] text-[var(--md-on-surface-variant)]">
                          <span>lot</span>
                          <input type="number" min={1} value={cfg.lotSize} onChange={(e) => updateExportConfig(b.id, { lotSize: parseInt(e.target.value, 10) || 10000 })} className="w-20 h-[26px] px-2 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[11px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)]" />
                          <span>roll</span>
                          <input type="number" min={1} max={maxRoll} value={cfg.roll} onChange={(e) => updateExportConfig(b.id, { roll: parseInt(e.target.value, 10) || 1 })} className="w-14 h-[26px] px-2 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[11px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)]" />
                          <span className="opacity-60">/{maxRoll}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <Link href={`/rolls?batch_id=${b.id}`} className="h-[28px] px-3 text-[11px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200 inline-flex items-center">
                            Rolls
                          </Link>
                          <button onClick={() => handleExport(b, "roll")} disabled={exportingId === b.id} className="h-[28px] px-3 text-[11px] font-medium bg-[var(--md-primary)] text-white rounded-[var(--md-radius-sm)] hover:bg-[var(--md-primary-dark)] disabled:opacity-50 transition-all duration-200">
                            {exportingId === b.id ? "..." : "Export Roll"}
                          </button>
                          <button onClick={() => handleExport(b, "full")} disabled={exportingId === b.id} className="h-[28px] px-3 text-[11px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] hover:bg-[var(--md-surface-container-high)] disabled:opacity-50 transition-all duration-200">
                            Full
                          </button>
                        </div>
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
