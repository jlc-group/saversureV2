"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageRenderer from "@/components/PageRenderer";
import { isLoggedIn } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  type MultiBalance,
  getCurrencyIcon,
  getPrimaryBalance,
  getSecondaryBalances,
} from "@/lib/currency";
import { useTenant } from "@/components/TenantProvider";
import { Card, CardContent } from "@/components/ui/card";

interface ProfileData {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  profile_completed?: boolean;
}

function DefaultHomeContent() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [balances, setBalances] = useState<MultiBalance[]>([]);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { brandName } = useTenant();
  const primaryBalance = getPrimaryBalance(balances);
  const secondaryBalances = getSecondaryBalances(balances);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (li) {
      api.get<{ data: MultiBalance[] }>("/api/v1/my/balances")
        .then((d) => setBalances(d.data ?? []))
        .catch(() => {});
      api.get<ProfileData>("/api/v1/profile")
        .then((d) => setProfile(d))
        .catch(() => {});
    }
  }, []);

  const displayName = useMemo(() => {
    if (!profile) return "ผู้ใช้งาน";
    return (
      profile.display_name ||
      [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
      "ผู้ใช้งาน"
    );
  }, [profile]);

  const quickLinks = [
    { href: "/scan", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5z" /></svg>, bg: "bg-green-50 text-[var(--jh-green)]", title: "สะสมแต้ม" },
    { href: "/rewards", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3c-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2a3 3 0 0 0-3 3c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" /></svg>, bg: "bg-amber-50 text-amber-600", title: "แลกรางวัล" },
    { href: "/history", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M13 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm1 10h-5V7h2v4h3v2z" /></svg>, bg: "bg-blue-50 text-blue-600", title: "ประวัติ" },
    { href: "/news", icon: <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z" /></svg>, bg: "bg-purple-50 text-purple-600", title: "ข่าวสาร" },
  ];

  return (
    <>
      {/* Hero Card */}
      <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pt-8 pb-14 text-white relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
        <div className="relative">
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">{brandName}</p>
          <h1 className="text-xl font-bold mt-1">{loggedIn ? `สวัสดี ${displayName}` : "ยินดีต้อนรับ"}</h1>
          <p className="text-[13px] text-white/70 mt-0.5">{loggedIn ? "สะสมแต้มและแลกสิทธิพิเศษ" : "เข้าสู่ระบบเพื่อเริ่มสะสมแต้ม"}</p>
          <div className="mt-5 flex items-center justify-between rounded-xl bg-white/15 px-4 py-3 ring-1 ring-white/20">
            <div>
              <p className="text-[11px] text-white/60">{primaryBalance?.name || "แต้มคงเหลือ"}</p>
              <p className="text-3xl font-bold leading-tight">{(primaryBalance?.balance ?? 0).toLocaleString()}</p>
              {secondaryBalances.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {secondaryBalances.map((item) => (
                    <span
                      key={item.currency}
                      className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white"
                    >
                      <span>{getCurrencyIcon(item.currency, item.icon)}</span>
                      <span>{item.balance.toLocaleString()} {item.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
            {!loggedIn ? (
              <Link href="/login" className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[var(--jh-green-dark)]">เข้าสู่ระบบ</Link>
            ) : (
              <span className="text-3xl">{getCurrencyIcon(primaryBalance?.currency, primaryBalance?.icon)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 -mt-6 relative z-10">
        <Card className="border-0 shadow-md">
          <CardContent className="p-3">
            <div className="grid grid-cols-4 gap-1">
              {quickLinks.map((item) => (
                <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1.5 rounded-xl py-3 transition active:bg-muted">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${item.bg}`}>{item.icon}</div>
                  <span className="text-xs font-semibold text-foreground">{item.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Promotion Banner */}
      <div className="px-4 mt-4">
        <Card className="border-0 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 relative">
              <div className="absolute right-3 top-3 text-4xl opacity-30">🎉</div>
              <p className="text-xs font-semibold text-amber-700/60 uppercase tracking-wider">โปรโมชั่น</p>
              <h3 className="text-base font-bold text-amber-900 mt-1">แคมเปญใหม่ล่าสุด</h3>
              <p className="text-xs text-amber-800/70 mt-1">สะสมแต้มจากผลิตภัณฑ์เพื่อแลกของรางวัลสุดพิเศษ</p>
              <Link href="/rewards" className="mt-3 inline-block rounded-full bg-amber-600 px-4 py-1.5 text-xs font-bold text-white">ดูรายละเอียด</Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="px-4 mt-4 space-y-2">
        <p className="text-xs font-semibold text-muted-foreground px-1">ทำไมต้องใช้ {brandName}</p>
        {[
          { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 12c0 4.97 3.022 9.078 7.262 10.672.396.149.833.149 1.229 0C16.978 21.078 21 16.97 21 12c0-1.065-.138-2.098-.382-3.016z" /></svg>, title: "ปลอดภัย ไร้รอยต่อ", desc: "เชื่อมต่อผ่าน LINE ไม่ต้องจำรหัสผ่าน" },
          { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>, title: "สะสมแต้มง่าย", desc: "สแกน QR Code รับแต้มทันที" },
        ].map((f) => (
          <Card key={f.title} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-[var(--jh-green)]">{f.icon}</div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <Navbar />
      <div className="pt-16">
        <PageRenderer pageSlug="home" fallback={<DefaultHomeContent />} />
      </div>
      <BottomNav />
    </div>
  );
}
