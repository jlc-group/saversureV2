"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { isLoggedIn } from "@/lib/auth";

interface RewardsHistoryCtaProps {
  title?: string;
  subtitle?: string;
  link?: string;
  hide_if_guest?: boolean;
}

export default function RewardsHistoryCta({
  title = "ประวัติการแลกรางวัล",
  subtitle = "ดูสถานะการจัดส่งและคูปอง",
  link = "/history/redeems",
  hide_if_guest = true,
}: RewardsHistoryCtaProps) {
  if (hide_if_guest && !isLoggedIn()) return null;

  return (
    <div className="px-4 mt-6 animate-slide-up" style={{ animationDelay: "300ms" }}>
      <Link href={link} className="block">
        <Card className="border-0 shadow-sm card-playful">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--jh-purple-light)] flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--jh-purple)"
                  strokeWidth="2"
                  className="w-5 h-5"
                >
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{subtitle}</p>
              </div>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-5 h-5 text-muted-foreground"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
