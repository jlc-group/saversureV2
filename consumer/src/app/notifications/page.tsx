"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

interface Notification {
  id: string;
  type: "info" | "points" | "reward" | "support" | "campaign" | "system";
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

function timeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = Date.now();
  const diff = Math.floor((now - d.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString();
}

const TYPE_CONFIG: Record<
  Notification["type"],
  { icon: string; color: string; bgColor: string }
> = {
  info: {
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z",
    color: "var(--info)",
    bgColor: "var(--info-light)",
  },
  points: {
    icon: "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
    color: "var(--warning)",
    bgColor: "var(--warning-light)",
  },
  reward: {
    icon: "M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z",
    color: "var(--success)",
    bgColor: "var(--success-light)",
  },
  support: {
    icon: "M12 1c-4.97 0-9 4.03-9 9v7c0 1.1.9 2 2 2h4v-8H5v-1c0-3.87 3.13-7 7-7s7 3.13 7 7v1h-4v8h4c1.1 0 2-.9 2-2v-7c0-4.97-4.03-9-9-9z",
    color: "#7c4dff",
    bgColor: "#ede7f6",
  },
  campaign: {
    icon: "M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6 1-.75 2.25-1.69 3.2-2.4zM4 9.5v2h4v-2H4zm10 4.5v2h4v-2h-4zm-10 0v2h4v-2H4z",
    color: "var(--warning)",
    bgColor: "var(--warning-light)",
  },
  system: {
    icon: "M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
    color: "var(--on-surface-variant)",
    bgColor: "var(--outline-variant)",
  },
};

export default function NotificationsPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await api.get<{
        data: Notification[];
        total: number;
        unread: number;
      }>("/api/v1/notifications");
      setNotifications(res.data || []);
      setTotal(res.total || 0);
      setUnread(res.unread || 0);
    } catch {
      setNotifications([]);
      setTotal(0);
      setUnread(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  useEffect(() => {
    if (loggedIn) fetchNotifications();
    else setLoading(false);
  }, [loggedIn]);

  const handleMarkRead = async (n: Notification) => {
    if (n.read_at) return;
    try {
      await api.patch(`/api/v1/notifications/${n.id}/read`, {});
      setNotifications((prev) =>
        prev.map((x) =>
          x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
        )
      );
      setUnread((u) => Math.max(0, u - 1));
    } catch {
      /* ignore */
    }
  };

  const handleMarkAllRead = async () => {
    if (unread === 0) return;
    setMarkingAll(true);
    try {
      await api.post("/api/v1/notifications/read-all", {});
      setNotifications((prev) =>
        prev.map((x) => ({ ...x, read_at: x.read_at || new Date().toISOString() }))
      );
      setUnread(0);
    } catch {
      /* ignore */
    } finally {
      setMarkingAll(false);
    }
  };

  if (!loggedIn) {
    return (
      <div className="pb-20">
        <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
          <div className="max-w-[480px] mx-auto flex items-center h-14 px-4">
            <Link href="/" className="text-[var(--on-surface)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Link>
            <h1 className="text-[18px] font-semibold text-[var(--on-surface)] ml-3">Notifications</h1>
          </div>
        </div>
        <div className="max-w-[480px] mx-auto px-5 py-16 text-center">
          <p className="text-[14px] text-[var(--on-surface-variant)] mb-4">Please login to view notifications</p>
          <Link
            href="/login"
            className="inline-block h-[44px] px-8 leading-[44px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[14px] font-medium"
          >
            Login
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
        <div className="max-w-[480px] mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-[var(--on-surface)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </Link>
            <h1 className="text-[18px] font-semibold text-[var(--on-surface)]">Notifications</h1>
            {unread > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--primary)] text-white text-[11px] font-medium flex items-center justify-center">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </div>
          <button
            onClick={handleMarkAllRead}
            disabled={unread === 0 || markingAll}
            className="h-[36px] px-4 bg-[var(--primary)] text-white rounded-full text-[13px] font-medium disabled:opacity-50"
          >
            {markingAll ? "..." : "Mark all read"}
          </button>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-5 py-4">
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-6 h-6 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-[var(--on-surface-variant)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <p className="text-[14px]">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => {
              const cfg = TYPE_CONFIG[n.type];
              const isUnread = !n.read_at;
              return (
                <button
                  key={n.id}
                  onClick={() => handleMarkRead(n)}
                  className={`w-full text-left rounded-[var(--radius-lg)] elevation-1 p-4 flex gap-3 ${
                    isUnread ? "bg-[var(--info-light)]/30" : "bg-white"
                  }`}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.bgColor }}
                  >
                    <svg viewBox="0 0 24 24" fill={cfg.color} className="w-5 h-5">
                      <path d={cfg.icon} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="text-[14px] font-medium text-[var(--on-surface)] line-clamp-1 flex-1">
                        {n.title}
                      </h3>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-[var(--info)] flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    {n.body && (
                      <p className="text-[12px] text-[var(--on-surface-variant)] line-clamp-2 mt-0.5">
                        {n.body}
                      </p>
                    )}
                    <p className="text-[11px] text-[var(--on-surface-variant)] mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
