"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { api } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";

interface SupportCase {
  id: string;
  subject: string;
  category: string;
  status: string;
  created_at: string;
  message_count: number;
}

interface Message {
  id: string;
  sender_role: string;
  message: string;
  created_at: string;
}

export default function SupportPage() {
  const [cases, setCases] = useState<SupportCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState<SupportCase | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ subject: "", category: "general", message: "" });
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
  }, []);

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: SupportCase[] }>("/api/v1/support/my-cases");
      setCases(res.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn) fetchCases();
    else setLoading(false);
  }, [loggedIn]);

  const loadCase = async (c: SupportCase) => {
    setSelected(c);
    try {
      const res = await api.get<{ case: SupportCase; messages: Message[] }>(`/api/v1/support/my-cases/${c.id}`);
      setMessages(res.messages || []);
    } catch {
      /* ignore */
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/api/v1/support/my-cases", form);
      setShowForm(false);
      setForm({ subject: "", category: "general", message: "" });
      fetchCases();
    } catch {
      alert("Failed to create case");
    } finally {
      setSending(false);
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      await api.post(`/api/v1/support/my-cases/${selected.id}/reply`, { message: reply });
      setReply("");
      loadCase(selected);
    } catch {
      alert("Failed to send");
    } finally {
      setSending(false);
    }
  };

  const statusColor: Record<string, string> = {
    open: "bg-[var(--info-light)] text-[var(--info)]",
    in_progress: "bg-[var(--warning-light)] text-[var(--warning)]",
    waiting_customer: "bg-[var(--warning-light)] text-[var(--warning)]",
    resolved: "bg-[var(--success-light)] text-[var(--success)]",
    closed: "bg-gray-100 text-gray-500",
  };

  if (!loggedIn) {
    return (
      <div className="pb-20">
        <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
          <div className="max-w-[480px] mx-auto flex items-center h-14 px-4">
            <h1 className="text-[18px] font-semibold text-[var(--on-surface)]">Support</h1>
          </div>
        </div>
        <div className="max-w-[480px] mx-auto px-5 py-16 text-center">
          <p className="text-[14px] text-[var(--on-surface-variant)] mb-4">Please login to contact support</p>
          <Link href="/login" className="inline-block h-[44px] px-8 leading-[44px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[14px] font-medium">
            Login
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="pb-20 flex flex-col min-h-screen">
        <div className="bg-white sticky top-0 z-10 border-b border-[var(--outline-variant)]">
          <div className="max-w-[480px] mx-auto flex items-center h-14 px-4 gap-3">
            <button onClick={() => setSelected(null)} className="text-[var(--on-surface)]">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
              </svg>
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-[14px] font-medium text-[var(--on-surface)] truncate">{selected.subject}</h1>
              <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium ${statusColor[selected.status] || ""}`}>
                {selected.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-[480px] mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.sender_role === "admin" ? "justify-start" : "justify-end"}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-[16px] ${
                m.sender_role === "admin"
                  ? "bg-gray-100 text-[var(--on-surface)] rounded-tl-[4px]"
                  : "bg-[var(--primary)] text-white rounded-tr-[4px]"
              }`}>
                <p className="text-[13px]">{m.message}</p>
                <p className={`text-[10px] mt-1 ${m.sender_role === "admin" ? "text-gray-400" : "text-white/70"}`}>
                  {m.sender_role === "admin" ? "Support" : "You"} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
        </div>

        {selected.status !== "closed" && (
          <div className="bg-white border-t border-[var(--outline-variant)] p-3 sticky bottom-16">
            <div className="max-w-[480px] mx-auto flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleReply()}
                className="flex-1 h-[44px] px-4 rounded-full border border-[var(--outline-variant)] text-[14px] outline-none focus:border-[var(--primary)]"
              />
              <button
                onClick={handleReply}
                disabled={!reply.trim() || sending}
                className="h-[44px] w-[44px] rounded-full bg-[var(--primary)] text-white flex items-center justify-center disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          </div>
        )}
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
            <h1 className="text-[18px] font-semibold text-[var(--on-surface)]">Support</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="h-[36px] px-4 bg-[var(--primary)] text-white rounded-full text-[13px] font-medium"
          >
            {showForm ? "Cancel" : "New Case"}
          </button>
        </div>
      </div>

      <div className="max-w-[480px] mx-auto px-5 py-4">
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-[var(--radius-lg)] elevation-1 p-4 mb-4 space-y-3">
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full h-[44px] px-4 border border-[var(--outline-variant)] rounded-[var(--radius-sm)] text-[14px] outline-none focus:border-[var(--primary)]"
              required
            />
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full h-[44px] px-4 border border-[var(--outline-variant)] rounded-[var(--radius-sm)] text-[14px] outline-none bg-white"
            >
              <option value="general">General</option>
              <option value="scan">Scan Issue</option>
              <option value="reward">Reward Issue</option>
              <option value="account">Account Issue</option>
              <option value="other">Other</option>
            </select>
            <textarea
              placeholder="Describe your issue..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full h-[100px] px-4 py-3 border border-[var(--outline-variant)] rounded-[var(--radius-sm)] text-[14px] outline-none resize-none focus:border-[var(--primary)]"
              required
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full h-[44px] bg-[var(--primary)] text-white rounded-[var(--radius-xl)] text-[14px] font-medium disabled:opacity-50"
            >
              {sending ? "Sending..." : "Submit"}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="animate-spin w-6 h-6 text-[var(--primary)]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : cases.length === 0 ? (
          <div className="text-center py-16 text-[var(--on-surface-variant)]">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
              <path d="M21 12.22C21 6.73 16.74 3 12 3c-4.69 0-9 3.65-9 9.28-.6.34-1 .98-1 1.72v2c0 1.1.9 2 2 2h1v-6.1c0-3.87 3.13-7 7-7s7 3.13 7 7V19h-8v2h8c1.1 0 2-.9 2-2v-1.22c.59-.31 1-.92 1-1.64v-2.3c0-.7-.41-1.31-1-1.62z" />
            </svg>
            <p className="text-[14px]">No support cases yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {cases.map((c) => (
              <button
                key={c.id}
                onClick={() => loadCase(c)}
                className="w-full bg-white rounded-[var(--radius-lg)] elevation-1 p-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[14px] font-medium text-[var(--on-surface)] line-clamp-1">{c.subject}</h3>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-medium ${statusColor[c.status] || ""}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-[var(--on-surface-variant)]">
                  <span className="capitalize">{c.category}</span>
                  <span>·</span>
                  <span>{c.message_count} messages</span>
                  <span>·</span>
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
