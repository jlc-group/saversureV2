"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import PageRenderer from "@/components/PageRenderer";
import { Card, CardContent } from "@/components/ui/card";

function TermsFallback() {
  return (
    <>
      <PageHeader title="ข้อกำหนดและนโยบาย" subtitle="นโยบายความเป็นส่วนตัวและเงื่อนไข" backHref="/profile" />

      <div className="px-4 mt-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 prose prose-sm prose-green max-w-none text-gray-600">
            <h3 className="text-[15px] font-bold text-gray-800 mb-4">นโยบายความเป็นส่วนตัว (Privacy Policy)</h3>
            <p className="text-[13px] leading-relaxed mb-4">
              บริษัทให้ความสำคัญอย่างยิ่งในการคุ้มครองข้อมูลส่วนบุคคลของท่าน นโยบายความเป็นส่วนตัวนี้อธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และปกป้องข้อมูลของท่านเมื่อท่านใช้แอปพลิเคชันของเรา
            </p>

            <h4 className="text-[13px] font-bold text-gray-700 mt-4 mb-2">1. ข้อมูลที่เราเก็บรวบรวม</h4>
            <ul className="text-[12px] list-disc pl-4 space-y-1 mb-4">
              <li>ข้อมูลที่ท่านให้ไว้โดยตรง เช่น ชื่อ นามสกุล อีเมล เบอร์โทรศัพท์</li>
              <li>ข้อมูลการใช้งานแอปพลิเคชันและการทำรายการต่างๆ</li>
              <li>ข้อมูลอุปกรณ์ที่ใช้เข้าถึงระบบ</li>
            </ul>

            <h4 className="text-[13px] font-bold text-gray-700 mt-4 mb-2">2. วัตถุประสงค์การใช้ข้อมูล</h4>
            <ul className="text-[12px] list-disc pl-4 space-y-1 mb-4">
              <li>เพื่อให้บริการ การสะสมแต้ม และแลกของรางวัล</li>
              <li>เพื่อปรับปรุงและพัฒนาแอปพลิเคชันให้ดียิ่งขึ้น</li>
              <li>เพื่อนำเสนอโปรโมชันที่ตรงใจท่าน</li>
            </ul>

            <h4 className="text-[13px] font-bold text-gray-700 mt-4 mb-2">3. สิทธิของเจ้าของข้อมูล (PDPA)</h4>
            <p className="text-[12px] leading-relaxed mb-4">
              ท่านมีสิทธิในการขอเข้าถึง ขอแก้ไข หรือขอลบข้อมูลส่วนบุคคลของท่าน รวมถึงสิทธิในการคัดค้านการประมวลผลข้อมูลตามที่กฎหมายกำหนด
            </p>

            <div className="mt-8 pt-4 border-t border-gray-100/80 text-[10px] text-gray-400 text-center">
              แก้ไขล่าสุด: 1 มกราคม 2567
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-screen pb-24 bg-background">
      <Navbar />
      <div className="pt-24">
        <PageRenderer pageSlug="terms" fallback={<TermsFallback />} />
      </div>
      <BottomNav />
    </div>
  );
}
