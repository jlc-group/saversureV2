"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface CurrencyMaster {
  code: string;
  name: string;
  icon: string;
  active: boolean;
}

interface RewardsPageHeaderProps {
  title?: string;
  subtitle?: string;
  show_balance?: boolean;
}

const currencyFallback: Record<string, string> = {
  point: "🪙",
  diamond: "💎",
};

export default function RewardsPageHeader({
  title = "🎁 แลกรางวัล",
  subtitle = "แลกของรางวัลและสิทธิพิเศษ",
  show_balance = true,
}: RewardsPageHeaderProps) {
  const [userBalance, setUserBalance] = useState<Record<string, number>>({});
  const [currencyMap, setCurrencyMap] = useState<Record<string, CurrencyMaster>>({});

  useEffect(() => {
    api
      .get<{ data: CurrencyMaster[] }>("/api/v1/public/currencies")
      .then((d) => {
        const map: Record<string, CurrencyMaster> = {};
        (d.data || []).forEach((c) => (map[c.code.toLowerCase()] = c));
        setCurrencyMap(map);
      })
      .catch(() => {});

    if (show_balance && isLoggedIn()) {
      api
        .get<{ data: { currency: string; balance: number }[] }>("/api/v1/my/balances")
        .then((d) => {
          const map: Record<string, number> = {};
          (d.data || []).forEach((b) => (map[b.currency.toLowerCase()] = b.balance));
          setUserBalance(map);
        })
        .catch(() => {});
    }
  }, [show_balance]);

  const getIcon = (code: string) => {
    const c = currencyMap[code.toLowerCase()];
    return c?.icon || currencyFallback[code.toLowerCase()] || "⭐";
  };

  const getName = (code: string) => {
    const c = currencyMap[code.toLowerCase()];
    return c?.name || code;
  };

  return (
    <div className="bg-[linear-gradient(277.42deg,#3C9B4D_-13.4%,#7DBD48_80.19%)] px-5 pt-8 pb-10 text-white relative overflow-hidden">
      {/* Floating decorative shapes */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10 animate-float" />
      <div className="absolute right-16 top-12 h-8 w-8 rounded-full bg-white/10 animate-float-delay-1" />
      <div className="absolute left-8 -bottom-4 h-16 w-16 rounded-full bg-white/5 animate-float-delay-2" />

      <h1 className="text-3xl font-black tracking-tight leading-[1] mb-0 drop-shadow-md relative animate-slide-up">
        {title}
      </h1>
      {subtitle && (
        <p
          className="text-sm font-medium text-white/95 -mt-1.5 relative animate-slide-up"
          style={{ animationDelay: "60ms" }}
        >
          {subtitle}
        </p>
      )}

      {show_balance && isLoggedIn() && Object.keys(userBalance).length > 0 && (
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
