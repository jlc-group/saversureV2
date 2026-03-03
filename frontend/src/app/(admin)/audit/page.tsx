"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface AuditEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address: string;
  created_at: string;
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const data = await api.get<{ data: AuditEntry[] }>("/api/v1/audit?limit=100");
        setEntries(data.data || []);
      } catch {
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Audit Log</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Entity</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actor</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : entries.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No audit entries yet</td></tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                      {e.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-600">
                    {e.entity_type}
                    {e.entity_id && <span className="text-gray-400 ml-1">({e.entity_id.slice(0, 8)}...)</span>}
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500 font-mono">{e.actor_id?.slice(0, 8) || "system"}</td>
                  <td className="px-6 py-3 text-sm text-gray-400">{e.ip_address || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
