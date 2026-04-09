"use client";

import Link from "next/link";
import { type ReactElement } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface MenuItem {
  icon?: string;
  label: string;
  link: string;
}

interface FeatureMenuProps {
  columns?: number;
  items?: MenuItem[];
}

const iconMap: Record<string, ReactElement> = {
  scan: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5z" />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20 6h-2.18c.11-.31.18-.65.18-1a3 3 0 0 0-3-3c-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2a3 3 0 0 0-3 3c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" />
    </svg>
  ),
  history: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M13 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm1 10h-5V7h2v4h3v2z" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  ),
  news: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h16v12zM6 10h2v2H6v-2zm0 4h8v2H6v-2zm10 0h2v2h-2v-2zm-6-4h8v2h-8v-2z" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  trophy: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
    </svg>
  ),
};

const colorClasses = [
  "bg-gradient-to-br from-green-100 to-teal-50 text-[var(--jh-green)]",
  "bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-600",
  "bg-gradient-to-br from-blue-100 to-indigo-50 text-blue-600",
  "bg-gradient-to-br from-purple-100 to-pink-50 text-purple-600",
  "bg-gradient-to-br from-rose-100 to-orange-50 text-rose-600",
  "bg-gradient-to-br from-teal-100 to-cyan-50 text-teal-600",
  "bg-gradient-to-br from-orange-100 to-amber-50 text-orange-600",
  "bg-gradient-to-br from-indigo-100 to-violet-50 text-indigo-600",
];

export default function FeatureMenu({
  columns = 4,
  items = [],
}: FeatureMenuProps) {
  if (!items.length) return null;

  return (
    <div className="px-4 -mt-6 relative z-10">
      <Card className="border-0 shadow-md">
        <CardContent className="p-3">
          <div
            className="grid gap-1 stagger-children"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {items.map((item, idx) => (
              <Link
                key={item.link + idx}
                href={item.link}
                className="card-playful flex flex-col items-center gap-1.5 rounded-xl py-3 transition hover:scale-105 active:bg-muted"
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${colorClasses[idx % colorClasses.length]}`}
                >
                  {item.icon && iconMap[item.icon]
                    ? iconMap[item.icon]
                    : iconMap["star"]}
                </div>
                <span className="text-xs font-semibold text-foreground text-center leading-tight">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
