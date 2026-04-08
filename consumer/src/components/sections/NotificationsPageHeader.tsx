"use client";

import Link from "next/link";

interface NotificationsPageHeaderProps {
  title?: string;
  back_href?: string;
}

export default function NotificationsPageHeader({
  title = "Notifications",
  back_href = "/",
}: NotificationsPageHeaderProps) {
  return (
    <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
      <div className="max-w-[480px] mx-auto flex items-center h-14 px-4">
        <Link href={back_href} className="text-[var(--on-surface)]" aria-label="back">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </Link>
        <h1 className="text-[18px] font-semibold text-[var(--on-surface)] ml-3">
          {title}
        </h1>
      </div>
    </div>
  );
}
