"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface RedeemEntry {
  id: string;
  reward_name: string | null;
  status: string;
  tracking: string | null;
  created_at: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: "bg-[var(--warning-light)]", text: "text-[var(--warning)]" },
  CONFIRMED: { bg: "bg-[var(--info-light)]", text: "text-[var(--info)]" },
  SHIPPING: { bg: "bg-[#fff3e0]", text: "text-[#e65100]" },
  SHIPPED: { bg: "bg-[#e8f5e9]", text: "text-[#2e7d32]" },
  COMPLETED: { bg: "bg-[var(--success-light)]", text: "text-[var(--success)]" },
  EXPIRED: { bg: "bg-[var(--surface-container)]", text: "text-[var(--on-surface-variant)]" },
  CANCELLED: { bg: "bg-[var(--error-light)]", text: "text-[var(--error)]" },
};

export default function RedeemHistoryPage() {
  const [entries, setEntries] = useState<RedeemEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: RedeemEntry[] }>("/api/v1/redeem-transactions")
      .then((d) => setEntries(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-[var(--primary)] to-[#1557b0] text-white px-5 pt-12 pb-6 rounded-b-[24px]">
        <h1 className="text-[22px] font-semibold">Redemption History</h1>
        <p className="text-[13px] opacity-80 mt-1">{entries.length} redemptions</p>
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
            <p className="text-[14px]">No redemptions yet</p>
          </div>
        ) : (
          entries.map((e) => {
            const s = statusColors[e.status] || statusColors.PENDING;
            return (
              <div key={e.id} className="bg-white rounded-[var(--radius-md)] elevation-1 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-medium text-[var(--on-surface)]">{e.reward_name || "Reward"}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
                    {e.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-[11px] text-[var(--on-surface-variant)]">
                    {new Date(e.created_at).toLocaleDateString()}
                  </p>
                  {e.tracking && (
                    <p className="text-[11px] text-[var(--on-surface-variant)]">
                      Tracking: <span className="font-mono">{e.tracking}</span>
                    </p>
                  )}
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
