"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { getNavIcon } from "@/lib/nav-icons";

interface NavMenuItem {
  icon: string;
  label: string;
  link: string;
  visible?: boolean;
}

interface RawNavItem {
  icon: string;
  label: string;
  link?: string;
  path?: string;
  visible?: boolean;
  order?: number;
}

function normalizeNavItems(raw: RawNavItem[]): NavMenuItem[] {
  return raw
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((item) => ({
      icon: item.icon,
      label: item.label,
      link: item.link || item.path || "/",
      visible: item.visible !== false,
    }));
}

const FALLBACK_TABS: NavMenuItem[] = [
  { icon: "gift", label: "สิทธิพิเศษ", link: "/rewards", visible: true },
  { icon: "news", label: "กิจกรรม", link: "/news", visible: true },
  { icon: "scan", label: "สะสมแต้ม", link: "/scan", visible: true },
  { icon: "cart", label: "ช้อปออนไลน์", link: "/shop", visible: true },
  { icon: "info", label: "แจ้งปัญหา", link: "/support", visible: true },
];

const PRIMARY_LINKS = ["/scan"];

export default function BottomNav() {
  const pathname = usePathname();
  const [tabs, setTabs] = useState<NavMenuItem[]>(FALLBACK_TABS);

  useEffect(() => {
    api
      .get<{ items: RawNavItem[] }>("/api/v1/public/nav-menu/bottom_nav")
      .then((d) => {
        if (d.items && d.items.length > 0) {
          const normalized = normalizeNavItems(d.items);
          const visible = normalized.filter((i) => i.visible !== false);
          if (visible.length > 0) setTabs(visible);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="app-fixed-bar fixed bottom-0 z-50 bg-white/95 backdrop-blur-md shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex h-16 items-center justify-around px-2 relative">
        {tabs.map((tab) => {
          const isActive =
            tab.link === "/" ? pathname === "/" : pathname.startsWith(tab.link);
          const isPrimary = PRIMARY_LINKS.includes(tab.link);
          const renderIcon = getNavIcon(tab.icon);

          if (isPrimary) {
            return (
              <Link key={tab.link} href={tab.link} className="flex flex-col items-center -mt-5">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-full shadow-lg ring-4 ring-white transition-all duration-200 active:scale-90 ${
                    isActive
                      ? "bg-gradient-to-br from-[var(--jh-lime)] to-[var(--jh-green)] text-white animate-pulse-glow"
                      : "bg-gradient-to-br from-[var(--jh-green)] to-[var(--jh-green-dark)] text-white animate-pulse-glow"
                  }`}
                >
                  <span className="scale-110">{renderIcon(true)}</span>
                </div>
                <span
                  className={`text-[10px] font-bold mt-0.5 ${
                    isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link key={tab.link} href={tab.link} className="flex flex-col items-center gap-0.5 py-1.5 transition-all duration-200 active:scale-90">
              <span
                className={`transition-all duration-200 ${
                  isActive ? "text-[var(--jh-green)] scale-110" : "text-muted-foreground"
                }`}
              >
                {renderIcon(isActive)}
              </span>
              <span
                className={`text-[10px] font-semibold transition-colors ${
                  isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
              {/* Active dot indicator */}
              <span
                className={`h-1 w-1 rounded-full transition-all duration-300 ${
                  isActive ? "bg-[var(--jh-green)] scale-100" : "bg-transparent scale-0"
                }`}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
