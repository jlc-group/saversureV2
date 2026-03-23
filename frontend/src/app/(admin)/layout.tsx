"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { isAuthenticated } from "@/lib/auth";
import { TenantProvider } from "@/lib/tenant-context";
import Sidebar from "@/components/ui/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--md-surface-dim)]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--md-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <TenantProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontSize: "14px",
            borderRadius: "var(--md-radius-sm)",
          },
          success: {
            style: { background: "var(--md-surface)", color: "var(--md-success)" },
          },
          error: {
            style: { background: "var(--md-surface)", color: "var(--md-error)" },
          },
        }}
      />
      <div className="flex min-h-screen bg-[var(--md-surface-dim)]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="max-w-[1400px] mx-auto p-8">
            {children}
          </div>
        </main>
      </div>
    </TenantProvider>
  );
}
