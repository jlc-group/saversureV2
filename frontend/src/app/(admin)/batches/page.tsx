"use client";

import { useEffect, useState } from "react";
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
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ campaign_id: "", prefix: "", serial_start: 1, serial_end: 10000 });
  const [submitting, setSubmitting] = useState(false);

  const fetchBatches = async () => {
    try {
      const data = await api.get<{ data: Batch[] }>("/api/v1/batches");
      setBatches(data.data || []);
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/api/v1/batches", form);
      setShowForm(false);
      fetchBatches();
    } catch {
      alert("Failed to create batch");
    } finally {
      setSubmitting(false);
    }
  };

  const statusColor: Record<string, string> = {
    generated: "bg-blue-100 text-blue-700",
    printed: "bg-yellow-100 text-yellow-700",
    distributed: "bg-green-100 text-green-700",
    recalled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          {showForm ? "Cancel" : "Generate Batch"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Generate New Batch</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign ID</label>
                <input
                  type="text"
                  value={form.campaign_id}
                  onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Campaign UUID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prefix</label>
                <input
                  type="text"
                  value={form.prefix}
                  onChange={(e) => setForm({ ...form, prefix: e.target.value })}
                  required
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g. SV2026"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial Start</label>
                <input
                  type="number"
                  value={form.serial_start}
                  onChange={(e) => setForm({ ...form, serial_start: parseInt(e.target.value) || 1 })}
                  min={1}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Serial End</label>
                <input
                  type="number"
                  value={form.serial_end}
                  onChange={(e) => setForm({ ...form, serial_end: parseInt(e.target.value) || 10000 })}
                  min={form.serial_start + 1}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <p className="text-sm text-gray-500">
              This will generate {(form.serial_end - form.serial_start + 1).toLocaleString()} QR codes (metadata only, codes are created on-scan).
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition text-sm font-medium"
            >
              {submitting ? "Generating..." : "Generate"}
            </button>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Prefix</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Range</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Codes</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Created</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : batches.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No batches yet</td></tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-medium text-gray-900">{b.prefix}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{b.serial_start.toLocaleString()} - {b.serial_end.toLocaleString()}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{b.code_count.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[b.status] || ""}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{new Date(b.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
