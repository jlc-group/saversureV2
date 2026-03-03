"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Stats {
  campaigns: number;
  batches: number;
  rewards: number;
  scans_today: number;
}

const defaultStats: Stats = { campaigns: 0, batches: 0, rewards: 0, scans_today: 0 };

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>(defaultStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<Stats>("/api/v1/dashboard/summary");
        if (data && typeof data.campaigns === "number") {
          setStats(data);
        }
      } catch {
        // API might not be ready yet, use defaults
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Campaigns", value: stats.campaigns, color: "bg-blue-500", icon: "M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6" },
    { label: "Batches", value: stats.batches, color: "bg-emerald-500", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { label: "Rewards", value: stats.rewards, color: "bg-amber-500", icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12" },
    { label: "Scans Today", value: stats.scans_today, color: "bg-purple-500", icon: "M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {loading ? "..." : (card.value ?? 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/campaigns" className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition">
            <span className="text-blue-600 font-medium">Create Campaign</span>
          </a>
          <a href="/batches" className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition">
            <span className="text-emerald-600 font-medium">Generate Batch</span>
          </a>
          <a href="/rewards" className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
            <span className="text-amber-600 font-medium">Add Reward</span>
          </a>
        </div>
      </div>
    </div>
  );
}
