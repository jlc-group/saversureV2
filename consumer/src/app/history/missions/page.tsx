"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import HistoryTabs from "@/components/HistoryTabs";
import { isLoggedIn } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default function MissionsHistoryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    // Simulated API call for missions history
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-24">
        <PageHeader
          title="ประวัติภารกิจ"
          subtitle="ภารกิจและกิจกรรมที่คุณเข้าร่วม"
        />

        <HistoryTabs />

        {/* Content */}
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
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-sm animate-slide-up">
              <CardContent className="p-0">
                <EmptyState
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-10 h-10">
                      <line x1="12" y1="20" x2="12" y2="10" />
                      <line x1="18" y1="20" x2="18" y2="4" />
                      <line x1="6" y1="20" x2="6" y2="16" />
                    </svg>
                  }
                  title="ยังไม่มีประวัติภารกิจ"
                  subtitle="เข้าร่วมและทำภารกิจให้สำเร็จเพื่อรับแต้มพิเศษ"
                  ctaLabel="ดูภารกิจทั้งหมด"
                  ctaHref="/missions"
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
