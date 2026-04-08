"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { mediaUrl } from "@/lib/media";

interface DonationEntry {
  id: string;
  donation_id: string;
  donation_title: string;
  donation_image_url?: string | null;
  points: number;
  created_at: string;
}

interface DonationsHistoryListProps {
  stat_count_label?: string;
  stat_points_label?: string;
  browse_title?: string;
  browse_subtitle?: string;
  browse_href?: string;
  login_title?: string;
  login_text?: string;
  login_label?: string;
  login_href?: string;
  empty_title?: string;
  empty_text?: string;
  empty_cta_label?: string;
  empty_cta_href?: string;
  today_label?: string;
  yesterday_label?: string;
  items_suffix?: string;
  points_suffix?: string;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getDateKey(dateStr: string) {
  return new Date(dateStr).toDateString();
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-50">
      <div className="w-12 h-12 rounded-xl bg-gray-100 animate-pulse shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
        <div className="h-2.5 bg-gray-100 rounded animate-pulse w-1/3" />
      </div>
      <div className="w-14 h-5 bg-gray-100 rounded-full animate-pulse" />
    </div>
  );
}

export default function DonationsHistoryList({
  stat_count_label = "ครั้งที่บริจาค",
  stat_points_label = "แต้มที่บริจาค",
  browse_title = "ดูโครงการบริจาคทั้งหมด",
  browse_subtitle = "หน้าแรก → แท็บบริจาค",
  browse_href = "/",
  login_title = "กรุณาเข้าสู่ระบบ",
  login_text = "เข้าสู่ระบบเพื่อดูประวัติการบริจาคของคุณ",
  login_label = "เข้าสู่ระบบ",
  login_href = "/login",
  empty_title = "ยังไม่มีประวัติการบริจาค",
  empty_text = "ร่วมบริจาคแต้มเพื่อสนับสนุนโครงการดีๆ",
  empty_cta_label = "ดูโครงการบริจาค",
  empty_cta_href = "/",
  today_label = "วันนี้",
  yesterday_label = "เมื่อวาน",
  items_suffix = "รายการ",
  points_suffix = "แต้ม",
}: DonationsHistoryListProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [entries, setEntries] = useState<DonationEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    setAuthChecked(true);
    if (!li) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    api
      .get<{ data: DonationEntry[] }>("/api/v1/my/donations")
      .then((d) => {
        if (cancelled) return;
        const list = d.data || [];
        setEntries(list);
        setTotalPoints(list.reduce((sum, e) => sum + e.points, 0));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function formatDateGroup(dateStr: string) {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return today_label;
    if (d.toDateString() === yesterday.toDateString()) return yesterday_label;
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Group by date
  const groups: { label: string; items: DonationEntry[] }[] = [];
  let lastKey = "";
  for (const e of entries) {
    const key = getDateKey(e.created_at);
    if (key !== lastKey) {
      groups.push({ label: formatDateGroup(e.created_at), items: [] });
      lastKey = key;
    }
    groups[groups.length - 1].items.push(e);
  }

  return (
    <>
      <div className="px-4 -mt-6 relative z-10 space-y-3">
        {/* Stat card */}
        {loggedIn && !loading && entries.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100/80 px-5 py-3 animate-slide-up">
            <div className="flex">
              <div className="flex-1 text-center animate-count-up">
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                  {stat_count_label}
                </p>
                <p className="text-[22px] font-bold text-[var(--jh-green)] leading-tight">
                  {entries.length.toLocaleString()}
                </p>
                <div className="mx-auto mt-1.5 h-[3px] w-10 rounded-full bg-[var(--jh-green)]" />
              </div>
              <div className="w-px bg-gray-100 my-1" />
              <div
                className="flex-1 text-center animate-count-up"
                style={{ animationDelay: "0.1s" }}
              >
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                  {stat_points_label}
                </p>
                <p className="text-[22px] font-bold text-amber-500 leading-tight">
                  {totalPoints.toLocaleString()}
                </p>
                <div className="mx-auto mt-1.5 h-[3px] w-10 rounded-full bg-amber-400" />
              </div>
            </div>
          </div>
        )}

        {/* Browse campaigns link */}
        <Link
          href={browse_href}
          className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100/80 px-4 py-3 animate-slide-up group"
        >
          <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--jh-green)"
              strokeWidth="2"
              className="w-5 h-5"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-bold text-gray-800">{browse_title}</p>
            <p className="text-[11px] text-gray-400">{browse_subtitle}</p>
          </div>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="w-4 h-4 text-gray-300"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* List */}
      <div className="mt-3 px-4">
        {/* Not logged in */}
        {!loggedIn && authChecked && (
          <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center animate-slide-up">
            <div className="w-14 h-14 mb-4 rounded-full bg-gray-100 flex items-center justify-center animate-float">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--jh-green)"
                strokeWidth="1.5"
                className="w-7 h-7"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h3 className="text-[15px] font-bold text-gray-800">{login_title}</h3>
            <p className="text-[12px] text-gray-400 mt-1 mb-5 text-center">
              {login_text}
            </p>
            <Link
              href={login_href}
              className="rounded-full bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] px-7 py-2 text-[13px] font-bold text-white shadow-md shadow-green-200/50"
            >
              {login_label}
            </Link>
          </div>
        )}

        {/* Loading */}
        {loggedIn && loading && (
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {[1, 2, 3, 4].map((n) => (
              <SkeletonRow key={n} />
            ))}
          </div>
        )}

        {/* Empty */}
        {loggedIn && !loading && entries.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center animate-slide-up">
            <div className="w-14 h-14 mb-4 rounded-full bg-gray-100 flex items-center justify-center animate-float">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--jh-green)"
                strokeWidth="1.5"
                className="w-7 h-7"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <h3 className="text-[15px] font-bold text-gray-800">{empty_title}</h3>
            <p className="text-[12px] text-gray-400 mt-1 mb-5 text-center">
              {empty_text}
            </p>
            <Link
              href={empty_cta_href}
              className="rounded-full bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-teal)_100%)] px-7 py-2 text-[13px] font-bold text-white shadow-md shadow-green-200/50"
            >
              {empty_cta_label}
            </Link>
          </div>
        )}

        {/* Grouped list */}
        {loggedIn && !loading && groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((group, gi) => (
              <div
                key={gi}
                className="bg-white rounded-2xl overflow-hidden shadow-sm animate-slide-up stagger-children"
                style={{ animationDelay: `${gi * 0.05}s` }}
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50/80 border-b border-gray-100">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-3.5 h-3.5 text-[var(--jh-green)] shrink-0"
                  >
                    <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <p className="text-[11px] font-bold text-gray-500 tracking-wide">
                    {group.label}
                  </p>
                  <span className="text-[10px] text-gray-300 ml-auto bg-gray-100 px-2 py-0.5 rounded-full">
                    {group.items.length} {items_suffix}
                  </span>
                </div>

                {group.items.map((entry) => {
                  const imgSrc = mediaUrl(entry.donation_image_url);
                  return (
                    <div
                      key={entry.id}
                      className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-green-50 ring-1 ring-gray-100">
                        {imgSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imgSrc}
                            alt={entry.donation_title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="var(--jh-green)"
                              strokeWidth="1.5"
                              className="w-6 h-6 opacity-50"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                          {entry.donation_title}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {formatTime(entry.created_at)}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-0.5 px-2 py-1 rounded-lg bg-green-50 text-[var(--jh-green)] text-[12px] font-bold leading-none shrink-0">
                        -{entry.points.toLocaleString()} {points_suffix}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
