"use client";

/**
 * Generic SectionHeader — replaces 13 per-page header sections
 * (rewards/missions/shop/wallet/news/notifications/support/settings/history/
 *  page_header_basic/badges/leaderboard/donations).
 *
 * Variants are controlled via props so admin can reuse one section type
 * across any page without losing existing designs.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface CurrencyMaster {
  code: string;
  name: string;
  icon: string;
  active: boolean;
}

interface ScansResponse {
  total?: number;
}

type Variant = "gradient" | "sticky" | "basic";
type Decoration = "circles" | "leaf" | "simple" | "none";
type TitleSize = "sm" | "md" | "lg";
type IconStyle = "none" | "emoji_inline" | "help_circle";

export interface SectionHeaderProps {
  /** Layout variant */
  variant?: Variant;
  /** Main title text */
  title?: string;
  /** Subtitle text (optional) */
  subtitle?: string;
  /** Back button href (gradient + sticky variants) */
  back_href?: string;
  /** Background decoration style */
  decoration?: Decoration;
  /** Title font size */
  title_size?: TitleSize;
  /** Icon style displayed alongside title */
  icon_style?: IconStyle;
  /** Emoji glyph used when icon_style = emoji_inline */
  icon_emoji?: string;
  /** Gradient start color (CSS color) */
  gradient_from?: string;
  /** Gradient end color (CSS color) */
  gradient_to?: string;
  /** Fetch + render user balance chips (login required) */
  show_balance?: boolean;
  /** Fetch + render user scan count subtitle (login required) */
  show_scan_count?: boolean;
}

const currencyFallback: Record<string, string> = {
  point: "🪙",
  diamond: "💎",
};

export default function SectionHeader({
  variant = "gradient",
  title = "",
  subtitle = "",
  back_href = "",
  decoration = "circles",
  title_size = "lg",
  icon_style = "none",
  icon_emoji = "",
  gradient_from = "#3C9B4D",
  gradient_to = "#7DBD48",
  show_balance = false,
  show_scan_count = false,
}: SectionHeaderProps) {
  // --- Optional data: user balance (rewards variant) ---
  const [userBalance, setUserBalance] = useState<Record<string, number>>({});
  const [currencyMap, setCurrencyMap] = useState<Record<string, CurrencyMaster>>({});

  // --- Optional data: scan count (history variant) ---
  const [scanTotal, setScanTotal] = useState<number>(0);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);

    if (show_balance) {
      api
        .get<{ data: CurrencyMaster[] }>("/api/v1/public/currencies")
        .then((d) => {
          const map: Record<string, CurrencyMaster> = {};
          (d.data || []).forEach((c) => (map[c.code.toLowerCase()] = c));
          setCurrencyMap(map);
        })
        .catch(() => {});

      if (li) {
        api
          .get<{ data: { currency: string; balance: number }[] }>("/api/v1/my/balances")
          .then((d) => {
            const map: Record<string, number> = {};
            (d.data || []).forEach((b) => (map[b.currency.toLowerCase()] = b.balance));
            setUserBalance(map);
          })
          .catch(() => {});
      }
    }

    if (show_scan_count && li) {
      api
        .get<ScansResponse>("/api/v1/my/scans?limit=1&offset=0")
        .then((d) => setScanTotal(d.total ?? 0))
        .catch(() => {});
    }
  }, [show_balance, show_scan_count]);

  const getIcon = (code: string) => {
    const c = currencyMap[code.toLowerCase()];
    return c?.icon || currencyFallback[code.toLowerCase()] || "⭐";
  };
  const getName = (code: string) => {
    const c = currencyMap[code.toLowerCase()];
    return c?.name || code;
  };

  // ---------- Variant: sticky (notifications) ----------
  if (variant === "sticky") {
    if (!title) return null;
    return (
      <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
        <div className="max-w-[480px] mx-auto flex items-center h-14 px-4">
          {back_href && (
            <Link href={back_href} className="text-[var(--on-surface)]" aria-label="back">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Link>
          )}
          <h1
            className={`text-[18px] font-semibold text-[var(--on-surface)] ${
              back_href ? "ml-3" : ""
            }`}
          >
            {title}
          </h1>
        </div>
      </div>
    );
  }

  // ---------- Variant: basic (PageHeader-like, no animations) ----------
  // Delegates to gradient variant with minimal decoration — same visuals
  // as the old PageHeaderBasic/SettingsPageHeader wrappers.
  if (variant === "basic") {
    if (!title) return null;
    return (
      <div
        className="bg-[length:200%_200%] animate-gradient px-5 pt-8 pb-10 text-white relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(277.42deg, ${gradient_from} -13.4%, ${gradient_to} 80.19%)`,
        }}
      >
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
        <div className="absolute left-12 bottom-2 h-16 w-16 rounded-full bg-white/5 animate-float-delay-1" />
        <div className="absolute right-20 bottom-6 h-8 w-8 rounded-full bg-white/8 animate-float-delay-2" />
        <div className="relative flex items-start gap-3">
          {back_href && (
            <Link
              href={back_href}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 mt-0.5"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="w-4 h-4"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-[40px] font-black tracking-tight leading-[1] mb-0 drop-shadow-md">
              {title}
            </h1>
            {subtitle && (
              <p className="text-[17px] font-medium text-white/95 -mt-1.5">{subtitle}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ---------- Variant: gradient (default — all other headers) ----------
  const titleClass =
    title_size === "sm"
      ? "text-xl font-bold"
      : title_size === "md"
        ? "text-3xl font-black tracking-tight leading-[1] mb-0 drop-shadow-md"
        : "text-[40px] font-black tracking-tight leading-[1] mb-0 drop-shadow-md";

  const subtitleClass =
    title_size === "sm"
      ? "text-[13px] text-white/70 mt-1"
      : title_size === "md"
        ? "text-sm font-medium text-white/95 -mt-1.5"
        : "text-[17px] font-medium text-white/95 -mt-1.5";

  const showLeaf = decoration === "leaf";
  const showSimple = decoration === "simple";
  const showCircles = decoration === "circles" || showLeaf;

  return (
    <div
      className="px-5 pt-8 pb-10 text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(277.42deg, ${gradient_from} -13.4%, ${gradient_to} 80.19%)`,
      }}
    >
      {/* Leaf SVG decoration (missions/shop) */}
      {showLeaf && (
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg
            viewBox="0 0 200 200"
            fill="none"
            className="absolute top-0 right-0 w-64 h-64 opacity-20"
          >
            <path
              d="M100 10 C 150 10, 190 50, 190 100 C 190 150, 100 190, 10 100 C 10 50, 50 10, 100 10 Z"
              fill="#ffffff"
            />
          </svg>
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
          <div className="absolute left-10 bottom-2 h-16 w-16 rounded-full bg-white/5 animate-float-delay-1" />
        </div>
      )}

      {/* Floating circles decoration (default) */}
      {showCircles && !showLeaf && (
        <>
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
          <div className="absolute right-16 top-12 h-8 w-8 rounded-full bg-white/10 animate-float-delay-1" />
          <div className="absolute left-8 -bottom-4 h-16 w-16 rounded-full bg-white/5 animate-float-delay-2" />
        </>
      )}

      {/* Simple 2-circle decoration (wallet) */}
      {showSimple && (
        <>
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/8" />
          <div className="absolute right-12 bottom-0 h-20 w-20 rounded-full bg-white/5" />
        </>
      )}

      <div className="relative z-10 flex items-center gap-3">
        {/* Back button (gradient style) */}
        {back_href && (
          <Link
            href={back_href}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-4 h-4"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        )}

        {/* Help-circle icon wrapper (support page) */}
        {icon_style === "help_circle" && (
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-5 h-5"
            >
              <path d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h1 className={`${titleClass} animate-slide-up`}>
            {icon_style === "emoji_inline" && icon_emoji && (
              <span className="inline-block mr-1.5 text-[22px] align-middle">
                {icon_emoji}
              </span>
            )}
            {title}
          </h1>
          {subtitle && (
            <p
              className={`${subtitleClass} relative animate-slide-up`}
              style={{ animationDelay: "60ms" }}
            >
              {subtitle}
            </p>
          )}
          {show_scan_count && loggedIn && scanTotal > 0 && (
            <p className="text-[17px] font-medium text-white/95 -mt-1.5 relative">
              สแกน {scanTotal} ครั้ง
            </p>
          )}
        </div>
      </div>

      {show_balance && loggedIn && Object.keys(userBalance).length > 0 && (
        <div className="flex items-center gap-3 mt-4 relative flex-wrap stagger-children">
          {Object.entries(userBalance).map(([currency, balance]) => (
            <div
              key={currency}
              className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-bold relative group cursor-default transition-all hover:bg-white/30 hover:scale-105"
            >
              <span>{getIcon(currency)}</span>{" "}
              {balance.toLocaleString()} {getName(currency)}
              <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                {getName(currency)} ({currency})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
