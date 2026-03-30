"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileEditPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Provide realistic empty form state
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push("/profile");
    }, 1000);
  };

  return (
    <div className="min-h-screen pb-24 bg-background">
      <Navbar />
      <div className="pt-24">
        <PageHeader title="ข้อมูลส่วนตัว" subtitle="แก้ไขข้อมูลส่วนตัวของคุณ" backHref="/profile" />

      <div className="px-4 mt-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-5">
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">ชื่อจริง</Label>
                <Input id="firstName" placeholder="ชื่อจริงของคุณ" className="bg-gray-50 focus-visible:ring-[var(--jh-green)]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">นามสกุล</Label>
                <Input id="lastName" placeholder="นามสกุลของคุณ" className="bg-gray-50 focus-visible:ring-[var(--jh-green)]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input id="email" type="email" placeholder="example@email.com" className="bg-gray-50 focus-visible:ring-[var(--jh-green)]" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">เบอร์โทรศัพท์ (ยืนยันแล้ว)</Label>
                <Input id="phone" value="08X-XXX-XXXX" disabled className="bg-gray-100 text-gray-500 font-mono" />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-6 bg-[var(--jh-green)] hover:bg-[var(--jh-green-dark)] rounded-xl py-6 text-md shadow-md"
              >
                {loading ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      </div>
      <BottomNav />
    </div>
  );
}
