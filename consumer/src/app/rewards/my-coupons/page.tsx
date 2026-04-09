"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyCouponsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/history/coupons");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground text-sm animate-pulse">กำลังนำไปยังคูปองของฉัน...</p>
    </div>
  );
}
