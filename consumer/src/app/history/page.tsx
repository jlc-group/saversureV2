"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface PointEntry {
  id: string;
  type: string;
  amount: number;
  source: string;
  description: string;
  balance_after: number;
  created_at: string;
}

export default function HistoryPage() {
  const [entries, setEntries] = useState<PointEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: PointEntry[] }>("/api/v1/points/history")
      .then((d) => setEntries(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1557b0] text-white px-5 pt-12 pb-6 rounded-b-[24px]">
        <h1 className="text-[22px] font-semibold">Point History</h1>
        <p className="text-[13px] opacity-80 mt-1">{entries.length} transactions</p>
      </div>

      <div className="px-5 mt-6 space-y-2">
        {loading ? (
          <div className="text-center py-12">
            <svg className="animate-spin w-6 h-6 mx-auto text-[var(--on-surface-variant)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 text-[var(--on-surface-variant)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            <p className="text-[14px]">No point history yet</p>
          </div>
        ) : (
          entries.map((e) => {
            const isCredit = e.type === "credit";
            return (
              <div key={e.id} className="bg-white rounded-[var(--radius-md)] elevation-1 px-4 py-3 flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isCredit ? "bg-[var(--success-light)]" : "bg-[var(--error-light)]"
                }`}>
                  <svg viewBox="0 0 24 24" fill={isCredit ? "var(--success)" : "var(--error)"} className="w-5 h-5">
                    <path d={isCredit ? "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" : "M19 13H5v-2h14v2z"} />
                  </svg>
                </div>
                <div className="flex-1 ml-3 min-w-0">
                  <p className="text-[13px] font-medium text-[var(--on-surface)] truncate">
                    {e.source === "scan" ? "QR Scan" : e.source === "redeem" ? "Redeem" : e.source}
                  </p>
                  <p className="text-[11px] text-[var(--on-surface-variant)]">
                    {new Date(e.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right ml-2">
                  <p className={`text-[15px] font-bold ${isCredit ? "text-[var(--success)]" : "text-[var(--error)]"}`}>
                    {isCredit ? "+" : ""}{e.amount}
                  </p>
                  <p className="text-[10px] text-[var(--on-surface-variant)]">
                    bal: {e.balance_after}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </div>
  );
}
