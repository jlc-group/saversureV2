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
  visible: boolean;
}

const FALLBACK_TABS: NavMenuItem[] = [
  { icon: "home", label: "หน้าหลัก", link: "/", visible: true },
  { icon: "scan", label: "สแกน", link: "/scan", visible: true },
  { icon: "gift", label: "รางวัล", link: "/rewards", visible: true },
  { icon: "history", label: "ประวัติ", link: "/history", visible: true },
  { icon: "user", label: "บัญชี", link: "/profile", visible: true },
];

const PRIMARY_LINKS = ["/scan"];

export default function BottomNav() {
  const pathname = usePathname();
  const [tabs, setTabs] = useState<NavMenuItem[]>(FALLBACK_TABS);

  useEffect(() => {
    api
      .get<{ items: NavMenuItem[] }>("/api/v1/public/nav-menu/bottom_nav")
      .then((d) => {
        if (d.items && d.items.length > 0) {
          setTabs(d.items.filter((i) => i.visible));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="app-fixed-bar fixed bottom-0 z-50 border-t border-border bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive =
            tab.link === "/" ? pathname === "/" : pathname.startsWith(tab.link);
          const isPrimary = PRIMARY_LINKS.includes(tab.link);
          const renderIcon = getNavIcon(tab.icon);

          if (isPrimary) {
            return (
              <Link key={tab.link} href={tab.link} className="flex flex-col items-center gap-0.5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    isActive
                      ? "bg-[var(--jh-green)] text-white"
                      : "bg-secondary text-[var(--jh-green)]"
                  } transition`}
                >
                  {renderIcon(isActive)}
                </div>
                <span
                  className={`text-[10px] font-semibold ${
                    isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          }

          return (
            <Link key={tab.link} href={tab.link} className="flex flex-col items-center gap-1 py-1.5">
              <span
                className={`${
                  isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"
                } transition`}
              >
                {renderIcon(isActive)}
              </span>
              <span
                className={`text-[10px] font-semibold ${
                  isActive ? "text-[var(--jh-green)]" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
