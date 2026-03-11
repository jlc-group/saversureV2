"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { isLoggedIn, logout } from "@/lib/auth";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

interface PointBalance {
  current: number;
  total_earned: number;
  total_spent: number;
}

interface ProfileData {
  display_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  profile_completed?: boolean;
  phone_verified?: boolean;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [points, setPoints] = useState<PointBalance>({ current: 0, total_earned: 0, total_spent: 0 });
  const [profile, setProfile] = useState<ProfileData | null>(null);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (li) {
      api.get<PointBalance>("/api/v1/points/balance")
        .then((d) => setPoints(d))
        .catch(() => {});
      api.get<ProfileData>("/api/v1/profile")
        .then((d) => setProfile(d))
        .catch(() => {});
    }
  }, []);

  const displayName =
    profile?.display_name ||
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    "สมาชิก";

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pt-8 pb-14 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative">
            <h1 className="text-xl font-bold">โปรไฟล์</h1>
            <p className="text-[13px] text-white/70 mt-0.5">จัดการข้อมูลสมาชิกของคุณ</p>
          </div>
        </div>

        {loggedIn ? (
          <>
            {/* Profile Card */}
            <div className="px-4 -mt-8 relative z-10">
              <Card className="border-0 shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-secondary">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[var(--jh-green)]">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-bold truncate">{displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {profile?.email || profile?.phone || ""}
                      </p>
                      <div className="mt-1 flex gap-1.5">
                        <Badge variant={profile?.profile_completed ? "default" : "secondary"} className={`text-[10px] px-2 py-0 ${profile?.profile_completed ? "bg-green-50 text-[var(--jh-green)]" : "bg-amber-50 text-amber-700"}`}>
                          {profile?.profile_completed ? "ข้อมูลครบถ้วน" : "รอยืนยัน"}
                        </Badge>
                        {profile?.phone_verified && (
                          <Badge variant="default" className="text-[10px] px-2 py-0 bg-blue-50 text-blue-700">
                            เบอร์ยืนยันแล้ว
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Points Stats */}
            <div className="px-4 mt-3">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 divide-x divide-border">
                    <div className="text-center px-2">
                      <p className="text-[11px] text-muted-foreground">คงเหลือ</p>
                      <p className="text-xl font-bold text-[var(--jh-green)] mt-0.5">{points.current.toLocaleString()}</p>
                    </div>
                    <div className="text-center px-2">
                      <p className="text-[11px] text-muted-foreground">สะสมทั้งหมด</p>
                      <p className="text-xl font-bold text-foreground mt-0.5">{points.total_earned.toLocaleString()}</p>
                    </div>
                    <div className="text-center px-2">
                      <p className="text-[11px] text-muted-foreground">ใช้ไปแล้ว</p>
                      <p className="text-xl font-bold text-foreground mt-0.5">{points.total_spent.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Incomplete profile warning */}
            {!profile?.profile_completed && (
              <div className="px-4 mt-3">
                <Card className="border-amber-200 bg-amber-50 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-600"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" /></svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-amber-900">กรอกข้อมูลให้ครบถ้วน</p>
                        <p className="text-xs text-amber-700/80 mt-0.5">ยืนยันเบอร์โทรเพื่อรับสิทธิประโยชน์เต็มรูปแบบ</p>
                      </div>
                      <Link href="/register/complete" className="rounded-full bg-amber-600 px-3 py-1 text-xs font-bold text-white">
                        ยืนยัน
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Quick links */}
            <div className="px-4 mt-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-0">
                  {[
                    { href: "/history", label: "ประวัติสะสมแต้ม", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                    { href: "/history/redeems", label: "ประวัติการแลกแต้ม", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12" /></svg> },
                    { href: "/scan", label: "สแกนสะสมแต้ม", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5z" /></svg> },
                  ].map((item, i) => (
                    <div key={item.href}>
                      <Link href={item.href} className="flex items-center gap-3.5 px-4 py-3.5 transition hover:bg-muted">
                        <span className="text-[var(--jh-green)]">{item.icon}</span>
                        <span className="flex-1 text-sm font-medium">{item.label}</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted-foreground"><path d="M9 18l6-6-6-6" /></svg>
                      </Link>
                      {i < 2 && <Separator />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Logout */}
            <div className="px-4 mt-6 mb-4">
              <button
                onClick={() => logout()}
                className="w-full rounded-xl border border-red-200 bg-white py-3 text-sm font-bold text-destructive transition hover:bg-red-50"
              >
                ออกจากระบบ
              </button>
            </div>
          </>
        ) : (
          <div className="px-4 -mt-8 relative z-10">
            <Card className="border-0 shadow-md">
              <CardContent className="flex flex-col items-center py-16 px-6">
                <div className="w-20 h-20 mb-4 rounded-full bg-secondary flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-[var(--jh-green)]">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold">กรุณาเข้าสู่ระบบ</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6 text-center">เข้าสู่ระบบเพื่อดูข้อมูลบัญชีและสิทธิพิเศษของคุณ</p>
                <Link href="/login" className="rounded-full bg-[var(--jh-green)] px-8 py-2.5 text-sm font-bold text-white">
                  เข้าสู่ระบบ
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
