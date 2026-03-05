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

const actionColor: Record<string, string> = {
  create: "bg-[var(--md-success-light)] text-[var(--md-success)]",
  update: "bg-[var(--md-info-light)] text-[var(--md-info)]",
  delete: "bg-[var(--md-error-light)] text-[var(--md-error)]",
  login: "bg-[var(--md-warning-light)] text-[var(--md-warning)]",
};

function getActionStyle(action: string): string {
  const key = Object.keys(actionColor).find((k) => action.toLowerCase().includes(k));
  return key ? actionColor[key] : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]";
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
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchAudit();
  }, []);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
          Audit Log
        </h1>
        <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
          Track all system activities and changes
        </p>
      </div>

      {/* Table */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Timestamp</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Action</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Entity</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">Actor</th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">IP</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : entries.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-[var(--md-on-surface-variant)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <p className="text-[14px]">No audit entries yet</p>
                    <p className="text-[12px] mt-1 opacity-60">Activities will appear here as they happen</p>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((e) => (
                <tr key={e.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150">
                  <td className="px-6 py-3.5 text-[13px] text-[var(--md-on-surface-variant)] font-mono">
                    {new Date(e.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className={`inline-block px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium ${getActionStyle(e.action)}`}>
                      {e.action}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[13px] text-[var(--md-on-surface)]">
                    {e.entity_type}
                    {e.entity_id && (
                      <span className="text-[var(--md-on-surface-variant)] ml-1 font-mono text-[11px]">
                        ({e.entity_id.slice(0, 8)}...)
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3.5 text-[13px] text-[var(--md-on-surface-variant)] font-mono">{e.actor_id?.slice(0, 8) || "system"}</td>
                  <td className="px-6 py-3.5 text-[13px] text-[var(--md-on-surface-variant)]">{e.ip_address || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
