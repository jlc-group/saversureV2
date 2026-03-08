"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/api";

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
  },
  {
    href: "/rolls",
    label: "ม้วนของฉัน",
    icon: "M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z",
  },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [factoryName, setFactoryName] = useState<string | null>(null);

  useEffect(() => {
    const user = getUser();
    if (!user || user.role !== "factory_user") {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("factory_token");
    localStorage.removeItem("factory_refresh_token");
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-[var(--md-surface-dim)]">
      {/* Sidebar */}
      <aside className="w-[240px] bg-[var(--md-surface)] flex flex-col md-elevation-1 relative z-10">
        {/* Brand */}
        <div className="px-6 py-5 border-b border-[var(--md-outline-variant)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[var(--md-radius-sm)] bg-[var(--md-primary)] flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[var(--md-on-surface)]">Factory Portal</p>
              <p className="text-[11px] text-[var(--md-on-surface-variant)]">Saversure</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-[var(--md-radius-md)] text-[14px] font-medium transition-all duration-150 ${
                  active
                    ? "bg-[var(--md-primary-light)] text-[var(--md-primary)]"
                    : "text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-dim)] hover:text-[var(--md-on-surface)]"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                  <path d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-[var(--md-outline-variant)]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-[var(--md-radius-md)] text-[14px] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-error-light)] hover:text-[var(--md-error)] transition-all"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-[1400px]">
          {children}
        </div>
      </main>
    </div>
  );
}
