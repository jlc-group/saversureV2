"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DonationsHistoryRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/donations");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm animate-pulse">กำลังนำไปยังหน้าบริจาค...</p>
    </div>
  );
}
