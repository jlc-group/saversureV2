"use client";

import Link from "next/link";
import { useCurrencies } from "@/lib/currency-context";

interface WalletBalanceCardsProps {
  show_earned_spent?: boolean;
  show_secondary?: boolean;
  empty_state_text?: string;
  not_logged_in_title?: string;
  not_logged_in_text?: string;
  no_balance_title?: string;
  no_balance_text?: string;
  no_balance_cta_text?: string;
}

export default function WalletBalanceCards({
  show_earned_spent = true,
  show_secondary = true,
  empty_state_text = "เข้าสู่ระบบเพื่อดูกระเป๋าเงินของคุณ",
  not_logged_in_title = "กรุณาเข้าสู่ระบบ",
  not_logged_in_text,
  no_balance_title = "ยังไม่มียอดคงเหลือ",
  no_balance_text = "สแกนคิวอาร์โค้ดเพื่อเริ่มสะสมแต้ม",
  no_balance_cta_text = "สแกนสะสมแต้ม",
}: WalletBalanceCardsProps) {
  const { primary, secondaries, balances, loading, loggedIn } = useCurrencies();

  return (
    <div className="px-4 -mt-6 relative z-10 space-y-3">
      {/* Loading skeleton */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4 animate-pulse">
          <div className="h-10 bg-gray-100 rounded w-1/3" />
          <div className="h-6 bg-gray-100 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-100 rounded-full flex-1" />
            <div className="h-8 bg-gray-100 rounded-full flex-1" />
          </div>
        </div>
      )}

      {/* Not logged in */}
      {!loggedIn && !loading && (
        <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center">
          <div className="w-14 h-14 mb-4 rounded-full bg-gray-100 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h3 className="text-[15px] font-bold text-gray-800">{not_logged_in_title}</h3>
          <p className="text-[12px] text-gray-400 mt-1 mb-5 text-center">
            {not_logged_in_text || empty_state_text}
          </p>
          <Link
            href="/login"
            className="rounded-full bg-[var(--jh-green)] px-7 py-2 text-[13px] font-bold text-white"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      )}

      {loggedIn && !loading && (
        <>
          {/* Primary balance */}
          {primary && (
            <div className="bg-white rounded-2xl shadow-sm p-5 relative overflow-hidden">
              <div className="absolute -right-3 -top-3 text-[60px] opacity-[0.06] leading-none select-none">
                {primary.icon}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{primary.icon}</span>
                <span className="text-[13px] font-semibold text-gray-500">
                  {primary.name}
                </span>
              </div>
              <p className="text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight">
                {primary.balance.toLocaleString()}
              </p>
              {show_earned_spent && (
                <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      สะสมทั้งหมด
                    </p>
                    <p className="text-[14px] font-bold text-green-600">
                      +{primary.earned.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      ใช้ไป
                    </p>
                    <p className="text-[14px] font-bold text-gray-400">
                      -{primary.spent.toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Secondary currencies */}
          {show_secondary && secondaries.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {secondaries.map((item) => (
                <div
                  key={item.currency}
                  className="bg-white rounded-xl shadow-sm p-4 relative overflow-hidden"
                >
                  <div className="absolute -right-2 -top-2 text-[36px] opacity-[0.06] leading-none select-none">
                    {item.icon}
                  </div>
                  <span className="text-lg">{item.icon}</span>
                  <p className="text-[20px] font-extrabold text-gray-900 mt-1 leading-tight">
                    {item.balance.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.name}</p>
                  {show_earned_spent && (
                    <div className="flex gap-3 mt-2 pt-2 border-t border-gray-50 text-[10px]">
                      <span className="text-green-600 font-semibold">
                        +{item.earned.toLocaleString()}
                      </span>
                      <span className="text-gray-300">
                        -{item.spent.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* No balance state */}
          {balances.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-10 flex flex-col items-center">
              <div className="text-4xl mb-3">🪙</div>
              <h3 className="text-[15px] font-bold text-gray-800">{no_balance_title}</h3>
              <p className="text-[12px] text-gray-400 mt-1 mb-5 text-center">
                {no_balance_text}
              </p>
              <Link
                href="/scan"
                className="rounded-full bg-[var(--jh-green)] px-7 py-2 text-[13px] font-bold text-white"
              >
                {no_balance_cta_text}
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
