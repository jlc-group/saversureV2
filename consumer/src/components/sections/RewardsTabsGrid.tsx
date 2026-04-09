"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mediaUrl } from "@/lib/media";

interface RewardItem {
  id: string;
  name: string;
  description: string;
  type: string;
  point_cost: number;
  cost_currency: string;
  image_url?: string;
  delivery_type: string;
  available_qty: number;
  is_flash: boolean;
  flash_start?: string;
  flash_end?: string;
  tier_id?: string;
  tier_name?: string;
}

interface CurrencyMaster {
  code: string;
  name: string;
  icon: string;
  active: boolean;
}

type FilterType = "product" | "premium" | "lifestyle";

interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  filter_type: FilterType;
}

interface RewardsTabsGridProps {
  limit?: number;
  default_tab?: string;
  show_flash_badge?: boolean;
  show_stock_warning?: boolean;
  empty_message?: string;
  tabs?: TabConfig[];
}

const DEFAULT_TABS: TabConfig[] = [
  { id: "julaherb", label: "สินค้าจุฬาเฮิร์บ", icon: "🌱", filter_type: "product" },
  { id: "premium", label: "สินค้าพรีเมียม", icon: "💎", filter_type: "premium" },
  { id: "lifestyle", label: "ไลฟ์สไตล์", icon: "🎟️", filter_type: "lifestyle" },
];

const currencyFallback: Record<string, string> = {
  point: "🪙",
  diamond: "💎",
};

const deliveryLabel: Record<string, string> = {
  shipping: "จัดส่งถึงบ้าน",
  coupon: "คูปองออนไลน์",
  pickup: "รับหน้าร้าน",
  digital: "ดิจิทัล",
  ticket: "ตั๋ว/บัตรเข้างาน",
  none: "",
};

function filterByType(rewards: RewardItem[], filterType: FilterType): RewardItem[] {
  return rewards.filter((r) => {
    if (filterType === "product") return r.type === "product";
    if (filterType === "premium") return r.type === "premium";
    if (filterType === "lifestyle") {
      return (
        ["coupon", "digital", "ticket"].includes(r.delivery_type) ||
        ["coupon", "digital", "ticket"].includes(r.type)
      );
    }
    return true;
  });
}

export default function RewardsTabsGrid({
  limit = 50,
  default_tab,
  show_flash_badge = true,
  show_stock_warning = true,
  empty_message = "ยังไม่มีของรางวัลในหมวดนี้",
  tabs = DEFAULT_TABS,
}: RewardsTabsGridProps) {
  const effectiveTabs = tabs && tabs.length > 0 ? tabs : DEFAULT_TABS;
  const [activeTabId, setActiveTabId] = useState<string>(
    default_tab && effectiveTabs.find((t) => t.id === default_tab)
      ? default_tab
      : effectiveTabs[0].id,
  );

  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBalance, setUserBalance] = useState<Record<string, number>>({});
  const [currencyMap, setCurrencyMap] = useState<Record<string, CurrencyMaster>>({});

  useEffect(() => {
    api
      .get<{ data: RewardItem[]; total: number }>(
        `/api/v1/public/rewards?limit=${limit}`,
      )
      .then((d) => setRewards(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    api
      .get<{ data: CurrencyMaster[] }>("/api/v1/public/currencies")
      .then((d) => {
        const map: Record<string, CurrencyMaster> = {};
        (d.data || []).forEach((c) => (map[c.code.toLowerCase()] = c));
        setCurrencyMap(map);
      })
      .catch(() => {});

    if (isLoggedIn()) {
      api
        .get<{ data: { currency: string; balance: number }[] }>("/api/v1/my/balances")
        .then((d) => {
          const map: Record<string, number> = {};
          (d.data || []).forEach((b) => (map[b.currency.toLowerCase()] = b.balance));
          setUserBalance(map);
        })
        .catch(() => {});
    }
  }, [limit]);

  const getIcon = (code: string) => {
    const c = currencyMap[code.toLowerCase()];
    return c?.icon || currencyFallback[code.toLowerCase()] || "⭐";
  };

  const getName = (code: string) => {
    const c = currencyMap[code.toLowerCase()];
    return c?.name || code;
  };

  const canAfford = (cost: number, currency: string) =>
    (userBalance[currency.toLowerCase()] ?? 0) >= cost;

  const activeTab = effectiveTabs.find((t) => t.id === activeTabId) ?? effectiveTabs[0];
  const filteredRewards = useMemo(
    () => filterByType(rewards, activeTab.filter_type),
    [rewards, activeTab.filter_type],
  );

  return (
    <>
      {/* Tabs */}
      <div className="px-4 -mt-6 relative z-20">
        <div className="flex bg-white/60 backdrop-blur-md rounded-full p-1 shadow-sm overflow-x-auto hide-scrollbar border border-white justify-between">
          {effectiveTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex-1 min-w-max px-3 py-2 text-[12px] font-bold rounded-full transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${
                activeTabId === tab.id
                  ? "bg-[var(--jh-green)] text-white shadow-md shadow-green-500/20"
                  : "text-muted-foreground hover:bg-black/5"
              }`}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="px-4 mt-5 relative z-10">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <Card key={n} className="border-0 shadow-sm overflow-hidden">
                <div className="aspect-square bg-muted animate-pulse" />
                <CardContent className="p-3">
                  <div className="h-4 bg-muted rounded w-full mb-2 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredRewards.length === 0 ? (
          <Card className="border-0 shadow-md animate-slide-up">
            <CardContent className="flex flex-col items-center py-16 px-6">
              <div className="w-20 h-20 mb-4 rounded-full bg-secondary flex items-center justify-center animate-float">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--jh-green)"
                  strokeWidth="1.5"
                  className="w-10 h-10"
                >
                  <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-[var(--jh-green)]">{empty_message}</h3>
              <p className="text-sm text-muted-foreground mt-1 text-center">
                สะสมแต้มรอไว้ก่อนนะ เร็วๆ นี้จะมีของรางวัลมากมาย
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 gap-3 stagger-children">
            {filteredRewards.map((r) => {
              const imgSrc = mediaUrl(r.image_url);
              const affordable = isLoggedIn() && canAfford(r.point_cost, r.cost_currency);
              const icon = getIcon(r.cost_currency);
              const currName = getName(r.cost_currency);

              return (
                <Link key={r.id} href={`/rewards/${r.id}`}>
                  <Card className="border-0 shadow-sm overflow-hidden card-playful">
                    <div className="aspect-square bg-secondary relative overflow-hidden">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={r.name}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                          sizes="50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary to-[var(--jh-green-light)]/10">
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="w-12 h-12 text-muted-foreground/30"
                          >
                            <path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21" />
                          </svg>
                        </div>
                      )}

                      {show_flash_badge && r.is_flash && (
                        <Badge className="absolute top-2 left-2 bg-[var(--jh-pink)] text-white text-[10px] px-1.5 py-0 font-bold animate-pulse shadow-lg shadow-pink-500/30">
                          ⚡ FLASH
                        </Badge>
                      )}

                      {show_stock_warning && r.available_qty <= 10 && r.available_qty > 0 && (
                        <Badge className="absolute top-2 right-2 bg-[var(--jh-orange)] text-white text-[10px] px-1.5 py-0 shadow-md">
                          เหลือ {r.available_qty}
                        </Badge>
                      )}
                      {r.available_qty === 0 && (
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="text-white font-bold text-sm bg-black/30 rounded-full px-4 py-1">
                            หมดแล้ว
                          </span>
                        </div>
                      )}
                    </div>

                    <CardContent className="p-3">
                      <h3 className="text-[12px] font-semibold line-clamp-2 leading-tight min-h-[2.5em]">
                        {r.name}
                      </h3>

                      {deliveryLabel[r.delivery_type] && (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {r.delivery_type === "shipping"
                            ? "📦"
                            : r.delivery_type === "coupon"
                              ? "🎫"
                              : r.delivery_type === "ticket"
                                ? "🎟️"
                                : r.delivery_type === "digital"
                                  ? "📱"
                                  : "📍"}{" "}
                          {deliveryLabel[r.delivery_type]}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between">
                        <span
                          className={`text-[13px] font-bold relative group ${
                            affordable ? "text-[var(--jh-green)]" : "text-foreground"
                          }`}
                        >
                          <span className="cursor-default">{icon}</span>{" "}
                          {r.point_cost.toLocaleString()}
                          <span className="absolute -top-6 left-0 bg-black/80 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {currName}
                          </span>
                        </span>
                        {r.tier_name && (
                          <Badge
                            variant="outline"
                            className="text-[9px] px-1.5 py-0 border-[var(--jh-gold)] text-[var(--jh-gold)] bg-[var(--jh-gold-light)]"
                          >
                            👑 {r.tier_name}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
