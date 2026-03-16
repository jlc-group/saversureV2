"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureItem {
  icon?: string;
  title: string;
  description?: string;
}

interface FeatureListProps {
  heading?: string;
  items?: FeatureItem[];
}

const defaultIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 12c0 4.97 3.022 9.078 7.262 10.672.396.149.833.149 1.229 0C16.978 21.078 21 16.97 21 12c0-1.065-.138-2.098-.382-3.016z" />
  </svg>
);

const featureIcons: Record<string, React.ReactElement> = {
  shield: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0 1 12 2.944a11.955 11.955 0 0 1-8.618 3.04A12.02 12.02 0 0 0 3 12c0 4.97 3.022 9.078 7.262 10.672.396.149.833.149 1.229 0C16.978 21.078 21 16.97 21 12c0-1.065-.138-2.098-.382-3.016z" />
    </svg>
  ),
  bolt: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
    </svg>
  ),
  sparkle: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09z" />
    </svg>
  ),
};

export default function FeatureList({
  heading,
  items = [],
}: FeatureListProps) {
  if (!items.length) return null;

  return (
    <div className="px-4 mt-4 space-y-2">
      {heading && (
        <p className="text-xs font-semibold text-muted-foreground px-1">
          {heading}
        </p>
      )}
      {items.map((f, idx) => (
        <Card key={idx} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-[var(--jh-green)]">
              {f.icon && featureIcons[f.icon] ? featureIcons[f.icon] : defaultIcon}
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-bold">{f.title}</p>
              {f.description && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {f.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
