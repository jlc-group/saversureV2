"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, logout } from "@/lib/auth";
import { api } from "@/lib/api";
import {
  type MultiBalance,
  getCurrencyIcon,
  getPrimaryBalance,
  getSecondaryBalances,
} from "@/lib/currency";
import { useTenant } from "./TenantProvider";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  { label: "หน้าหลัก", href: "/", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" /></svg> },
  { label: "สแกนสะสมแต้ม", href: "/scan", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zm0 9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zm9.75-9.75c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" /></svg> },
  { label: "ประวัติสะสมแต้ม", href: "/history", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
  { label: "กระเป๋าเงิน", href: "/wallet", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 110-6h.75A2.25 2.25 0 0118 6v.75M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" /></svg> },
  { label: "แลกรางวัล", href: "/rewards", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" /></svg> },
  { label: "ข่าวสาร", href: "/news", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5"><path d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg> },
];

export default function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [balances, setBalances] = useState<MultiBalance[]>([]);
  const { brandName, branding } = useTenant();
  const primaryBalance = getPrimaryBalance(balances);
  const secondaryBalances = getSecondaryBalances(balances);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    if (open && loggedIn) {
      api.get<{ data: MultiBalance[] }>("/api/v1/my/balances")
        .then((d) => setBalances(d.data ?? []))
        .catch(() => {});
    }
  }, [open, loggedIn]);

  const navigate = (href: string) => {
    router.push(href);
    onClose();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
    onClose();
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm" onClick={onClose} />
      )}

      <div
        className="fixed top-0 h-full bg-white z-[9999] shadow-2xl transition-transform duration-300 ease-out"
        style={{
          width: "80%",
          maxWidth: "320px",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* Header */}
        <div className="bg-[linear-gradient(135deg,var(--jh-green)_0%,var(--jh-green-dark)_100%)] px-5 pb-5 pt-10 text-white relative overflow-hidden">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
          <div className="flex items-center gap-3 relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
              {branding?.logo_url ? (
                <img src={branding.logo_url} alt={brandName} className="h-7 w-7 object-contain" />
              ) : (
                <span className="text-base font-bold">{brandName.slice(0, 1)}</span>
              )}
            </div>
            <div>
              <p className="text-base font-bold">{brandName}</p>
              <p className="text-[11px] text-white/60">Consumer Portal</p>
            </div>
          </div>
        </div>

        {/* User card */}
        <div className="p-4">
          <div
            className="flex cursor-pointer items-center rounded-xl bg-secondary p-3.5"
            onClick={() => navigate("/profile")}
          >
            <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[var(--jh-green)]">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">
                {loggedIn ? "สมาชิก" : "ผู้เยี่ยมชม"}
              </p>
              {loggedIn ? (
                <>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-xl font-bold text-[var(--jh-green)]">
                      {(primaryBalance?.balance ?? 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {primaryBalance?.name || "แต้ม"}
                    </span>
                  </div>
                  {secondaryBalances.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {secondaryBalances.map((item) => (
                        <span
                          key={item.currency}
                          className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[var(--jh-green)]"
                        >
                          <span>{getCurrencyIcon(item.currency, item.icon)}</span>
                          <span>{item.balance.toLocaleString()}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl font-bold text-[var(--jh-green)]">0</span>
                  <span className="text-xs text-muted-foreground">แต้ม</span>
                </div>
              )}
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-muted-foreground">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </div>
        </div>

        <Separator />

        {/* Menu */}
        <div className="p-2">
          {menuItems.map((item) => (
            <button
              key={item.href}
              className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition hover:bg-secondary active:bg-secondary"
              onClick={() => navigate(item.href)}
            >
              <span className="text-[var(--jh-green)]">{item.icon}</span>
              <span className="text-sm font-medium text-foreground">{item.label}</span>
            </button>
          ))}
        </div>

        {loggedIn && (
          <>
            <Separator className="mx-4" />
            <div className="p-2">
              <button
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left text-destructive transition hover:bg-red-50"
                onClick={handleLogout}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                <span className="text-sm font-medium">ออกจากระบบ</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
