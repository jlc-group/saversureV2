"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Drawer from "./Drawer";
import { getUser, isLoggedIn } from "@/lib/auth";
import { useTenant } from "./TenantProvider";
import { api } from "@/lib/api";
import { getNavIcon } from "@/lib/nav-icons";

interface HeaderMenuItem {
  icon: string;
  label: string;
  link: string;
  visible: boolean;
}

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hasUser, setHasUser] = useState(false);
  const [headerItems, setHeaderItems] = useState<HeaderMenuItem[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { brandName, branding } = useTenant();

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setHasUser(!!getUser());

    api
      .get<{ items: HeaderMenuItem[] }>("/api/v1/public/nav-menu/header")
      .then((d) => {
        if (d.items && d.items.length > 0) {
          setHeaderItems(d.items.filter((i) => i.visible));
        }
      })
      .catch(() => {});
  }, []);

  // Track scroll position for dynamic shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`app-fixed-bar fixed top-0 z-[999] border-b border-border bg-white/95 backdrop-blur-md transition-shadow duration-300 ${
          scrolled ? "shadow-md" : "shadow-none"
        }`}
      >
        <div className="flex h-14 items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-all hover:bg-secondary hover:text-[var(--jh-green)] active:scale-90"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            className="flex min-w-0 cursor-pointer items-center gap-2 animate-bounce-in"
            onClick={() => router.push("/")}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
              {branding?.logo_url ? (
                <img src={branding.logo_url} alt={brandName} className="h-5 w-5 object-contain" />
              ) : (
                <span className="text-xs font-bold text-[var(--jh-green)]">{brandName.slice(0, 2)}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-foreground leading-tight">{brandName}</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {headerItems.map((item) => {
              const renderIcon = getNavIcon(item.icon);
              return (
                <button
                  key={item.link}
                  type="button"
                  onClick={() => router.push(item.link)}
                  title={item.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-[var(--jh-green)]"
                >
                  {renderIcon(false)}
                </button>
              );
            })}

            <div className="cursor-pointer" onClick={() => router.push(loggedIn ? "/profile" : "/login")}>
              {loggedIn && hasUser ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[var(--jh-green)]">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              ) : (
                <div className="rounded-full bg-[var(--jh-green)] px-3.5 py-1.5 text-xs font-semibold text-white">
                  Login
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Green accent strip at bottom */}
        <div className="h-[2px] bg-[linear-gradient(90deg,var(--jh-green)_0%,var(--jh-lime)_50%,var(--jh-teal)_100%)]" />
      </header>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
