"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import HistoryTabs from "@/components/HistoryTabs";
import { isLoggedIn } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default function LuckyDrawHistoryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { setLoading(false); return; }
    // Simulated API call for lucky draw history
    setTimeout(() => setLoading(false), 800);
  }, []);

  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-24">
        <PageHeader
          title="ประวัติลุ้นโชค"
          subtitle="ประวัติการร่วมสนุกกิจกรรมต่างๆ"
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
                      <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.118l-12.75 1.062a2.126 2.126 0 01-2.298-2.118v-8.5c0-1.094.787-2.036 1.872-2.118l1.063-.088M17.153 10.42a2.126 2.126 0 01-2.118-2.3L15.92 5.25c.081-1.085 1.023-1.872 2.118-1.872h4.25c1.094 0 2.036.787 2.118 1.872L24.318 8.12a2.126 2.126 0 01-2.118 2.3h-5.047z" />
                    </svg>
                  }
                  title="ยังไม่มีประวัติลุ้นโชค"
                  subtitle="ใช้แต้มร่วมสนุกเพื่อลุ้นรับของรางวัลใหญ่"
                  ctaLabel="กลับไปหน้าหลัก"
                  ctaHref="/"
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
