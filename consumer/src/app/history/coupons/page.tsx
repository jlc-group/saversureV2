"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import RedeemCard, { type RedeemEntry } from "@/components/RedeemCard";
import CouponSheet from "@/components/CouponSheet";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import HistoryTabs from "@/components/HistoryTabs";

const COUPON_TYPES = ["coupon", "digital", "ticket"];

export default function MyCouponsHistoryPage() {
  const [entries, setEntries] = useState<RedeemEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState<RedeemEntry | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    api.get<{ data: RedeemEntry[] }>("/api/v1/my/redeem-transactions")
      .then((d) => {
        const filtered = (d.data || []).filter((e) =>
          COUPON_TYPES.includes(e.delivery_type || "")
        );
        setEntries(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeEntries = entries.filter(
    (e) => e.status !== "used" && e.status !== "expired"
  );
  const usedEntries = entries.filter(
    (e) => e.status === "used" || e.status === "expired"
  );

  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-24">
        <PageHeader
          title="คูปองของฉัน"
          subtitle={entries.length > 0 ? `${activeEntries.length} ใช้ได้ · ${usedEntries.length} ใช้แล้ว` : undefined}
        />
        <HistoryTabs overlap />

        <div className="px-4 mt-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                    <div className="h-9 w-24 bg-muted rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <EmptyState
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-10 h-10">
                      <path d="M15 5.25h1.5a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-12a2.25 2.25 0 012.25-2.25H4.5" />
                      <path d="M9 3.75h6v3H9v-3z" />
                    </svg>
                  }
                  title="ยังไม่มีคูปองหรือสิทธิ์ดิจิทัล"
                  subtitle="แลกแต้มเพื่อรับคูปอง ตั๋ว หรือของรางวัลดิจิทัลที่หน้ารางวัล"
                  ctaLabel="ไปที่หน้ารางวัล"
                  ctaHref="/rewards"
                />
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Active coupons */}
              {activeEntries.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    ใช้ได้ · {activeEntries.length} รายการ
                  </p>
                  <div className="space-y-2 stagger-children">
                    {activeEntries.map((e) => (
                      <CouponCard
                        key={e.id}
                        entry={e}
                        onUse={() => setSelectedCoupon(e)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Used/Expired */}
              {usedEntries.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    ใช้แล้ว / หมดอายุ · {usedEntries.length} รายการ
                  </p>
                  <div className="space-y-2 opacity-60">
                    {usedEntries.map((e) => (
                      <RedeemCard key={e.id} entry={e} compact />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <BottomNav />

      {/* Coupon Bottom Sheet */}
      {selectedCoupon && (
        <CouponSheet
          couponCode={selectedCoupon.coupon_code || selectedCoupon.id}
          rewardName={selectedCoupon.reward_name || "คูปอง"}
          onClose={() => setSelectedCoupon(null)}
        />
      )}
    </div>
  );
}

/* ─── Coupon Card with "ใช้คูปอง" button ─── */
function CouponCard({ entry: e, onUse }: { entry: RedeemEntry; onUse: () => void }) {
  const deliveryIcons: Record<string, string> = {
    coupon: "🎫",
    digital: "📱",
    ticket: "🎟️",
  };
  const icon = deliveryIcons[e.delivery_type || ""] ?? "🎫";
  const imgSrc = e.reward_image_url
    ? e.reward_image_url.startsWith("http")
      ? e.reward_image_url
      : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400"}/media/${e.reward_image_url}`
    : null;

  const deliveryLabel: Record<string, string> = {
    coupon: "คูปอง",
    digital: "ดิจิทัล",
    ticket: "ตั๋ว",
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden card-green-border">
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        {/* Thumbnail */}
        <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-[var(--jh-green)]/5 ring-1 ring-gray-100 flex items-center justify-center">
          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgSrc} alt={e.reward_name || ""} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-900 truncate leading-tight">{e.reward_name || "คูปอง"}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-gray-400">
              {new Date(e.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
            </span>
            <span className="text-[10px] bg-[var(--jh-green)]/10 text-[var(--jh-green)] px-1.5 py-0.5 rounded font-bold">
              {deliveryLabel[e.delivery_type || ""] ?? e.delivery_type}
            </span>
          </div>
        </div>

        {/* Use button — always show */}
        <button
          onClick={onUse}
          className="shrink-0 flex items-center gap-1.5 bg-[var(--jh-green)] hover:bg-[var(--jh-green-dark)] active:scale-95 text-white text-[12px] font-bold px-3.5 py-2 rounded-xl transition-all shadow-sm shadow-green-200/50"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
            <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM16 16h4v4h-4z" strokeLinecap="round" />
          </svg>
          ใช้คูปอง
        </button>
      </div>

      {/* Coupon code preview strip */}
      {e.coupon_code && (
        <div className="mx-4 mb-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-dashed border-gray-200">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0 opacity-70">
            <path d="M15 5.25h1.5a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-12a2.25 2.25 0 012.25-2.25H4.5" />
          </svg>
          <p className="flex-1 font-mono text-[11px] font-bold text-gray-500 tracking-wider truncate">{e.coupon_code}</p>
          <span className="text-[10px] text-[var(--jh-green)] font-bold whitespace-nowrap">กดเพื่อใช้ →</span>
        </div>
      )}
    </div>
  );
}
