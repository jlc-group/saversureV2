"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/",
    label: "หน้าหลัก",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/scan",
    label: "สแกน",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5z" fill={active ? "currentColor" : "none"} />
      </svg>
    ),
    primary: true,
  },
  {
    href: "/history",
    label: "ประวัติ",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "บัญชี",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-5 h-5">
        <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="app-fixed-bar fixed bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          if (tab.primary) {
            return (
              <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full ${isActive ? "bg-[var(--jh-green)] text-white" : "bg-secondary text-[var(--jh-green)]"} transition`}>
                  {tab.icon(isActive)}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 py-1.5">
              <span className={`${isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"} transition`}>
                {tab.icon(isActive)}
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
