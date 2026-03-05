"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Reward {
  id: string;
  name: string;
  type: string;
  point_cost: number;
  total_qty: number;
  reserved_qty: number;
  sold_qty: number;
  available_qty: number;
  created_at: string;
}

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ campaign_id: "", name: "", description: "", type: "physical", point_cost: 100, total_qty: 100 });
  const [submitting, setSubmitting] = useState(false);
  const [inventoryModal, setInventoryModal] = useState<{ id: string; name: string; delta: number } | null>(null);
  const [updatingInv, setUpdatingInv] = useState(false);

  const fetchRewards = async () => {
    try {
      const data = await api.get<{ data: Reward[] }>("/api/v1/rewards");
      setRewards(data.data || []);
    } catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchRewards(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/v1/rewards", form);
      setShowForm(false);
      setForm({ campaign_id: "", name: "", description: "", type: "physical", point_cost: 100, total_qty: 100 });
      fetchRewards();
    } catch { alert("Failed to create reward"); } finally { setSubmitting(false); }
  };

  const handleUpdateInventory = async () => {
    if (!inventoryModal) return;
    setUpdatingInv(true);
    try {
      await api.patch(`/api/v1/rewards/${inventoryModal.id}/inventory`, { delta: inventoryModal.delta });
      setInventoryModal(null);
      fetchRewards();
    } catch { alert("Failed to update inventory"); } finally { setUpdatingInv(false); }
  };

  const fieldClass = "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">Rewards & Inventory</h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">Manage reward items and track inventory</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {showForm ? (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>Cancel</>
          ) : (
            <><svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>Add Reward</>
          )}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">Add Reward</h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Campaign ID</label>
                <input type="text" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })} required className={fieldClass} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className={fieldClass} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className={fieldClass}>
                  <option value="physical">Physical Item</option>
                  <option value="digital">Digital</option>
                  <option value="coupon">Coupon</option>
                  <option value="ticket">Ticket</option>
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Point Cost</label>
                <input type="number" value={form.point_cost} onChange={(e) => setForm({ ...form, point_cost: parseInt(e.target.value) || 1 })} min={1} required className={fieldClass} />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">Total Quantity</label>
                <input type="number" value={form.total_qty} onChange={(e) => setForm({ ...form, total_qty: parseInt(e.target.value) || 1 })} min={1} required className={fieldClass} />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 active:scale-[0.98] transition-all duration-200">
              {submitting ? "Creating..." : "Create Reward"}
            </button>
          </form>
        </div>
      )}

      {/* Inventory Modal */}
      {inventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={() => setInventoryModal(null)}>
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-3 p-6 w-full max-w-[400px] mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-1">Update Inventory</h3>
            <p className="text-[13px] text-[var(--md-on-surface-variant)] mb-5">{inventoryModal.name}</p>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                Quantity Change (+ เพิ่ม, - ลด)
              </label>
              <input
                type="number"
                value={inventoryModal.delta}
                onChange={(e) => setInventoryModal({ ...inventoryModal, delta: parseInt(e.target.value) || 0 })}
                className="w-full h-[56px] px-5 border border-[var(--md-outline)] rounded-[var(--md-radius-md)] text-[20px] font-mono text-[var(--md-on-surface)] bg-transparent outline-none text-center focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200"
                autoFocus
              />
              <div className="flex gap-2 mt-3 justify-center">
                {[10, 50, 100, 500].map((n) => (
                  <button key={n} type="button" onClick={() => setInventoryModal({ ...inventoryModal, delta: n })} className="h-[32px] px-3 text-[12px] font-medium text-[var(--md-success)] bg-[var(--md-success-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all">
                    +{n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setInventoryModal(null)} className="flex-1 h-[40px] text-[14px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-xl)] hover:bg-[var(--md-surface-container-high)] transition-all duration-200">
                Cancel
              </button>
              <button onClick={handleUpdateInventory} disabled={updatingInv || inventoryModal.delta === 0} className="flex-1 h-[40px] text-[14px] font-medium text-white bg-[var(--md-primary)] rounded-[var(--md-radius-xl)] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 transition-all duration-200">
                {updatingInv ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Reward</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Type</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Cost</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Total</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Available</th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]"><svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Loading...</div></td></tr>
            ) : rewards.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="text-[var(--md-on-surface-variant)]"><svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68A2.99 2.99 0 009 2C7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" /></svg><p className="text-[14px]">No rewards yet</p></div></td></tr>
            ) : (
              rewards.map((r) => {
                const pct = r.total_qty > 0 ? Math.round((r.available_qty / r.total_qty) * 100) : 0;
                return (
                  <tr key={r.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150">
                    <td className="px-6 py-4 text-[14px] font-medium text-[var(--md-on-surface)]">{r.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] capitalize">{r.type}</span>
                    </td>
                    <td className="px-6 py-4 text-right text-[14px] text-[var(--md-on-surface-variant)]">{r.point_cost.toLocaleString()} pts</td>
                    <td className="px-6 py-4 text-right text-[14px] font-medium text-[var(--md-on-surface)]">{r.total_qty.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[14px] font-bold text-[var(--md-primary)]">{r.available_qty.toLocaleString()}</span>
                        <div className="w-16 h-1.5 bg-[var(--md-surface-container)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--md-primary)] rounded-full transition-all" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setInventoryModal({ id: r.id, name: r.name, delta: 0 })}
                        className="h-[30px] px-3 text-[12px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200"
                      >
                        Update Stock
                      </button>
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
