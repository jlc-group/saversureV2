"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";

interface CustomerDetail {
  profile: {
    id: string;
    email: string;
    phone?: string;
    display_name: string;
    first_name?: string;
    last_name?: string;
    birth_date?: string;
    gender?: string;
    avatar_url?: string;
    province?: string;
    occupation?: string;
    customer_flag: string;
    phone_verified: boolean;
    status: string;
    created_at: string;
    last_login_at?: string;
  };
  balance: number;
  scan_history: Array<{
    id: string;
    campaign_id: string;
    points_earned: number;
    scanned_at: string;
    latitude?: number;
    longitude?: number;
  }>;
  point_ledger: Array<{
    id: string;
    type: string;
    amount: number;
    source: string;
    description: string;
    created_at: string;
  }>;
  redemptions: Array<{
    id: string;
    status: string;
    created_at: string;
    reward_name: string;
    point_cost: number;
  }>;
  addresses: Array<{
    id: string;
    label: string;
    recipient_name: string;
    phone: string;
    address_line1: string;
    province?: string;
    postal_code?: string;
    is_default: boolean;
  }>;
}

const statusBadgeStyle: Record<string, { bg: string; text: string }> = {
  active: { bg: "bg-green-100", text: "text-green-700" },
  suspended: { bg: "bg-red-100", text: "text-red-700" },
  confirmed: { bg: "bg-blue-100", text: "text-blue-700" },
  pending: { bg: "bg-orange-100", text: "text-orange-700" },
};

const flagLabels: Record<string, { emoji: string; label: string; color: string }> = {
  green: { emoji: "🟢", label: "ปกติ", color: "text-green-600" },
  yellow: { emoji: "🟡", label: "สงสัย", color: "text-yellow-600" },
  orange: { emoji: "🟠", label: "เฝ้าระวัง", color: "text-orange-600" },
  black: { emoji: "⚫", label: "บล็อก", color: "text-gray-900" },
  gray: { emoji: "⚪", label: "ไม่ระบุ", color: "text-gray-500" },
  white: { emoji: "⚪", label: "ใหม่", color: "text-gray-400" },
};

const genderLabels: Record<string, string> = {
  male: "ชาย",
  female: "หญิง",
  other: "อื่นๆ",
};

function StatusBadge({ status }: { status: string }) {
  const s = statusBadgeStyle[status] || statusBadgeStyle.pending;
  return (
    <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${s.bg} ${s.text}`}>
      {status}
    </span>
  );
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refundModal, setRefundModal] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get<CustomerDetail>(`/api/v1/customers/${id}/detail`);
        setData(res);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(refundAmount, 10);
    if (!amount || amount <= 0) {
      alert("กรุณาระบุจำนวน points ที่ถูกต้อง");
      return;
    }
    setRefundSubmitting(true);
    try {
      await api.post("/api/v1/points/refund", {
        user_id: id,
        amount,
        reason: refundReason || "Admin refund",
      });
      setRefundModal(false);
      setRefundAmount("");
      setRefundReason("");
      const res = await api.get<CustomerDetail>(`/api/v1/customers/${id}/detail`);
      setData(res);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Refund failed";
      alert(msg);
    } finally {
      setRefundSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <svg className="animate-spin w-8 h-8 text-[var(--md-primary)]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--md-on-surface-variant)]">ไม่พบข้อมูลลูกค้า</p>
        <Link href="/customers" className="mt-4 inline-block text-[var(--md-primary)] hover:underline">
          กลับไปรายการลูกค้า
        </Link>
      </div>
    );
  }

  const { profile, balance } = data;
  const scan_history = data.scan_history || [];
  const point_ledger = data.point_ledger || [];
  const redemptions = data.redemptions || [];
  const addresses = data.addresses || [];
  const totalEarned = point_ledger.filter((l) => l.type === "credit").reduce((s, l) => s + l.amount, 0);
  const totalSpent = point_ledger.filter((l) => l.type === "debit").reduce((s, l) => s + l.amount, 0);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/customers"
        className="inline-flex items-center gap-1.5 text-[14px] text-[var(--md-on-surface-variant)] hover:text-[var(--md-primary)] transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        กลับไปรายการลูกค้า
      </Link>

      {/* Profile header */}
      <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] border border-gray-200 dark:border-[var(--md-outline-variant)] p-6">
        <div className="flex items-start gap-5">
          <div className="flex-shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name}
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[var(--md-surface-container)] flex items-center justify-center text-[24px] font-medium text-[var(--md-on-surface-variant)]">
                {profile.display_name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-[24px] font-medium text-[var(--md-on-surface)]">
                {profile.display_name || [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "—"}
              </h1>
              <StatusBadge status={profile.status} />
              {profile.phone_verified && (
                <span className="px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium bg-blue-100 text-blue-700">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">{profile.email}</p>
            {profile.phone && (
              <p className="text-[14px] text-[var(--md-on-surface-variant)]">{profile.phone}</p>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[12px] text-[var(--md-on-surface-variant)]">
              <span>Member since: {new Date(profile.created_at).toLocaleDateString()}</span>
              {profile.last_login_at && (
                <span>Last login: {new Date(profile.last_login_at).toLocaleString()}</span>
              )}
              {profile.province && <span>จังหวัด: {profile.province}</span>}
              {profile.occupation && <span>อาชีพ: {profile.occupation}</span>}
              {profile.gender && <span>เพศ: {genderLabels[profile.gender] || profile.gender}</span>}
              {profile.birth_date && <span>เกิด: {new Date(profile.birth_date).toLocaleDateString()}</span>}
            </div>
            {profile.customer_flag && profile.customer_flag !== "green" && (() => {
              const f = flagLabels[profile.customer_flag] || flagLabels.gray;
              return (
                <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-medium ${f.color} bg-gray-100 dark:bg-[var(--md-surface-container)]`}>
                  <span>{f.emoji}</span>
                  <span>Flag: {f.label}</span>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Point balance */}
      <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] border border-gray-200 dark:border-[var(--md-outline-variant)] p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-medium text-[var(--md-on-surface)]">Point Balance</h2>
            <p className="text-[36px] font-bold text-[var(--md-primary)] mt-1">{balance.toLocaleString()}</p>
            <div className="flex gap-4 mt-2 text-[13px] text-[var(--md-on-surface-variant)]">
              <span>Earned: {totalEarned.toLocaleString()}</span>
              <span>Spent: {totalSpent.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => setRefundModal(true)}
            className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all"
          >
            Refund Points
          </button>
        </div>
      </div>

      {/* Point Ledger */}
      <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] border border-gray-200 dark:border-[var(--md-outline-variant)] overflow-x-auto">
        <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] px-6 py-4 border-b border-[var(--md-outline-variant)]">
          Point Ledger
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--md-outline-variant)]">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Type</th>
                <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Amount</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Source</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Description</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {point_ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[var(--md-on-surface-variant)]">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                point_ledger.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)]">
                    <td className="px-5 py-3 text-[13px]">{l.type}</td>
                    <td className={`px-5 py-3 text-right font-medium ${l.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {l.amount >= 0 ? "+" : ""}{l.amount}
                    </td>
                    <td className="px-5 py-3 text-[13px]">{l.source}</td>
                    <td className="px-5 py-3 text-[13px] text-[var(--md-on-surface-variant)]">{l.description}</td>
                    <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scan History */}
      <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] border border-gray-200 dark:border-[var(--md-outline-variant)] overflow-x-auto">
        <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] px-6 py-4 border-b border-[var(--md-outline-variant)]">
          Scan History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--md-outline-variant)]">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Campaign</th>
                <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Points</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Date</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Location</th>
              </tr>
            </thead>
            <tbody>
              {scan_history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--md-on-surface-variant)]">
                    No scans yet
                  </td>
                </tr>
              ) : (
                scan_history.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)]">
                    <td className="px-5 py-3 font-mono text-[13px]">{s.campaign_id}</td>
                    <td className="px-5 py-3 text-right font-medium text-[var(--md-primary)]">+{s.points_earned}</td>
                    <td className="px-5 py-3 text-[13px]">{new Date(s.scanned_at).toLocaleString()}</td>
                    <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                      {s.latitude != null && s.longitude != null
                        ? `${s.latitude.toFixed(4)}, ${s.longitude.toFixed(4)}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Redemptions */}
      <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] border border-gray-200 dark:border-[var(--md-outline-variant)] overflow-x-auto">
        <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] px-6 py-4 border-b border-[var(--md-outline-variant)]">
          Redemptions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--md-outline-variant)]">
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Reward</th>
                <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Points</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Status</th>
                <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-[var(--md-on-surface-variant)]">
                    No redemptions yet
                  </td>
                </tr>
              ) : (
                redemptions.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)]">
                    <td className="px-5 py-3 text-[13px] font-medium">{r.reward_name}</td>
                    <td className="px-5 py-3 text-right text-[var(--md-primary)]">{r.point_cost}</td>
                    <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Addresses */}
      <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] border border-gray-200 dark:border-[var(--md-outline-variant)] p-6">
        <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-4">Addresses</h2>
        {addresses.length === 0 ? (
          <p className="text-[var(--md-on-surface-variant)]">No addresses</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`p-4 rounded-[var(--md-radius-md)] border ${
                  a.is_default
                    ? "border-[var(--md-primary)] bg-[var(--md-primary-light)]/20"
                    : "border-[var(--md-outline-variant)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium">{a.label}</span>
                  {a.is_default && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[var(--md-primary)] text-white">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-[13px] text-[var(--md-on-surface)] mt-1">{a.recipient_name}</p>
                <p className="text-[13px] text-[var(--md-on-surface-variant)]">{a.phone}</p>
                <p className="text-[13px] text-[var(--md-on-surface-variant)] mt-1">{a.address_line1}</p>
                {(a.province || a.postal_code) && (
                  <p className="text-[12px] text-[var(--md-on-surface-variant)]">
                    {[a.province, a.postal_code].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-4">Refund Points</h3>
            <form onSubmit={handleRefund} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">
                  Amount
                </label>
                <input
                  type="number"
                  min={1}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder="จำนวน points"
                  className="w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">
                  Reason
                </label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="เหตุผล (optional)"
                  rows={3}
                  className="w-full px-4 py-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] resize-none"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRefundModal(false);
                    setRefundAmount("");
                    setRefundReason("");
                  }}
                  className="h-[40px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-xl)] text-[14px] font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-dim)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={refundSubmitting}
                  className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] disabled:opacity-50"
                >
                  {refundSubmitting ? "Processing..." : "Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
