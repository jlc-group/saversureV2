"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface Tier {
  id: string;
  name: string;
  min_points: number;
  icon: string;
  color: string;
  sort_order: number;
  active: boolean;
  created_at: string;
}

export default function TiersPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    min_points: 0,
    icon: "🥉",
    color: "#CD7F32",
    sort_order: 0,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchTiers = async () => {
    try {
      const data = await api.get<{ data: Tier[] }>("/api/v1/tiers");
      setTiers(data.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTiers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        min_points: form.min_points,
        icon: form.icon.trim() || "🥉",
        color: form.color.trim() || "#CD7F32",
        sort_order: form.sort_order,
      };
      if (editingId) {
        await api.patch(`/api/v1/tiers/${editingId}`, payload);
      } else {
        await api.post("/api/v1/tiers", payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
      fetchTiers();
    } catch {
      toast.error("Failed to save tier");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (t: Tier) => {
    setForm({
      name: t.name,
      min_points: t.min_points,
      icon: t.icon || "🥉",
      color: t.color || "#CD7F32",
      sort_order: t.sort_order,
    });
    setEditingId(t.id);
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleToggleActive = async (t: Tier) => {
    setActionId(t.id);
    try {
      await api.patch(`/api/v1/tiers/${t.id}`, { active: !t.active });
      fetchTiers();
    } catch {
      toast.error("Failed to update");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tier?")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/tiers/${id}`);
      fetchTiers();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  const fieldClass =
    "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            Reward Tiers
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            กำหนดระดับสมาชิกตามแต้มสะสม เช่น Bronze, Silver, Gold
          </p>
        </div>
        <button
          onClick={() => (showForm ? cancelForm() : setShowForm(true))}
          className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {showForm ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Add Tier
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
            {editingId ? "Edit Tier" : "Create Tier"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className={fieldClass}
                  placeholder="e.g. Bronze"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  Min Points
                </label>
                <input
                  type="number"
                  value={form.min_points}
                  onChange={(e) => setForm({ ...form, min_points: parseInt(e.target.value) || 0 })}
                  min={0}
                  className={fieldClass}
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  Icon (emoji)
                </label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  className={fieldClass}
                  placeholder="e.g. 🥉 🥈 🥇"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  Color
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-12 h-[48px] p-1 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.color}
                    onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className={fieldClass}
                    placeholder="#CD7F32"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  Sort Order
                </label>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  min={0}
                  className={fieldClass}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  Preview
                </label>
                <div
                  className="inline-flex items-center gap-3 px-4 py-3 rounded-[var(--md-radius-lg)] border border-[var(--md-outline-variant)]"
                  style={{ backgroundColor: form.color + "20", borderColor: form.color + "60" }}
                >
                  <span className="text-[28px] leading-none">{form.icon || "🥉"}</span>
                  <span className="text-[16px] font-medium" style={{ color: form.color }}>
                    {form.name || "Tier Name"}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 active:scale-[0.98] transition-all duration-200"
            >
              {submitting ? "Saving..." : editingId ? "Save Changes" : "Create"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Icon
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Name
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Min Points
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Color
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Sort Order
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Active
              </th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : tiers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="text-[var(--md-on-surface-variant)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <p className="text-[14px]">No tiers yet</p>
                  </div>
                </td>
              </tr>
            ) : (
              tiers.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150"
                >
                  <td className="px-6 py-4">
                    <span className="text-[24px] leading-none">{t.icon || "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-[14px] font-medium text-[var(--md-on-surface)]">
                    {t.name}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface)]">
                    {t.min_points.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div
                      className="w-8 h-8 rounded-[var(--md-radius-sm)] border border-[var(--md-outline-variant)]"
                      style={{ backgroundColor: t.color || "#CD7F32" }}
                    />
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface-variant)]">
                    {t.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      role="switch"
                      aria-checked={t.active}
                      onClick={() => handleToggleActive(t)}
                      disabled={actionId === t.id}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                        t.active ? "bg-[var(--md-primary)]" : "bg-[var(--md-outline-variant)]"
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                          t.active ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleEdit(t)}
                        className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={actionId === t.id}
                        className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-error)] bg-[var(--md-error-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
