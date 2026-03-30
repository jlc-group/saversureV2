"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function MyCouponsPage() {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <Navbar />
      <div className="pt-24">
        <PageHeader title="คูปองของฉัน" subtitle="คูปองและของรางวัลส่วนตัว" backHref="/profile" />

      {/* Tab toggle mock */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <div className="flex-1 text-center py-2 bg-white rounded-md shadow-sm text-sm font-bold text-[var(--jh-green)]">คูปองที่ใช้ได้</div>
          <div className="flex-1 text-center py-2 text-sm font-medium text-gray-500">ใช้แล้ว/หมดอายุ</div>
        </div>
      </div>

      <div className="px-4 mt-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <EmptyState
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-10 h-10">
                  <path d="M15 5.25h1.5a2.25 2.25 0 012.25 2.25v12a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25v-12a2.25 2.25 0 012.25-2.25H4.5" />
                  <path d="M10.5 5.25c0-1.243.616-2.25 1.5-2.25s1.5 1.007 1.5 2.25M6.75 5.25v-1.5m6 0v1.5" />
                </svg>
              }
              title="ไม่มีคูปองที่ใช้ได้"
              subtitle="คุณยังไม่มีโค้ดส่วนลดหรือคูปองในขณะนี้ สามารถใช้แต้มแลกได้ที่หน้ารางวัล"
              ctaLabel="ไปที่หน้ารางวัล"
              ctaHref="/rewards"
            />
          </CardContent>
        </Card>
      </div>
      </div>
      <BottomNav />
    </div>
  );
}
