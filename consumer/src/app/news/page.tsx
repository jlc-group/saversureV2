"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";

export default function NewsPage() {
  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pt-8 pb-14 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <h1 className="text-xl font-bold relative">ข่าวสาร</h1>
          <p className="text-[13px] text-white/70 mt-1 relative">โปรโมชั่นและข่าวสารล่าสุด</p>
        </div>

        <div className="px-4 -mt-6 relative z-10">
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center py-16 px-6">
              <div className="w-20 h-20 mb-4 rounded-full bg-secondary flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-10 h-10">
                  <path d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold">ยังไม่มีข่าวสารใหม่</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 text-center leading-relaxed">
                ติดตามโปรโมชั่น แคมเปญพิเศษ<br />และกิจกรรมดีๆ ได้ที่นี่ เร็วๆ นี้
              </p>
              <Link href="/" className="rounded-full bg-[var(--jh-green)] px-8 py-2.5 text-sm font-bold text-white">
                กลับหน้าหลัก
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
