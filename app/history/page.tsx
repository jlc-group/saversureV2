"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function HistoryDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL tab fallback checks
  const initialTab = searchParams.get('tab') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialTab);

  // Sync state if URL search param changes directly via Next.js Link
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeFilter) {
      setActiveFilter(tab);
    }
  }, [searchParams]);

  const handleFilterClick = (tabId: string) => {
    setActiveFilter(tabId);
    // Push smoothly without refreshing the page data
    router.replace(`/history?tab=${tabId}`, { scroll: false });
  };

  const filters = [
    { id: "all", label: "ทั้งหมด" },
    { id: "earn", label: "สะสมแต้ม" },
    { id: "redeem", label: "แลกแต้ม" },
    { id: "lucky", label: "ลุ้นโชค" },
  ];

  const mockData = [
    {
      id: 1,
      type: "earn",
      title: "ยาสีฟันเจเด้นท์ สูตรเสียวฟัน",
      refCode: "QR: 98765432",
      points: "+10 P",
      dateGroup: "วันนี้",
      dateStr: "14:30 น.",
      status: "success",
      icon: "🦷",
      bg: "#E8F5E9"
    },
    {
      id: 2,
      type: "redeem",
      title: "วอเตอร์เมลอน แอลอีดี คุชชั่น",
      refCode: "REF: JHH-8821",
      points: "-450 P",
      dateGroup: "เมื่อวาน",
      dateStr: "10:15 น.",
      status: "success",
      statusText: "สำเร็จแล้ว",
      icon: "🍉",
      bg: "#F9FBE7"
    },
    {
      id: 3,
      type: "lucky",
      title: "JDent Challenge โชคหล่นทับ",
      refCode: "รับ 3 สิทธิ์ลุ้นโชค",
      points: "-30 P",
      dateGroup: "เมื่อวาน",
      dateStr: "09:00 น.",
      status: "pending",
      statusText: "รอประกาศผล",
      icon: "🎲",
      bg: "#E3F2FD"
    },
    {
      id: 5,
      type: "earn",
      title: "สบู่แตงโม ล้างหน้าใส",
      refCode: "QR: 11223344",
      points: "+5 P",
      dateGroup: "สัปดาห์นี้",
      dateStr: "18 มี.ค. 69",
      status: "success",
      icon: "🧼",
      bg: "#E8F5E9"
    },
  ];

  const filteredData = activeFilter === "all" ? mockData : mockData.filter(d => d.type === activeFilter);

  // Group by DateGroup
  const groupedData = filteredData.reduce((acc, curr) => {
    if (!acc[curr.dateGroup]) acc[curr.dateGroup] = [];
    acc[curr.dateGroup].push(curr);
    return acc;
  }, {} as Record<string, typeof mockData>);

  return (
    <div className="w-full flex flex-col items-center pb-8">
      
      {/* Title Header */}
      <div className="px-5 mt-5 mb-4 text-center w-full max-w-[480px]">
          <h1 className="text-[22px] font-black text-gray-900">ประวัติกิจกรรมของคุณ</h1>
          <p className="text-gray-500 text-[11.5px] mt-1 font-medium max-w-[280px] mx-auto">รวมรายการสะสม แลกแต้ม และลุ้นรางวัลทั้งหมด</p>
      </div>

      {/* Advanced Inside Dashboard Card */}
      <div className="px-4 w-full max-w-[480px] mb-5">
        <div className="bg-gradient-to-br from-[#1b5e20] to-[#2E7D32] rounded-[20px] p-5 text-white shadow-[0_8px_20px_rgba(46,125,50,0.3)] relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 text-[80px] transform translate-x-4 -translate-y-4 pointer-events-none select-none">📊</div>
           <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                 <div className="text-[10px] text-green-200 font-bold tracking-wide uppercase mb-1">สรุปการสะสม เดือนนี้</div>
                 <div className="text-[26px] font-black leading-none tracking-tight">+240 <span className="text-[14px] text-green-100 font-bold ml-0.5">แต้ม</span></div>
                 <div className="text-[10px] text-green-100 mt-2 font-medium bg-white/10 inline-block px-2 py-0.5 rounded-full border border-white/20">จากการสแกน 12 ครั้ง 🔥</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-3 rounded-[14px] border border-white/20 text-center shadow-inner">
                 <div className="text-[10px] text-green-100 font-bold mb-1 tracking-widest uppercase">สถานะ</div>
                 <div className="text-[13px] font-black text-[#FFD700] drop-shadow-sm">Jula VIP</div>
              </div>
           </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 w-full max-w-[480px] sticky top-[56px] z-[40] bg-[#F5F7F6]/95 backdrop-blur-md py-3 border-b border-gray-200/50 shadow-sm mt-[-10px]">
         <div className="flex w-full gap-2 pb-1 justify-between">
            {filters.map(f => (
               <button 
                 key={f.id}
                 onClick={() => handleFilterClick(f.id)}
                 className={`flex-1 py-1.5 rounded-full text-[11.5px] font-bold transition-all shadow-sm border whitespace-nowrap px-1 ${
                   activeFilter === f.id 
                     ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-[0_4px_10px_rgba(76,175,80,0.3)] scale-105 z-10 relative' 
                     : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                 }`}
               >
                  {f.label}
               </button>
            ))}
         </div>
      </div>

      {/* History List */}
      <div className="px-4 w-full max-w-[480px] mt-4 space-y-6">
        {Object.keys(groupedData).length === 0 ? (
           <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mt-6">
              <div className="text-[55px] opacity-60 mb-3 drop-shadow-sm">📭</div>
              <div className="text-[16px] font-black text-gray-800 tracking-wide">ยังไม่มีข้อมูลกิจกรรมแบบนี้</div>
              <div className="text-[12px] text-gray-400 mt-1.5 font-medium">ทำกิจกรรมใหม่ๆเพื่อบันทึกประวัติของคุณเลย!</div>
           </div>
        ) : (
          Object.entries(groupedData).map(([group, items], groupIdx) => (
            <div key={group} className="animate-fade-in" style={{animationDelay: `${groupIdx * 50}ms`}}>
               <div className="text-[12px] font-black text-gray-400 mb-3 ml-2 tracking-wide uppercase">{group}</div>
               <div className="space-y-3.5">
                  {items.map((item) => (
                     <div key={item.id} onClick={() => { if(item.type === 'reward') router.push(`/history/tracking/${item.id}`); }} className="bg-white p-3.5 rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-3.5 hover:border-green-200 transition-colors active:scale-[0.98] cursor-pointer group">
                        
                        {/* Left Icon / Image */}
                        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] shrink-0 border border-gray-50 group-hover:scale-105 transition-transform" style={{backgroundColor: item.bg}}>
                           {item.icon}
                           {/* Small notification dot if won early */}
                           {item.type === 'reward' && <div className="absolute top-[2px] right-[2px] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
                        </div>
                        
                        {/* Middle Info */}
                        <div className="flex-1 overflow-hidden">
                           <div className="font-bold text-gray-800 text-[13.5px] truncate tracking-tight">{item.title}</div>
                           <div className="text-[10.5px] text-gray-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                              <span className="font-bold text-gray-500 bg-gray-100 px-1.5 py-[2px] rounded text-[9.5px] border border-gray-200/50">{item.refCode}</span>
                              <span>• {item.dateStr}</span>
                           </div>
                        </div>

                        {/* Right Value & Status */}
                        <div className="text-right shrink-0 flex flex-col items-end justify-center min-w-[65px]">
                           {/* Point variations */}
                           {item.type === 'earn' && <div className="text-[#4CAF50] font-black text-[16px] drop-shadow-sm tracking-tight">{item.points}</div>}
                           {item.type === 'redeem' && <div className="text-gray-600 font-black text-[15px] tracking-tight">{item.points}</div>}
                           {item.type === 'lucky' && <div className="text-gray-600 font-black text-[15px] tracking-tight">{item.points}</div>}
                           {item.type === 'donate' && <div className="text-gray-600 font-black text-[15px] tracking-tight">{item.points}</div>}
                           {item.type === 'reward' && (
                              <div className="text-yellow-700 font-black text-[11px] bg-yellow-100 px-2.5 py-0.5 rounded-md border border-yellow-200 shadow-sm">Free 🎉</div>
                           )}
                           
                           {/* Status Badges */}
                           {item.statusText && item.status === 'success' && (
                              <div className="text-[9.5px] font-bold text-green-600 mt-1">{item.statusText}</div>
                           )}
                           {item.statusText && item.status === 'pending' && (
                              <div className="text-[9.5px] font-bold text-orange-500 mt-1 flex items-center gap-1">
                                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 {item.statusText}
                              </div>
                           )}
                           {item.statusText && item.status === 'shipping' && (
                              <div className="text-[9.5px] font-bold text-blue-500 mt-1 flex items-center gap-1">
                                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                 {item.statusText}
                              </div>
                           )}
                        </div>
                        
                     </div>
                  ))}
               </div>
            </div>
          ))
        )}
      </div>
      
      {/* Bottom padding to prevent FAB overlay issues */}
      <div className="h-10"></div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
      `}} />
    </div>
  );
}

// Ensure the page respects Suspense to avoid de-opts with useSearchParams
export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-gray-400">กำลังโหลดข้อมูล...</div>}>
      <HistoryDashboard />
    </Suspense>
  );
}
