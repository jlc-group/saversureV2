"use client";

import Link from "next/link";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function EmptyState({ icon, title, subtitle, ctaLabel, ctaHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-16 px-6 animate-slide-up">
      <div className="w-20 h-20 mb-4 rounded-full bg-secondary flex items-center justify-center animate-float">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-center">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 mb-6 text-center">{subtitle}</p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="rounded-full bg-[var(--jh-green)] px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-green-200/50"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  );
}
