"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import HistoryTabs from "@/components/HistoryTabs";
import { api, ApiError } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

interface LuckyDrawTicket {
  id: string;
  campaign_id: string;
  campaign_title: string;
  ticket_number: string;
  created_at: string;
  status: string;
}

export default function LuckyDrawHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState<LuckyDrawTicket[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!isLoggedIn()) {
        setLoading(false);
        return;
      }
      
      try {
        console.log('Loading lucky draw tickets...');
        const res = await api.get<{ data: LuckyDrawTicket[] }>("/api/v1/my/lucky-draw/tickets");
        console.log('API Response:', res);
        const ticketData = res.data || [];
        console.log('Ticket Data:', ticketData);
        
        // Temporary mock data for testing
        const mockData = ticketData.length > 0 ? ticketData : [
          {
            id: "mock-1",
            campaign_id: "70000000-0000-0000-0000-000000000001",
            campaign_title: "จับสลากรับโชค ประจำเดือนมีนาคม",
            ticket_number: "T8999141424",
            created_at: "2026-04-02T09:14:36.904705+00:00",
            status: "active"
          },
          {
            id: "mock-2", 
            campaign_id: "70000000-0000-0000-0000-000000000001",
            campaign_title: "จับสลากรับโชค ประจำเดือนมีนาคม",
            ticket_number: "T9527179477",
            created_at: "2026-04-02T09:19:52.876112+00:00",
            status: "active"
          }
        ];
        
        setTickets(mockData);
        console.log('Final tickets set:', mockData.length);
        console.log('State updated to:', mockData.length);
      } catch (err: any) {
        console.error('API Error:', err);
        if (err?.status === 401) {
          // Token invalid or missing, redirect to login
          window.location.href = "/login";
          return;
        }
        setError(err?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="pb-24 min-h-screen bg-background">
      <Navbar />

      <div className="pt-24">
        <PageHeader
          title="ประวัติลุ้นโชค"
          subtitle="ประวัติการร่วมสนุกกิจกรรมต่างๆ"
        />

        <HistoryTabs overlap />

        {/* Content */}
        <div className="px-4 mt-2">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6 text-center">
                <p className="text-red-600 font-medium">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="text-sm text-gray-600 mb-2 px-4">
                พบ {tickets.length} สิทธิ์ลุ้นโชค
              </div>
              <div className="space-y-2 px-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden card-green-border">
                    <div className="flex items-center gap-3 px-4 pt-4 pb-3">
                      {/* Thumbnail */}
                      <div className="relative w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-(--jh-green)/5 ring-1 ring-gray-100 flex items-center justify-center">
                        <span className="text-2xl">🎟️</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-gray-900 truncate leading-tight">{ticket.campaign_title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-gray-400">
                            {new Date(ticket.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-[10px] bg-(--jh-green)/10 text-(--jh-green) px-1.5 py-0.5 rounded font-bold">
                            ตั๋ว
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ticket.status === "active" 
                            ? "bg-green-100 text-green-700" 
                            : ticket.status === "won" 
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>
                          {ticket.status === "active" ? "รอการจับรางวัล" : 
                           ticket.status === "won" ? "ได้รับรางวัล" : ticket.status}
                        </span>
                      </div>
                    </div>

                    {/* Ticket number preview strip */}
                    <div className="mx-4 mb-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-dashed border-gray-200">
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--jh-green)" strokeWidth="1.5" className="w-3.5 h-3.5 shrink-0 opacity-70">
                        <path d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.118l-12.75 1.062a2.126 2.126 0 01-2.298-2.118v-8.5c0-1.094.787-2.036 1.872-2.118l1.063-.088M17.153 10.42a2.126 2.126 0 01-2.118-2.3L15.92 5.25c.081-1.085 1.023-1.872 2.118-1.872h4.25c1.094 0 2.036.787 2.118 1.872L24.318 8.12a2.126 2.126 0 01-2.118 2.3h-5.047z" />
                      </svg>
                      <p className="flex-1 font-mono text-[11px] font-bold text-gray-500 tracking-wider truncate">{ticket.ticket_number}</p>
                      <span className="text-[10px] text-(--jh-green) font-bold whitespace-nowrap">หมายเลขตั๋ว</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
