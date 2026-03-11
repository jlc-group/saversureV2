"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const QRCodeSVG = dynamic(
  () => import("qrcode.react").then((m) => m.QRCodeSVG),
  { ssr: false }
);

interface RedeemEntry {
  id: string;
  reward_name: string | null;
  status: string;
  tracking: string | null;
  delivery_type: string | null;
  coupon_code: string | null;
  created_at: string;
}

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; cls?: string }> = {
  PENDING: { label: "รออนุมัติ", variant: "secondary", cls: "bg-amber-50 text-amber-700" },
  CONFIRMED: { label: "อนุมัติแล้ว", variant: "secondary", cls: "bg-blue-50 text-blue-700" },
  SHIPPING: { label: "กำลังจัดส่ง", variant: "secondary", cls: "bg-orange-50 text-orange-700" },
  SHIPPED: { label: "จัดส่งแล้ว", variant: "secondary", cls: "bg-green-50 text-green-700" },
  COMPLETED: { label: "เสร็จสิ้น", variant: "secondary", cls: "bg-green-50 text-[var(--jh-green)]" },
  EXPIRED: { label: "หมดอายุ", variant: "secondary", cls: "bg-muted text-muted-foreground" },
  CANCELLED: { label: "ยกเลิก", variant: "destructive" },
};

function CouponDisplay({ code }: { code: string }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 flex items-center justify-between">
        <span className="text-xs font-medium text-blue-700">Coupon Code</span>
        <span className="text-[11px] text-blue-500">{expanded ? "ซ่อน" : "แสดง QR"}</span>
      </button>
      {expanded && (
        <div className="flex justify-center pb-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <QRCodeSVG value={code} size={140} />
          </div>
        </div>
      )}
      <div className="px-3 pb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-bold font-mono text-blue-700 break-all">{code}</p>
        <button onClick={handleCopy} className="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white">
          {copied ? "✓ คัดลอก" : "คัดลอก"}
        </button>
      </div>
    </div>
  );
}

export default function RedeemHistoryPage() {
  const [entries, setEntries] = useState<RedeemEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    api.get<{ data: RedeemEntry[] }>("/api/v1/my/redeem-transactions")
      .then((d) => setEntries(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pt-8 pb-14 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <h1 className="text-xl font-bold relative">ประวัติการแลกแต้ม</h1>
          {entries.length > 0 && (
            <p className="text-[13px] text-white/70 mt-1 relative">{entries.length} รายการ</p>
          )}
        </div>

        {/* Tab links */}
        <div className="px-4 -mt-8 relative z-10">
          <Card className="border-0 shadow-md mb-3">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <Link href="/history" className="flex-1 rounded-full border border-border bg-white py-2 text-center text-sm font-semibold text-muted-foreground">
                  แต้มสะสม
                </Link>
                <Link href="/history/redeems" className="flex-1 rounded-full bg-[var(--jh-green)] py-2 text-center text-sm font-semibold text-white">
                  แลกรางวัล
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="px-4 mt-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((n) => (
                <Card key={n} className="border-0 shadow-sm">
                  <CardContent className="p-4 animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : entries.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center py-16 px-6">
                <div className="w-20 h-20 mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-10 h-10">
                    <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">ยังไม่มีประวัติการแลกรางวัล</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6 text-center">สะสมแต้มเพื่อนำมาแลกของรางวัลและสิทธิพิเศษ</p>
                <Link href="/rewards" className="rounded-full bg-[var(--jh-green)] px-8 py-2.5 text-sm font-bold text-white">
                  ดูของรางวัล
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {entries.map((e) => {
                const s = statusMap[e.status] || statusMap.PENDING;
                return (
                  <Card key={e.id} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[15px] font-bold truncate flex-1">{e.reward_name || "Reward"}</p>
                        <Badge variant={s.variant} className={`shrink-0 text-[10px] ${s.cls || ""}`}>
                          {s.label}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(e.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {e.tracking && (
                          <p className="text-xs text-muted-foreground">
                            Tracking: <span className="font-mono">{e.tracking}</span>
                          </p>
                        )}
                      </div>
                      {e.coupon_code && <CouponDisplay code={e.coupon_code} />}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
