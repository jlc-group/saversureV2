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

  const fetchRewards = async () => {
    try {
      const data = await api.get<{ data: Reward[] }>("/api/v1/rewards");
      setRewards(data.data || []);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
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
    } catch {
      alert("Failed to create reward");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rewards & Inventory</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {showForm ? "Cancel" : "Add Reward"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Reward</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign ID</label>
                <input type="text" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                  <option value="physical">Physical Item</option>
                  <option value="digital">Digital</option>
                  <option value="coupon">Coupon</option>
                  <option value="ticket">Ticket</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Point Cost</label>
                <input type="number" value={form.point_cost} onChange={(e) => setForm({ ...form, point_cost: parseInt(e.target.value) || 1 })} min={1} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
                <input type="number" value={form.total_qty} onChange={(e) => setForm({ ...form, total_qty: parseInt(e.target.value) || 1 })} min={1} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" />
              </div>
            </div>
            <button type="submit" disabled={submitting} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium">
              {submitting ? "Creating..." : "Create Reward"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reward</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Cost</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Reserved</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Sold</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Available</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : rewards.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-8 text-center text-gray-400">No rewards yet</td></tr>
            ) : (
              rewards.map((r) => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{r.type}</td>
                  <td className="px-6 py-4 text-right text-gray-600">{r.point_cost.toLocaleString()} pts</td>
                  <td className="px-6 py-4 text-right text-gray-900 font-medium">{r.total_qty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-yellow-600">{r.reserved_qty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-green-600">{r.sold_qty.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-600">{r.available_qty.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
