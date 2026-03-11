"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RewardsPage() {
  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-16">
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pt-8 pb-14 text-white relative overflow-hidden">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
          <h1 className="text-xl font-bold relative">แลกรางวัล</h1>
          <p className="text-[13px] text-white/70 mt-1 relative">แลกของรางวัลและสิทธิพิเศษ</p>
        </div>

        <div className="px-4 -mt-6 relative z-10">
          <Card className="border-0 shadow-md">
            <CardContent className="flex flex-col items-center py-16 px-6">
              <div className="relative w-20 h-20 mb-4 rounded-full bg-secondary flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-10 h-10">
                  <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
                <Badge className="absolute -top-1 -right-1 bg-amber-400 text-amber-900 text-[10px] px-1.5 py-0 font-bold">
                  SOON
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-[var(--jh-green)]">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center leading-relaxed">
                เรากำลังเตรียมของรางวัลและสิทธิพิเศษมากมาย<br />ให้คุณได้แลกแต้ม เร็วๆ นี้
              </p>
              <button className="mt-6 rounded-full border-2 border-[var(--jh-green)] px-6 py-2 text-sm font-bold text-[var(--jh-green)] transition active:scale-[0.98]">
                แจ้งเตือนเมื่อเปิดใช้งาน
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
