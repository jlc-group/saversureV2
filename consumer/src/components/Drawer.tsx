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
import { getNavIcon } from "@/lib/nav-icons";

interface DrawerMenuItem {
  icon: string;
  label: string;
  link: string;
  visible: boolean;
}

const FALLBACK_ITEMS: DrawerMenuItem[] = [
  { icon: "home", label: "หน้าหลัก", link: "/", visible: true },
  { icon: "scan", label: "สแกน QR Code", link: "/scan", visible: true },
  { icon: "gift", label: "แลกของรางวัล", link: "/rewards", visible: true },
  { icon: "star", label: "กระเป๋าเงิน", link: "/wallet", visible: true },
  { icon: "history", label: "ประวัติสแกน", link: "/history", visible: true },
  { icon: "trophy", label: "ประวัติแลกรางวัล", link: "/history/redeems", visible: true },
  { icon: "news", label: "ข่าวสาร", link: "/news", visible: true },
  { icon: "user", label: "โปรไฟล์ของฉัน", link: "/profile", visible: true },
];

export default function Drawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);
  const [balances, setBalances] = useState<MultiBalance[]>([]);
  const [menuItems, setMenuItems] = useState<DrawerMenuItem[]>(FALLBACK_ITEMS);
  const { brandName, branding } = useTenant();
  const primaryBalance = getPrimaryBalance(balances);
  const secondaryBalances = getSecondaryBalances(balances);

  useEffect(() => {
    api
      .get<{ items: DrawerMenuItem[] }>("/api/v1/public/nav-menu/drawer")
      .then((d) => {
        if (d.items && d.items.length > 0) {
          setMenuItems(d.items.filter((i) => i.visible));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (open && li) {
      api.get<{ data: MultiBalance[] }>("/api/v1/my/balances")
        .then((d) => setBalances(d.data ?? []))
        .catch(() => {});
    }
  }, [open]);

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

        {/* Menu — dynamically fetched */}
        <div className="p-2">
          {menuItems.map((item) => {
            const renderIcon = getNavIcon(item.icon);
            return (
              <button
                key={item.link}
                className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-left transition hover:bg-secondary active:bg-secondary"
                onClick={() => navigate(item.link)}
              >
                <span className="text-[var(--jh-green)]">{renderIcon(false)}</span>
                <span className="text-sm font-medium text-foreground">{item.label}</span>
              </button>
            );
          })}
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
