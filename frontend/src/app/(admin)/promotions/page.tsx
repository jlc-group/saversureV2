"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

const TIME_OPTIONS = (() => {
  const opts: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      opts.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  opts.push("23:59");
  return opts;
})();

interface BonusRule {
  id?: string;
  product_id: string | null;
  product_name?: string;
  product_sku?: string;
  currency: string;
  bonus_type: "fixed" | "multiplier";
  bonus_amount: number;
  expires_at: string | null;
  expiry_action: string;
}

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  apply_to: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  bonus_rules: BonusRule[];
  is_active: boolean;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  points_per_scan: number;
}

interface PointCurrency {
  id: string;
  code: string;
  name: string;
  icon: string;
  exchange_rate: number;
}

export default function PromotionsPage() {
  const router = useRouter();
  const [promos, setPromos] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currencies, setCurrencies] = useState<PointCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  const emptyForm = {
    name: "",
    description: "",
    start_date: "",
    start_time: "00:00",
    end_date: "",
    end_time: "23:59",
    apply_to: "selected" as "all_products" | "selected",
    bonus_rules: [] as BonusRule[],
  };
  const [form, setForm] = useState(emptyForm);

  const fetchAll = async () => {
    const results = await Promise.allSettled([
      api.get<{ data: Promotion[] }>("/api/v1/promotions"),
      api.get<{ data: Product[] }>("/api/v1/products?limit=500"),
      api.get<{ data: PointCurrency[] }>("/api/v1/currencies"),
    ]);
    if (results[0].status === "fulfilled") setPromos(results[0].value.data || []);
    if (results[1].status === "fulfilled") setProducts(results[1].value.data || []);
    if (results[2].status === "fulfilled") setCurrencies(results[2].value.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setShowForm(true); };

  const toLocalParts = (isoStr: string) => {
    if (!isoStr) return { date: "", time: "00:00" };
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return {
      date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
      time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
    };
  };

  const openEdit = (p: Promotion) => {
    if (p.status !== "draft" && p.status !== "rejected") return;
    setEditId(p.id);
    const s = toLocalParts(p.start_date);
    const e = toLocalParts(p.end_date);
    setForm({
      name: p.name,
      description: p.description || "",
      start_date: s.date,
      start_time: s.time,
      end_date: e.date,
      end_time: e.time,
      apply_to: p.apply_to as "all_products" | "selected",
      bonus_rules: (p.bonus_rules || []).map((r) => {
        if (!r.expires_at) return { ...r, expires_at: null };
        const ed = new Date(r.expires_at);
        const pad = (n: number) => String(n).padStart(2, "0");
        const localStr = `${ed.getFullYear()}-${pad(ed.getMonth() + 1)}-${pad(ed.getDate())}T${pad(ed.getHours())}:${pad(ed.getMinutes())}`;
        return { ...r, expires_at: localStr };
      }),
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.bonus_rules.length === 0) { alert("กรุณาเพิ่ม Bonus Rule อย่างน้อย 1 รายการ"); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        start_date: new Date(`${form.start_date}T${form.start_time}:00`).toISOString(),
        end_date: new Date(`${form.end_date}T${form.end_time}:00`).toISOString(),
        apply_to: form.apply_to,
        bonus_rules: form.bonus_rules.map((r) => ({
          product_id: r.product_id || null,
          currency: r.currency,
          bonus_type: r.bonus_type,
          bonus_amount: r.bonus_amount,
          expires_at: r.expires_at ? new Date(r.expires_at).toISOString() : null,
          expiry_action: r.expiry_action || "keep",
        })),
      };
      if (editId) {
        await api.patch(`/api/v1/promotions/${editId}`, payload);
      } else {
        await api.post("/api/v1/promotions", payload);
      }
      setShowForm(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch (err) { alert(err instanceof Error ? err.message : "Failed"); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (id: string, action: string, body?: object) => {
    try { await api.post(`/api/v1/promotions/${id}/${action}`, body || {}); fetchAll(); }
    catch (err) { alert(err instanceof Error ? err.message : `Failed to ${action}`); }
  };

  const handleReject = async () => {
    if (!rejectId || !rejectNote.trim()) return;
    await handleAction(rejectId, "reject", { note: rejectNote });
    setRejectId(null); setRejectNote("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this promotion?")) return;
    try { await api.delete(`/api/v1/promotions/${id}`); fetchAll(); } catch { alert("Failed to delete"); }
  };

  // --- Bonus Rules helpers ---
  const addRule = () => {
    setForm((prev) => ({
      ...prev,
      bonus_rules: [
        ...prev.bonus_rules,
        {
          product_id: null,
          currency: "point",
          bonus_type: "fixed" as const,
          bonus_amount: 10,
          expires_at: null,
          expiry_action: "keep",
        },
      ],
    }));
  };

  const updateRule = (idx: number, patch: Partial<BonusRule>) => {
    setForm((prev) => ({
      ...prev,
      bonus_rules: prev.bonus_rules.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const removeRule = (idx: number) => {
    setForm((prev) => ({ ...prev, bonus_rules: prev.bonus_rules.filter((_, i) => i !== idx) }));
  };

  // --- Product picker for rules ---
  const [rulePickerIdx, setRulePickerIdx] = useState<number | null>(null);
  const [rulePickerSearch, setRulePickerSearch] = useState("");
  const rulePickerRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rulePickerRef.current && !rulePickerRef.current.contains(e.target as Node)) setRulePickerIdx(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredProducts = products.filter((p) => {
    const q = rulePickerSearch.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const getProduct = (pid: string | null) => {
    if (!pid) return null;
    return products.find((pr) => pr.id === pid) || null;
  };

  const getCurrencyInfo = (code: string) => {
    const c = currencies.find((cr) => cr.code === code);
    return c ? `${c.icon} ${c.name}` : code;
  };

  // --- Status config ---
  const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
    draft: { label: "แบบร่าง", cls: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400", dot: "bg-gray-400" },
    pending_approval: { label: "รออนุมัติ", cls: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400", dot: "bg-amber-500" },
    approved: { label: "อนุมัติแล้ว", cls: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400", dot: "bg-green-500" },
    rejected: { label: "ไม่อนุมัติ", cls: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400", dot: "bg-red-500" },
    inactive: { label: "ปิดใช้งาน", cls: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500", dot: "bg-gray-400" },
  };
  const getStatusInfo = (status: string) => statusConfig[status] || statusConfig.draft;
  const formatDate = (d: string) => {
    try { return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" }); } catch { return d; }
  };

  const fieldClass = "w-full h-[40px] px-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all";
  const labelClass = "block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 uppercase tracking-[0.4px]";
  const btnSmall = "h-[28px] px-3 text-[11px] font-medium rounded-[var(--md-radius-sm)] transition-all";

  const expiryLabels: Record<string, string> = { keep: "เก็บถาวร", convert: "แปลงเป็น Point", expire: "หายไป" };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Promotions</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">โปรโมชั่นเพิ่มแต้มพิเศษตามช่วงเวลา — กำหนด Bonus Rules ต่อสินค้าได้</p>
        </div>
        <button
          onClick={() => showForm ? (setShowForm(false), setEditId(null)) : openCreate()}
          className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all"
        >
          {showForm ? (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>Cancel</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>Add Promotion</>
          )}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5">
            {editId ? "Edit Promotion" : "New Promotion"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={labelClass}>ชื่อโปรโมชั่น</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={fieldClass} placeholder='เช่น "โปร Songkran x2 แต้ม"' />
              </div>
              <div className="md:col-span-2">
                <label className={labelClass}>รายละเอียด</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={fieldClass} placeholder="รายละเอียดเพิ่มเติม (optional)" />
              </div>
              <div>
                <label className={labelClass}>วันเริ่มต้น</label>
                <div className="flex gap-2">
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required className={`${fieldClass} flex-1`} />
                  <select value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className={`${fieldClass} w-[100px]`}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={labelClass}>วันสิ้นสุด</label>
                <div className="flex gap-2">
                  <input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required className={`${fieldClass} flex-1`} />
                  <select value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className={`${fieldClass} w-[100px]`}>
                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="md:col-span-2">
                <p className="text-[11px] text-[var(--md-on-surface-variant)] flex items-center gap-1.5 -mt-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 opacity-50"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" /></svg>
                  เวลาไทย (ICT UTC+7) — เวลาที่แสดงคือ local time ของเครื่องคุณ, ระบบจัดเก็บเป็น UTC
                </p>
              </div>
              <div>
                <label className={labelClass}>ใช้กับสินค้า</label>
                <select value={form.apply_to} onChange={(e) => setForm({ ...form, apply_to: e.target.value as "all_products" | "selected" })} className={fieldClass}>
                  <option value="selected">เลือกรายสินค้า</option>
                  <option value="all_products">ทุกสินค้า</option>
                </select>
              </div>
            </div>

            {/* Bonus Rules Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className={labelClass}>Bonus Rules ({form.bonus_rules.length} rules)</label>
                <button type="button" onClick={addRule}
                  className="inline-flex items-center gap-1 h-[32px] px-4 text-[12px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>
                  เพิ่ม Rule
                </button>
              </div>

              {form.bonus_rules.length === 0 ? (
                <div className="border-2 border-dashed border-[var(--md-outline-variant)] rounded-[var(--md-radius-md)] px-6 py-8 text-center">
                  <p className="text-[13px] text-[var(--md-on-surface-variant)]">ยังไม่มี Bonus Rule — กดปุ่ม &quot;เพิ่ม Rule&quot; เพื่อกำหนดโบนัสต่อสินค้า</p>
                </div>
              ) : (
                <div className="border border-[var(--md-outline-variant)] rounded-[var(--md-radius-md)] overflow-visible">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-[var(--md-surface-container)] border-b border-[var(--md-outline-variant)]">
                        {form.apply_to === "selected" && <th className="text-left px-3 py-2.5 font-medium text-[var(--md-on-surface-variant)]">สินค้า</th>}
                        <th className="text-left px-3 py-2.5 font-medium text-[var(--md-on-surface-variant)]">Currency</th>
                        <th className="text-left px-3 py-2.5 font-medium text-[var(--md-on-surface-variant)]">ประเภท</th>
                        <th className="text-left px-3 py-2.5 font-medium text-[var(--md-on-surface-variant)]">จำนวน</th>
                        <th className="text-left px-3 py-2.5 font-medium text-[var(--md-on-surface-variant)]">หมดอายุ</th>
                        <th className="text-left px-3 py-2.5 font-medium text-[var(--md-on-surface-variant)]">เมื่อหมดอายุ</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {form.bonus_rules.map((rule, idx) => (
                        <tr key={idx} className="border-b border-[var(--md-outline-variant)] last:border-b-0">
                          {/* Product picker (only for selected mode) */}
                          {form.apply_to === "selected" && (
                            <td className="px-3 py-2" ref={rulePickerIdx === idx ? rulePickerRef : undefined}>
                              <div className="relative inline-block">
                                <button type="button"
                                  onClick={() => { setRulePickerIdx(rulePickerIdx === idx ? null : idx); setRulePickerSearch(""); }}
                                  className="text-left px-2 py-1.5 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[12px] min-w-[200px] max-w-[240px] hover:border-[var(--md-primary)] transition-colors block">
                                  {(() => {
                                    const prod = getProduct(rule.product_id);
                                    if (!prod) return <span className="text-[var(--md-on-surface-variant)] opacity-60">เลือกสินค้า...</span>;
                                    return (
                                      <>
                                        <span className="block truncate font-medium leading-tight">{prod.name}</span>
                                        <span className="block text-[10px] text-[var(--md-on-surface-variant)] font-mono leading-tight mt-0.5">{prod.sku} · {prod.points_per_scan} pts</span>
                                      </>
                                    );
                                  })()}
                                </button>
                                {rulePickerIdx === idx && (
                                  <div className="absolute z-[200] left-0 top-[40px] w-[300px] bg-[var(--md-surface)] border border-[var(--md-outline-variant)] rounded-[var(--md-radius-md)] shadow-xl max-h-[280px] overflow-hidden">
                                    <div className="p-2.5 border-b border-[var(--md-outline-variant)]">
                                      <input type="text" value={rulePickerSearch} onChange={(e) => setRulePickerSearch(e.target.value)}
                                        placeholder="ค้นหาสินค้า..." className="w-full h-[34px] px-3 text-[13px] border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] outline-none focus:border-[var(--md-primary)] bg-transparent" autoFocus />
                                    </div>
                                    <div className="max-h-[220px] overflow-y-auto">
                                      {filteredProducts.length === 0 ? (
                                        <p className="px-3 py-4 text-[12px] text-[var(--md-on-surface-variant)] text-center">ไม่พบสินค้า</p>
                                      ) : filteredProducts.map((p) => (
                                        <button key={p.id} type="button"
                                          onClick={() => { updateRule(idx, { product_id: p.id, product_name: p.name, product_sku: p.sku }); setRulePickerIdx(null); }}
                                          className="w-full text-left px-3 py-2.5 hover:bg-[var(--md-surface-container)] text-[13px] transition-colors border-b border-[var(--md-outline-variant)] last:border-b-0">
                                          <span className="block truncate font-medium">{p.name}</span>
                                          <span className="text-[11px] text-[var(--md-on-surface-variant)] font-mono">{p.sku} · {p.points_per_scan} pts</span>
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          )}

                          {/* Currency */}
                          <td className="px-3 py-2">
                            <select value={rule.currency}
                              onChange={(e) => updateRule(idx, {
                                currency: e.target.value,
                                bonus_type: e.target.value !== "point" ? "fixed" : rule.bonus_type,
                                expires_at: e.target.value === "point" ? null : rule.expires_at,
                                expiry_action: e.target.value === "point" ? "keep" : rule.expiry_action,
                              })}
                              className="h-[36px] px-2 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[12px] bg-transparent outline-none w-full min-w-[120px]">
                              {currencies.map((c) => (
                                <option key={c.code} value={c.code}>{c.icon} {c.name}</option>
                              ))}
                            </select>
                          </td>

                          {/* Bonus Type */}
                          <td className="px-3 py-2">
                            <select value={rule.bonus_type}
                              onChange={(e) => updateRule(idx, { bonus_type: e.target.value as "fixed" | "multiplier", bonus_amount: e.target.value === "multiplier" ? 2 : 10 })}
                              disabled={rule.currency !== "point"}
                              className="h-[36px] px-2 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[12px] bg-transparent outline-none disabled:opacity-50 w-full min-w-[100px]">
                              <option value="fixed">+N Fixed</option>
                              {rule.currency === "point" && <option value="multiplier">xN Multiplier</option>}
                            </select>
                          </td>

                          {/* Amount */}
                          <td className="px-3 py-2">
                            <input type="number" value={rule.bonus_amount}
                              onChange={(e) => updateRule(idx, { bonus_amount: parseInt(e.target.value) || 0 })}
                              min={rule.bonus_type === "multiplier" ? 2 : 1}
                              className="h-[36px] w-[70px] px-2 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[12px] bg-transparent outline-none text-center" />
                          </td>

                          {/* Expires At (only for special currencies) */}
                          <td className="px-3 py-2">
                            {rule.currency !== "point" ? (
                              <div className="flex gap-1 items-center">
                                <input type="date" value={rule.expires_at?.split("T")[0] || ""}
                                  onChange={(e) => {
                                    const dateVal = e.target.value;
                                    if (!dateVal) { updateRule(idx, { expires_at: null }); return; }
                                    const timeVal = rule.expires_at?.includes("T") ? rule.expires_at.split("T")[1]?.slice(0, 5) : "23:59";
                                    updateRule(idx, { expires_at: `${dateVal}T${timeVal}` });
                                  }}
                                  className="h-[36px] px-1.5 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[11px] bg-transparent outline-none min-w-[120px]" />
                                {rule.expires_at && (
                                  <select value={rule.expires_at?.includes("T") ? rule.expires_at.split("T")[1]?.slice(0, 5) : "23:59"}
                                    onChange={(e) => {
                                      const dateVal = rule.expires_at?.split("T")[0] || "";
                                      updateRule(idx, { expires_at: `${dateVal}T${e.target.value}` });
                                    }}
                                    className="h-[36px] px-1 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[11px] bg-transparent outline-none w-[72px]">
                                    {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                                  </select>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-[var(--md-on-surface-variant)]">—</span>
                            )}
                          </td>

                          {/* Expiry Action */}
                          <td className="px-3 py-2">
                            {rule.currency !== "point" ? (
                              <select value={rule.expiry_action}
                                onChange={(e) => updateRule(idx, { expiry_action: e.target.value })}
                                className="h-[36px] px-2 border border-[var(--md-outline-variant)] rounded-[var(--md-radius-sm)] text-[11px] bg-transparent outline-none w-full min-w-[120px]">
                                <option value="keep">เก็บถาวร</option>
                                <option value="convert">แปลงเป็น Point</option>
                                <option value="expire">หายไป</option>
                              </select>
                            ) : (
                              <span className="text-[11px] text-[var(--md-on-surface-variant)]">—</span>
                            )}
                          </td>

                          {/* Remove */}
                          <td className="px-2 py-2">
                            <button type="button" onClick={() => removeRule(idx)}
                              className="w-[28px] h-[28px] flex items-center justify-center rounded-full hover:bg-[var(--md-error-light)] text-[var(--md-error)] transition-colors">
                              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={submitting} className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] disabled:opacity-60 transition-all">
                {submitting ? "Saving..." : editId ? "Save Changes" : "Create Promotion"}
              </button>
              <p className="text-[12px] text-[var(--md-on-surface-variant)]">สร้างเป็นแบบร่าง แล้วส่งอนุมัติภายหลัง</p>
            </div>
          </form>
        </div>
      )}

      {/* Reject dialog */}
      {rejectId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setRejectId(null)}>
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-3 p-6 w-[420px] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-4">ไม่อนุมัติโปรโมชั่น</h3>
            <label className={labelClass}>เหตุผล (required)</label>
            <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={3}
              className="w-full px-4 py-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-error)] focus:border-2 resize-none"
              placeholder="ระบุเหตุผลที่ไม่อนุมัติ..." autoFocus />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setRejectId(null)} className="h-[36px] px-4 text-[13px] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] transition-all">ยกเลิก</button>
              <button onClick={handleReject} disabled={!rejectNote.trim()} className="h-[36px] px-5 text-[13px] font-medium bg-[var(--md-error)] text-white rounded-[var(--md-radius-sm)] hover:opacity-90 disabled:opacity-50 transition-all">ไม่อนุมัติ</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Promotion</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Bonus Rules</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Period</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Status</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center">
                <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Loading...
                </div>
              </td></tr>
            ) : promos.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center">
                <div className="text-[var(--md-on-surface-variant)]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30"><path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z" /></svg>
                  <p className="text-[14px]">ยังไม่มีโปรโมชั่น</p>
                  <p className="text-[12px] mt-1">สร้างโปรโมชั่นเพื่อเพิ่มแต้มพิเศษให้ลูกค้าในช่วงเวลาที่กำหนด</p>
                </div>
              </td></tr>
            ) : promos.map((p) => {
              const si = getStatusInfo(p.status);
              const rules = p.bonus_rules || [];
              return (
                <tr key={p.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors">
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      onClick={() => router.push(`/promotions/${p.id}`)}
                      className="text-left group"
                    >
                      <p className="text-[14px] font-medium text-[var(--md-on-surface)] group-hover:text-[var(--md-primary)] transition-colors">{p.name}</p>
                      {p.description && <p className="text-[12px] text-[var(--md-on-surface-variant)] mt-0.5 truncate max-w-[250px]">{p.description}</p>}
                    </button>
                    {p.rejection_note && p.status === "rejected" && (
                      <p className="text-[11px] text-[var(--md-error)] mt-1 bg-red-50 dark:bg-red-950/30 px-2 py-1 rounded">เหตุผล: {p.rejection_note}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {rules.length === 0 ? (
                      <span className="text-[12px] text-[var(--md-on-surface-variant)]">—</span>
                    ) : (
                      <div className="space-y-1">
                        {rules.slice(0, 3).map((r, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[12px]">
                            <span className="font-medium text-[var(--md-primary)]">
                              {r.bonus_type === "multiplier" ? `x${r.bonus_amount}` : `+${r.bonus_amount}`}
                            </span>
                            <span className="text-[var(--md-on-surface-variant)]">{getCurrencyInfo(r.currency)}</span>
                            {r.product_id && <span className="text-[10px] text-[var(--md-on-surface-variant)] truncate max-w-[120px]">({r.product_sku || r.product_name || "—"})</span>}
                            {r.expires_at && <span className="text-[10px] text-amber-600">⏰{expiryLabels[r.expiry_action]}</span>}
                          </div>
                        ))}
                        {rules.length > 3 && <span className="text-[11px] text-[var(--md-on-surface-variant)]">+{rules.length - 3} more</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] text-[var(--md-on-surface)]">{formatDate(p.start_date)}</p>
                    <p className="text-[11px] text-[var(--md-on-surface-variant)]">ถึง {formatDate(p.end_date)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium ${si.cls}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                      {si.label}
                    </span>
                    {p.approved_at && p.status === "approved" && (
                      <p className="text-[10px] text-[var(--md-on-surface-variant)] mt-1">{formatDate(p.approved_at)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      {(p.status === "draft" || p.status === "rejected") && (
                        <>
                          <button onClick={() => openEdit(p)} className={`${btnSmall} text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80`}>Edit</button>
                          <button onClick={() => handleAction(p.id, "submit")} className={`${btnSmall} text-white bg-[var(--md-primary)] hover:opacity-90`}>ส่งอนุมัติ</button>
                          <button onClick={() => handleDelete(p.id)} className={`${btnSmall} text-[var(--md-error)] bg-[var(--md-error-light)] hover:opacity-80`}>Delete</button>
                        </>
                      )}
                      {p.status === "pending_approval" && (
                        <>
                          <button onClick={() => handleAction(p.id, "approve")} className={`${btnSmall} text-white bg-green-600 hover:bg-green-700`}>อนุมัติ</button>
                          <button onClick={() => { setRejectId(p.id); setRejectNote(""); }} className={`${btnSmall} text-white bg-[var(--md-error)] hover:opacity-90`}>ไม่อนุมัติ</button>
                        </>
                      )}
                      {p.status === "approved" && (
                        <button onClick={() => handleAction(p.id, "deactivate")} className={`${btnSmall} text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] hover:bg-[var(--md-surface-container-high)]`}>ปิดใช้งาน</button>
                      )}
                      {p.status === "inactive" && (
                        <button onClick={() => handleAction(p.id, "reactivate")} className={`${btnSmall} text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80`}>เปิดใช้งาน</button>
                      )}
                    </div>
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
