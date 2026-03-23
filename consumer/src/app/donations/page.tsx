"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Navbar from "@/components/Navbar";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface Donation {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  target_points: number;
  collected_points: number;
  status: string;
  donor_count: number;
}

const PRESETS = [10, 50, 100, 500];

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Donation | null>(null);
  const [points, setPoints] = useState(0);
  const [donateAmount, setDonateAmount] = useState<number>(0);
  const [donating, setDonating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadDonations();
    if (isLoggedIn()) {
      api.get<{ balance: number }>("/api/v1/points/balance").then((d) => setPoints(d.balance)).catch(() => {});
    }
  }, []);

  const loadDonations = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Donation[] }>("/api/v1/public/donations");
      setDonations(res.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    if (!selected || donateAmount <= 0) return;
    if (!isLoggedIn()) {
      alert("Please login first");
      return;
    }
    if (points < donateAmount) {
      alert("Not enough points");
      return;
    }

    setDonating(true);
    try {
      await api.post(`/api/v1/my/donations/${selected.id}/donate`, { points: donateAmount });
      setSuccessMsg("Donation successful! Thank you for your support.");
      setTimeout(() => setSuccessMsg(""), 3000);
      setDonateAmount(0);
      setPoints((p) => p - donateAmount);
      setSelected((s) =>
        s
          ? {
              ...s,
              collected_points: s.collected_points + donateAmount,
              donor_count: s.donor_count + 1,
            }
          : null
      );
      setDonations((list) =>
        list.map((d) =>
          d.id === selected.id
            ? {
                ...d,
                collected_points: d.collected_points + donateAmount,
                donor_count: d.donor_count + 1,
              }
            : d
        )
      );
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to donate");
    } finally {
      setDonating(false);
    }
  };

  if (selected) {
    const progress = selected.target_points > 0 ? Math.min(100, (selected.collected_points / selected.target_points) * 100) : 0;

    return (
      <div className="pb-20">
        <Navbar />
        <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
          <div className="max-w-[480px] mx-auto flex items-center h-14 px-4 gap-3">
            <button
              onClick={() => {
                setSelected(null);
                setDonateAmount(0);
                setSuccessMsg("");
              }}
              className="text-[var(--on-surface)]"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <h1 className="text-[16px] font-medium text-[var(--on-surface)] truncate">{selected.title}</h1>
          </div>
        </div>

        <div className="max-w-[480px] mx-auto px-5 py-5 space-y-5">
          {selected.image_url && (
            <img
              src={selected.image_url}
              alt=""
              className="w-full rounded-[var(--radius-lg)] object-cover max-h-[200px]"
            />
          )}

          <div>
            <h2 className="text-[20px] font-semibold text-[var(--on-surface)]">{selected.title}</h2>
            {selected.description && (
              <p className="text-[14px] text-[var(--on-surface-variant)] mt-2 whitespace-pre-wrap">
                {selected.description}
              </p>
            )}
          </div>

          <div className="bg-white rounded-[var(--radius-lg)] elevation-1 p-4">
            <div className="flex justify-between text-[12px] text-[var(--on-surface-variant)] mb-2">
              <span>{selected.collected_points.toLocaleString()} / {selected.target_points.toLocaleString()} pts</span>
              <span>{selected.donor_count} donors</span>
            </div>
            <div className="h-2 bg-[var(--outline-variant)] rounded-[var(--radius-sm)] overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] rounded-[var(--radius-sm)] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {successMsg && (
            <div className="bg-[var(--success-light)] border border-[var(--success)] rounded-[var(--radius-lg)] p-3 text-center">
              <p className="text-[13px] font-medium text-[var(--success)]">{successMsg}</p>
            </div>
          )}

          {isLoggedIn() && (
            <div className="bg-white rounded-[var(--radius-lg)] elevation-1 p-4 space-y-4">
              <h3 className="text-[16px] font-semibold text-[var(--on-surface)]">Donate Points</h3>
              <p className="text-[12px] text-[var(--on-surface-variant)]">Your balance: {points.toLocaleString()} pts</p>
              <div className="flex gap-2 flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setDonateAmount(p)}
                    className="h-[36px] px-4 rounded-[var(--radius-xl)] text-[13px] font-medium bg-[var(--primary-light)] text-[var(--primary)] active:scale-[0.95]"
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={donateAmount || ""}
                  onChange={(e) => setDonateAmount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  placeholder="Amount"
                  className="flex-1 h-[44px] px-4 rounded-[var(--radius-lg)] border border-[var(--outline-variant)] text-[var(--on-surface)] bg-white text-[14px]"
                />
                <button
                  onClick={() => setDonateAmount(0)}
                  className="h-[44px] px-4 rounded-[var(--radius-lg)] text-[13px] text-[var(--on-surface-variant)]"
                >
                  Clear
                </button>
              </div>
              <button
                onClick={handleDonate}
                disabled={donating || donateAmount <= 0 || points < donateAmount}
                className="w-full h-[48px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium disabled:opacity-50"
              >
                {donating ? "Donating..." : donateAmount > 0 ? `Donate ${donateAmount.toLocaleString()} pts` : "Donate"}
              </button>
            </div>
          )}

          {!isLoggedIn() && (
            <Link
              href="/login"
              className="block w-full h-[48px] leading-[48px] text-center bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[15px] font-medium"
            >
              Login to Donate
            </Link>
          )}
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <Navbar />
      <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
        <div className="max-w-[480px] mx-auto flex items-center h-14 px-4 gap-3">
          <Link href="/" className="text-[var(--on-surface)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </Link>
          <h1 className="text-[18px] font-semibold text-[var(--on-surface)]">Donations</h1>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin w-6 h-6 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : donations.length === 0 ? (
        <div className="max-w-[480px] mx-auto text-center py-16 text-[var(--on-surface-variant)]">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <p className="text-[14px]">No active donations</p>
        </div>
      ) : (
        <div className="max-w-[480px] mx-auto px-5 py-4 space-y-3">
          {donations.map((d) => {
            const progress = d.target_points > 0 ? Math.min(100, (d.collected_points / d.target_points) * 100) : 0;
            return (
              <button
                key={d.id}
                onClick={() => setSelected(d)}
                className="w-full bg-white rounded-[var(--radius-lg)] elevation-1 overflow-hidden text-left"
              >
                {d.image_url ? (
                  <img src={d.image_url} alt="" className="w-full h-[140px] object-cover" />
                ) : (
                  <div className="w-full h-[100px] bg-[var(--primary-light)] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" fill="var(--primary)" className="w-12 h-12 opacity-50">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-[16px] font-semibold text-[var(--on-surface)] line-clamp-1">{d.title}</h3>
                  <div className="mt-2">
                    <div className="flex justify-between text-[11px] text-[var(--on-surface-variant)] mb-1">
                      <span>{d.collected_points.toLocaleString()} / {d.target_points.toLocaleString()} pts</span>
                      <span>{d.donor_count} donors</span>
                    </div>
                    <div className="h-1.5 bg-[var(--outline-variant)] rounded-[var(--radius-sm)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--primary)] rounded-[var(--radius-sm)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
