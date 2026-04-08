"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { useCurrencies } from "@/lib/currency-context";

interface LedgerEntry {
  id: string;
  entry_type: string;
  amount: number;
  balance_after: number;
  currency: string;
  reference_type?: string;
  description?: string;
  created_at: string;
}

interface WalletTransactionListProps {
  title?: string;
  page_size?: number;
  show_currency_filter?: boolean;
  empty_text?: string;
  filter_all_label?: string;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "2-digit",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getEntryIcon(entry: LedgerEntry) {
  const { entry_type, reference_type } = entry;
  if (reference_type === "refund") return "↩️";
  if (reference_type === "conversion") return "🔄";
  if (entry_type === "debit") return "📤";
  if (reference_type === "promo_bonus") return "🎁";
  return "📥";
}

function getEntryLabel(entry: LedgerEntry) {
  const { entry_type, reference_type } = entry;
  if (reference_type === "refund") return "คืนแต้ม";
  if (reference_type === "conversion")
    return entry_type === "credit" ? "แลกเปลี่ยน (รับ)" : "แลกเปลี่ยน (ใช้)";
  if (entry_type === "debit") return "ใช้แต้ม";
  if (reference_type === "promo_bonus") return "โบนัสโปรโมชั่น";
  if (reference_type === "scan") return "สแกนสะสม";
  return entry_type === "credit" ? "ได้รับแต้ม" : "ใช้แต้ม";
}

export default function WalletTransactionList({
  title = "ประวัติธุรกรรม",
  page_size = 30,
  show_currency_filter = true,
  empty_text = "ยังไม่มีธุรกรรม",
  filter_all_label = "ทั้งหมด",
}: WalletTransactionListProps) {
  const { balances } = useCurrencies();
  const [loggedIn, setLoggedIn] = useState(false);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [filterCurrency, setFilterCurrency] = useState<string | null>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (!li) {
      setLoading(false);
      return;
    }
    api
      .get<{ data: LedgerEntry[] }>(
        `/api/v1/points/history?limit=${page_size}&offset=0`,
      )
      .then((hist) => {
        const entries = hist.data ?? [];
        setLedger(entries);
        setOffset(page_size);
        setHasMore(entries.length >= page_size);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page_size]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const d = await api.get<{ data: LedgerEntry[] }>(
        `/api/v1/points/history?limit=${page_size}&offset=${offset}`,
      );
      const entries = d.data ?? [];
      setLedger((prev) => [...prev, ...entries]);
      setOffset((o) => o + page_size);
      setHasMore(entries.length >= page_size);
    } catch {
      /* ignore */
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, offset, page_size]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (!loggedIn || loading) return null;

  const filteredLedger = filterCurrency
    ? ledger.filter((e) => e.currency === filterCurrency)
    : ledger;

  const allCurrencies = Array.from(new Set(ledger.map((e) => e.currency)));

  return (
    <div className="px-4 relative z-10 space-y-3">
      {ledger.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center">
          <div className="text-3xl mb-2">📭</div>
          <p className="text-[13px] text-gray-400">{empty_text}</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-2 mt-2">
            <h2 className="text-[14px] font-bold text-gray-800">{title}</h2>
          </div>

          {/* Currency filter chips */}
          {show_currency_filter && allCurrencies.length > 1 && (
            <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 no-scrollbar">
              <button
                onClick={() => setFilterCurrency(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition ${
                  filterCurrency === null
                    ? "bg-[var(--jh-green)] text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200"
                }`}
              >
                {filter_all_label}
              </button>
              {allCurrencies.map((cur) => {
                const bal = balances.find((b) => b.currency === cur);
                return (
                  <button
                    key={cur}
                    onClick={() => setFilterCurrency(cur)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition inline-flex items-center gap-1 ${
                      filterCurrency === cur
                        ? "bg-[var(--jh-green)] text-white shadow-sm"
                        : "bg-white text-gray-500 border border-gray-200"
                    }`}
                  >
                    <span>{bal?.icon ?? "⭐"}</span>
                    <span>{bal?.name || cur}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Transaction list */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {filteredLedger.map((entry) => {
              const isCredit = entry.entry_type === "credit";
              const bal = balances.find((b) => b.currency === entry.currency);
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                >
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gray-50 flex items-center justify-center text-lg">
                    {getEntryIcon(entry)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-gray-900 leading-tight">
                      {getEntryLabel(entry)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-gray-400">
                        {formatDate(entry.created_at)}
                      </span>
                      <span className="text-[10px] text-gray-300">·</span>
                      <span className="text-[10px] text-gray-400">
                        {formatTime(entry.created_at)}
                      </span>
                      {entry.currency !== "point" && (
                        <>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">
                            {bal?.icon ?? "⭐"} {bal?.name || entry.currency}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-[14px] font-bold leading-none ${
                        isCredit ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isCredit ? "+" : "-"}
                      {entry.amount.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-gray-300 mt-0.5">
                      คงเหลือ {entry.balance_after.toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Infinite scroll trigger */}
          <div ref={loaderRef} className="py-4 text-center">
            {loadingMore ? (
              <div className="flex items-center justify-center gap-2 text-[12px] text-gray-400">
                <svg
                  className="animate-spin w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                กำลังโหลด...
              </div>
            ) : !hasMore ? (
              <p className="text-[10px] text-gray-300">· แสดงครบทุกรายการ ·</p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
