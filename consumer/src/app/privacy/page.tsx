"use client";

import Link from "next/link";
import PageRenderer from "@/components/PageRenderer";

function PrivacyFallback() {
  return (
    <div className="min-h-screen bg-white px-5 py-12">
      <Link href="/register" className="inline-flex items-center gap-2 text-[var(--on-surface-variant)] text-[14px] mb-6">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
        กลับ
      </Link>
      <h1 className="text-[22px] font-semibold text-[var(--on-surface)]">นโยบายความเป็นส่วนตัว (PDPA)</h1>
      <div className="mt-6 text-[14px] text-[var(--on-surface-variant)] space-y-4">
        <p>
          บริษัทให้ความสำคัญกับการคุ้มครองข้อมูลส่วนบุคคลของคุณ เราจะเก็บรวบรวม ใช้ และเปิดเผยข้อมูลส่วนบุคคล
          ตามวัตถุประสงค์ที่แจ้งไว้เท่านั้น
        </p>
        <p>
          ข้อมูลที่เรารวบรวม ได้แก่ ชื่อ นามสกุล เบอร์โทรศัพท์ อีเมล วันที่เกิด และข้อมูลที่อยู่
          เพื่อใช้ในการให้บริการ ส่งรางวัล และปรับปรุงประสบการณ์การใช้งาน
        </p>
        <p>
          คุณมีสิทธิ์ในการเข้าถึง แก้ไข ลบ หรือถอนความยินยอมข้อมูลส่วนบุคคลของคุณได้ตลอดเวลา
          โดยติดต่อฝ่ายบริการลูกค้า
        </p>
        <p className="text-[12px] opacity-70">
          อัปเดตล่าสุด: มีนาคม 2025
        </p>
      </div>
    </div>
  );
}

export default function PrivacyPage() {
  return <PageRenderer pageSlug="privacy" fallback={<PrivacyFallback />} />;
}
