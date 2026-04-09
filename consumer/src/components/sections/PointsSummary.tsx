"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLoggedIn } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  type MultiBalance,
  getCurrencyIcon,
  getPrimaryBalance,
  getSecondaryBalances,
} from "@/lib/currency";
import { useTenant } from "@/components/TenantProvider";

interface ProfileData {
  display_name?: string;
  first_name?: string;
  last_name?: string;
}

interface PointsSummaryProps {
  show_greeting?: boolean;
}

export default function PointsSummary({
  show_greeting = true,
}: PointsSummaryProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [balances, setBalances] = useState<MultiBalance[]>([]);
  const [displayName, setDisplayName] = useState("ผู้ใช้งาน");
  const { brandName } = useTenant();
  const primaryBalance = getPrimaryBalance(balances);
  const secondaryBalances = getSecondaryBalances(balances);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (li) {
      api
        .get<{ data: MultiBalance[] }>("/api/v1/my/balances")
        .then((d) => setBalances(d.data ?? []))
        .catch(() => {});
      api
        .get<ProfileData>("/api/v1/profile")
        .then((d) => {
          const name =
            d.display_name ||
            [d.first_name, d.last_name].filter(Boolean).join(" ") ||
            "ผู้ใช้งาน";
          setDisplayName(name);
        })
        .catch(() => {});
    }
  }, []);

  return (
    <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-purple)_50%,var(--jh-pink)_100%)] animate-gradient px-5 pt-8 pb-14 text-white relative overflow-hidden">
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
      <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5 animate-float-delay-1" />
      <div className="absolute right-1/3 top-2 h-16 w-16 rounded-full bg-white/5 animate-float-delay-2" />

      <div className="relative">
        {show_greeting && (
          <>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">
              {brandName}
            </p>
            <h1 className="text-xl font-bold mt-1">
              {loggedIn ? `สวัสดี ${displayName}` : "ยินดีต้อนรับ"}
            </h1>
            <p className="text-[13px] text-white/70 mt-0.5">
              {loggedIn
                ? "สะสมแต้มและแลกสิทธิพิเศษ"
                : "เข้าสู่ระบบเพื่อเริ่มสะสมแต้ม"}
            </p>
          </>
        )}

        <div className="mt-5 flex items-center justify-between rounded-xl bg-white/15 px-4 py-3 ring-1 ring-white/20">
          <div>
            <p className="text-[11px] text-white/60">{primaryBalance?.name || "แต้มคงเหลือ"}</p>
            <p className="text-3xl font-bold leading-tight animate-shimmer">
              {(primaryBalance?.balance ?? 0).toLocaleString()}
            </p>
            {secondaryBalances.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {secondaryBalances.map((item) => (
                  <span
                    key={item.currency}
                    className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[11px] font-medium text-white"
                  >
                    <span>{getCurrencyIcon(item.currency, item.icon)}</span>
                    <span>{item.balance.toLocaleString()} {item.name}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
          {!loggedIn ? (
            <Link
              href="/login"
              className="rounded-full bg-white px-5 py-2 text-sm font-bold text-[var(--jh-green-dark)] animate-pulse-glow"
            >
              เข้าสู่ระบบ
            </Link>
          ) : (
            <span className="text-3xl">{getCurrencyIcon(primaryBalance?.currency, primaryBalance?.icon)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
