"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";

const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  { label: "แต้ม & เหรียญ", emojis: ["⭐", "🌟", "💎", "🪙", "🏅", "🎖️", "🥇", "🥈", "🥉", "💰", "💵", "💲", "🔶", "🔷"] },
  { label: "ของรางวัล", emojis: ["🎁", "🎀", "🎊", "🎉", "🏆", "👑", "💐", "🧧", "🎯", "🎟️", "🎫", "🎪"] },
  { label: "หัวใจ & ความรู้สึก", emojis: ["❤️", "💖", "💝", "💜", "💙", "💚", "🧡", "💛", "🤍", "🖤", "🩷", "❤️‍🔥"] },
  { label: "ธรรมชาติ", emojis: ["🌸", "🌺", "🌻", "🌹", "🍀", "🌿", "🌈", "☀️", "🌙", "⚡", "🔥", "💧", "❄️", "🍃"] },
  { label: "อื่นๆ", emojis: ["✨", "🚀", "🛡️", "⚔️", "🗝️", "📿", "🧿", "♻️", "🌀", "💠", "🔮", "🐉"] },
];

interface Currency {
  id: string;
  code: string;
  name: string;
  icon: string | null;
  is_default: boolean;
  sort_order: number;
  active: boolean;
  exchange_rate: number;
  created_at: string;
}

export default function CurrenciesPage() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [converting, setConverting] = useState<string | null>(null);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) setEmojiPickerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const emptyForm = { code: "", name: "", icon: "", is_default: false, sort_order: 0, exchange_rate: 1 };
  const [form, setForm] = useState(emptyForm);

  const fetchCurrencies = async () => {
    try {
      const data = await api.get<{ data: Currency[] }>("/api/v1/currencies");
      setCurrencies(data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchCurrencies(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: form.code.toUpperCase().trim(),
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        is_default: form.is_default,
        sort_order: form.sort_order,
        exchange_rate: form.exchange_rate,
      };
      if (editingId) {
        await api.patch(`/api/v1/currencies/${editingId}`, payload);
      } else {
        await api.post("/api/v1/currencies", payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchCurrencies();
    } catch { alert("Failed to save currency"); }
    finally { setSubmitting(false); }
  };

  const handleEdit = (c: Currency) => {
    setForm({
      code: c.code,
      name: c.name,
      icon: c.icon || "",
      is_default: c.is_default,
      sort_order: c.sort_order,
      exchange_rate: c.exchange_rate || 1,
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const cancelForm = () => { setShowForm(false); setEditingId(null); setForm(emptyForm); };

  const handleToggleActive = async (c: Currency) => {
    setActionId(c.id);
    try { await api.patch(`/api/v1/currencies/${c.id}`, { active: !c.active }); fetchCurrencies(); }
    catch { alert("Failed to update"); }
    finally { setActionId(null); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this currency?")) return;
    setActionId(id);
    try { await api.delete(`/api/v1/currencies/${id}`); fetchCurrencies(); }
    catch { alert("Failed to delete"); }
    finally { setActionId(null); }
  };

  const handleConvert = async (c: Currency) => {
    if (!confirm(`แปลง ${c.name} ทั้งหมดของทุก user เป็น Point ตามอัตรา 1 ${c.code} = ${c.exchange_rate} Point?\n\nดำเนินการนี้ไม่สามารถย้อนกลับได้`)) return;
    setConverting(c.code);
    try {
      const result = await api.post<{ users_affected: number; total_converted: number; points_credited: number }>(
        `/api/v1/currencies/${c.code}/convert`, {}
      );
      alert(`แปลงสำเร็จ!\n\nUsers: ${result.users_affected}\nConverted: ${result.total_converted} ${c.code}\nPoints credited: ${result.points_credited}`);
      fetchCurrencies();
    } catch (err) { alert(err instanceof Error ? err.message : "Conversion failed"); }
    finally { setConverting(null); }
  };

  const fieldClass = "w-full h-[44px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";
  const labelClass = "block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Point Currencies</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">กำหนดสกุลแต้มที่ใช้ในระบบ เช่น Point, Diamond, Star — พร้อมอัตราแลกเปลี่ยน</p>
        </div>
        <button onClick={() => (showForm ? cancelForm() : setShowForm(true))} className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all">
          {showForm ? (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>Cancel</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>Add Currency</>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5">
            {editingId ? "Edit Currency" : "Create Currency"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Code</label>
                <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required maxLength={20} className={`${fieldClass} font-mono`} placeholder="e.g. DIAMOND" />
              </div>
              <div>
                <label className={labelClass}>Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={fieldClass} placeholder="e.g. Diamond" />
              </div>
              <div ref={emojiRef} className="relative">
                <label className={labelClass}>Icon (emoji)</label>
                <button
                  type="button"
                  onClick={() => setEmojiPickerOpen(!emojiPickerOpen)}
                  className={`${fieldClass} flex items-center gap-3 text-left cursor-pointer`}
                >
                  {form.icon ? (
                    <>
                      <span className="text-[24px] leading-none">{form.icon}</span>
                      <span className="text-[var(--md-on-surface-variant)] text-[13px]">เปลี่ยน</span>
                    </>
                  ) : (
                    <span className="text-[var(--md-on-surface-variant)] opacity-60">คลิกเพื่อเลือก emoji</span>
                  )}
                  {form.icon && (
                    <span
                      onClick={(e) => { e.stopPropagation(); setForm({ ...form, icon: "" }); }}
                      className="ml-auto w-[22px] h-[22px] flex items-center justify-center rounded-full hover:bg-[var(--md-surface-container-high)] text-[var(--md-on-surface-variant)]"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[14px] h-[14px]"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
                    </span>
                  )}
                </button>
                {emojiPickerOpen && (
                  <div className="absolute z-50 top-[72px] left-0 right-0 bg-[var(--md-surface)] border border-[var(--md-outline-variant)] rounded-[var(--md-radius-md)] md-elevation-3 p-3 max-h-[320px] overflow-y-auto min-w-[280px]">
                    {EMOJI_GROUPS.map((group) => (
                      <div key={group.label} className="mb-3 last:mb-0">
                        <p className="text-[10px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-[0.5px] mb-1.5 px-1">{group.label}</p>
                        <div className="flex flex-wrap gap-1">
                          {group.emojis.map((emoji) => (
                            <button key={emoji} type="button" onClick={() => { setForm({ ...form, icon: emoji }); setEmojiPickerOpen(false); }}
                              className={`w-[36px] h-[36px] flex items-center justify-center text-[20px] rounded-[var(--md-radius-sm)] hover:bg-[var(--md-primary-container)] transition-colors ${form.icon === emoji ? "bg-[var(--md-primary-container)] ring-2 ring-[var(--md-primary)]" : ""}`}>
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className={labelClass}>Exchange Rate (1 unit = ? Point)</label>
                <input type="number" value={form.exchange_rate} onChange={(e) => setForm({ ...form, exchange_rate: parseFloat(e.target.value) || 1 })} min={0.01} step={0.01} className={fieldClass} />
                <p className="text-[11px] text-[var(--md-on-surface-variant)] mt-1">ตัวอย่าง: 5 = 1 {form.code || "unit"} แลกได้ 5 Point</p>
              </div>
              <div>
                <label className={labelClass}>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} min={0} className={fieldClass} />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4 rounded border-[var(--md-outline)] text-[var(--md-primary)]" />
                <label htmlFor="is_default" className="text-[14px] text-[var(--md-on-surface)]">Default currency</label>
              </div>
            </div>
            <button type="submit" disabled={submitting} className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] disabled:opacity-60 transition-all">
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}
            </button>
          </form>
        </div>
      )}

      {/* Info box */}
      <div className="bg-[var(--md-primary-container)]/20 border border-[var(--md-primary)]/20 rounded-[var(--md-radius-md)] px-5 py-3 mb-6">
        <p className="text-[13px] text-[var(--md-on-surface-variant)]">
          <strong>หน้านี้ = Master Data</strong> — กำหนด currency คืออะไร + อัตราแลก | การตั้งว่าสินค้าไหนได้ bonus อะไร + วันหมดอายุ ไปตั้งที่หน้า <a href="/promotions" className="text-[var(--md-primary)] underline">Promotions</a>
        </p>
      </div>

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              {["Icon", "Code", "Name", "Exchange Rate", "Active", "Actions"].map((h) => (
                <th key={h} className={`${h === "Actions" ? "text-right" : "text-left"} px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">
                <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Loading...
                </div>
              </td></tr>
            ) : currencies.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center text-[var(--md-on-surface-variant)]">
                <p className="text-[14px]">No currencies yet</p>
              </td></tr>
            ) : currencies.map((c) => (
              <tr key={c.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors">
                <td className="px-6 py-4"><span className="text-[24px]">{c.icon || "—"}</span></td>
                <td className="px-6 py-4 font-mono text-[14px] font-medium text-[var(--md-on-surface)]">
                  {c.code}
                  {c.is_default && <span className="ml-2 text-[10px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] px-2 py-0.5 rounded-full">DEFAULT</span>}
                </td>
                <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface)]">{c.name}</td>
                <td className="px-6 py-4">
                  <span className="text-[14px] text-[var(--md-on-surface)]">1 = {c.exchange_rate} pt</span>
                </td>
                <td className="px-6 py-4">
                  <button role="switch" aria-checked={c.active} onClick={() => handleToggleActive(c)} disabled={actionId === c.id}
                    className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-50 ${c.active ? "bg-[var(--md-primary)]" : "bg-[var(--md-outline-variant)]"}`}>
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${c.active ? "left-6" : "left-1"}`} />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-1.5 justify-end">
                    <button onClick={() => handleEdit(c)} className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all">Edit</button>
                    {!c.is_default && c.code !== "point" && (
                      <button
                        onClick={() => handleConvert(c)}
                        disabled={converting === c.code}
                        className="h-[26px] px-3 text-[12px] font-medium text-amber-700 bg-amber-50 dark:text-amber-400 dark:bg-amber-950 rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all disabled:opacity-50"
                      >
                        {converting === c.code ? "Converting..." : "Convert to Point"}
                      </button>
                    )}
                    <button onClick={() => handleDelete(c.id)} disabled={c.is_default || actionId === c.id}
                      className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-error)] bg-[var(--md-error-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
