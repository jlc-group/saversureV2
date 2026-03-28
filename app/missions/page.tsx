"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MissionHubPage() {
  const [activeTab, setActiveTab] = useState("active");
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();

  const filterCategories = [
    { id: "all", label: "อัปเดตใหม่" },
    { id: "earn", label: "แจกแต้ม" },
    { id: "lucky", label: "ลุ้นรางวัล" },
    { id: "reward", label: "แจกของรางวัล" },
  ];

  const allMissions = [
    {
      id: 1,
      resultType: "reward",
      title: "สแกนดีดีครีมครบ 6 ซอง",
      desc: "1 ซอง = 1 ดวง (สะสมได้เรื่อยๆ)",
      progress: 2, max: 6, timeLeft: "เหลืออีก 15 วัน",
      badgeText: "ลด 40.-", badgeSub: "ส่วนลด",
      badgeBg: "bg-[#ffebee]", badgeColor: "text-[#d32f2f]", badgeOutline: "border-[#f44336]", nodes: 6
    },
    {
      id: 2,
      resultType: "earn",
      title: "ซื้อสินค้าที่ 7-11 อัปใบเสร็จ",
      desc: "ส่งหลักฐานการซื้อผ่านเมนูรับแต้ม",
      progress: 0, max: 1, timeLeft: "เหลืออีก 5 วัน",
      badgeText: "รับ20แต้ม", badgeSub: "แต้มพิเศษ",
      badgeBg: "bg-[#e8f5e9]", badgeColor: "text-[#2e7d32]", badgeOutline: "border-[#4caf50]", nodes: 2
    },
    {
      id: 3,
      resultType: "lucky",
      title: "สแกนเสาร์-อาทิตย์ ครบ 5 ครั้ง",
      desc: "สะสมยอดแกนเฉพาะวันหยุด Weekend",
      progress: 3, max: 5, timeLeft: "เหลืออีก 2 วัน",
      badgeText: "1 ตั๋ว", badgeSub: "ลุ้นรางวัล",
      badgeBg: "bg-[#e3f2fd]", badgeColor: "text-[#1976d2]", badgeOutline: "border-[#1e88e5]", nodes: 5
    },
    {
      id: 4,
      resultType: "earn",
      title: "สแกนตามรูทีน 4 step ตัวไหนก็ได้",
      desc: "ล้าง > บำรุง > กันแดด > แต้มสิว",
      progress: 1, max: 4, timeLeft: "ตลอดปี",
      badgeText: "100แต้ม", badgeSub: "Bonus",
      badgeBg: "bg-[#fce4ec]", badgeColor: "text-[#c2185b]", badgeOutline: "border-[#ec407a]", nodes: 4
    },
    {
      id: 5,
      resultType: "earn",
      title: "สแกนครบ set แตงโม ตัวไหนก็ได้",
      desc: "เจลแต้มสิว, ดีดีครีม, โลชั่น, สบู่",
      progress: 4, max: 4, timeLeft: "เหลืออีก 30 วัน",
      badgeText: "+50แต้ม", badgeSub: "Watermelon",
      badgeBg: "bg-[#fff8e1]", badgeColor: "text-[#f57c00]", badgeOutline: "border-[#ff9800]", nodes: 4
    },
    {
      id: 7,
      resultType: "reward",
      title: "ภารกิจพิเศษ (ฉลองความสำเร็จ)",
      desc: "แจกคูปองส่วนลดแบบ VIP",
      progress: 5, max: 5, timeLeft: "เหลืออีก 3 วัน",
      badgeText: "ลด 100.-", badgeSub: "คูปอง VIP",
      badgeBg: "bg-[#fff8e1]", badgeColor: "text-[#f57c00]", badgeOutline: "border-[#ff9800]", nodes: 5
    }
  ];

  const filteredTabMissions = allMissions.filter(m => 
    activeTab === 'active' ? m.progress < m.max : m.progress >= m.max
  );

  const displayMissions = activeFilter === 'all' 
    ? filteredTabMissions 
    : filteredTabMissions.filter(m => m.resultType === activeFilter);

  return (
    <div className="w-full flex flex-col bg-[#F5F7F6] min-h-screen relative font-sans pb-[100px]">
      
      {/* 1. Header (Logo styled header) */}
      <div className="bg-white w-full max-w-[480px] z-40 sticky top-0 border-b border-gray-100 flex items-center justify-center py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
         <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center text-gray-500 active:bg-gray-50 rounded-full transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
         </div>
         {/* Title mimicking "ALL member ภารกิจพิชิตรางวัล" */}
         <div className="flex items-center gap-1.5 h-8">
            <div className="bg-gradient-to-r from-[#8ac43f] to-[#4CAF50] text-white italic font-black text-[13px] px-2.5 py-1 rounded-[6px] rounded-tl-[12px] rounded-br-[12px] tracking-tight shadow-sm">Jula's Herb</div>
            <span className="text-[17px] font-black tracking-tight text-gray-800">ภารกิจพิชิตรางวัล</span>
            <div className="text-[14px] ml-1">🚩</div>
         </div>
         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
         </div>
      </div>

      {/* 2. Top Segmented Tabs Wrapper */}
      <div className="bg-white px-4 pt-3 pb-2 w-full max-w-[480px]">
         <div className="flex rounded-[10px] p-[3px] bg-[#F5F7F6] border border-gray-200/60 shadow-inner">
            <button 
              onClick={() => setActiveTab('active')}
              className={`flex-1 py-1.5 text-[13.5px] font-bold rounded-[8px] transition-all duration-200 ${
                activeTab === 'active' 
                ? 'bg-[#4CAF50] text-white shadow-sm' 
                : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
               กำลังทำภารกิจ
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              className={`flex-1 py-1.5 text-[13.5px] font-bold rounded-[8px] transition-all duration-200 ${
                activeTab === 'completed' 
                ? 'bg-[#4CAF50] text-white shadow-sm' 
                : 'bg-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
               ภารกิจที่จบแล้ว
            </button>
         </div>
      </div>

      {/* 3. Horizontal Multi-Filters (Dynamic Categories) */}
      <div className="bg-white px-4 pb-3 shadow-[0_4px_12px_rgba(0,0,0,0.02)] border-b border-gray-100 w-full max-w-[480px] sticky top-[56px] z-[39]">
         <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1 pt-0.5">
            {filterCategories.map((cat) => (
               <button 
                 key={cat.id}
                 onClick={() => setActiveFilter(cat.id)}
                 className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold transition-all border ${
                   activeFilter === cat.id 
                   ? 'bg-green-50/80 text-[#4CAF50] border-green-200 shadow-sm scale-105' 
                   : 'bg-white text-gray-500 border-gray-200 active:bg-gray-50 hover:bg-gray-50'
                 }`}
               >
                  {cat.label}
               </button>
            ))}
         </div>
      </div>

      {/* 4. Missions List */}
      <div className="px-3.5 py-4 w-full flex flex-col gap-3 max-w-[480px]">
         
         {displayMissions.length > 0 ? (
           displayMissions.map((item) => {
             const percent = Math.min((item.progress / item.max) * 100, 100);
             const nodesArr = Array.from({ length: item.nodes });
             const isCompleted = item.progress >= item.max;

             return (
               <div 
                 key={item.id} 
                 onClick={() => router.push(`/missions/${item.id}`)}
                 className={`bg-white rounded-[16px] p-4 flex items-center justify-between border shadow-[0_4px_20px_rgba(0,0,0,0.03)] active:scale-[0.98] transition-all cursor-pointer group hover:border-[#4CAF50]/30 ${isCompleted ? 'border-[#A5D6A7] bg-[#F1F8E9]' : 'border-gray-100'}`}
               >
                  
                  {/* Left Side (Labels & Progress) */}
                  <div className="flex-1 flex flex-col pt-1 pr-3">
                     <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="font-bold text-[14.5px] text-gray-800 tracking-tight leading-snug">{item.title}</h3>
                        {isCompleted && <span className="text-[10px] font-black bg-[#4CAF50] text-white px-1.5 py-0.5 rounded-sm">สำเร็จ</span>}
                     </div>
                     <p className="text-[10px] text-gray-500 font-medium">{item.desc}</p>
                     
                     <div className="mt-4 mb-2 w-full relative h-[6px] bg-gray-100 rounded-full flex items-center">
                        <div className="absolute top-0 left-0 h-full bg-[#4CAF50] rounded-full transition-all duration-700 shadow-sm" style={{ width: `${percent}%` }}></div>
                        
                        {/* Overlay Nodes */}
                        <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-[2px]">
                           {nodesArr.map((_, i) => {
                              const nodePercent = (i / (item.nodes - 1)) * 100;
                              const isActive = percent >= nodePercent;
                              return (
                                <div key={i} className={`w-[12px] h-[12px] bg-white rounded-full flex items-center justify-center shadow-sm relative z-10 transition-colors ${isActive ? 'border-[3px] border-[#4CAF50]' : 'border-[3px] border-gray-200'}`}>
                                   {isActive && percent > 0 && i === Math.floor((percent/100)*(item.nodes-1)) && !isCompleted && (
                                     <svg className="w-2.5 h-2.5 text-[#4CAF50] absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                   )}
                                   {isActive && isCompleted && (
                                     <svg className="w-2.5 h-2.5 text-[#4CAF50] absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                   )}
                                </div>
                              )
                           })}
                        </div>
                     </div>
                     
                     <div className="flex items-center justify-between text-[11px] font-medium text-gray-500 mt-1.5">
                        <span className={`font-bold ${isCompleted ? 'text-[#2E7D32]' : 'text-gray-700'}`}>{item.progress}/{item.max}</span>
                        {!isCompleted ? (
                          <span className="text-orange-600 font-bold">{item.timeLeft}</span>
                        ) : (
                          <span className="text-[#4CAF50] font-bold">รอรับรางวัล</span>
                        )}
                     </div>
                  </div>
                  
                  {/* Right Side (Reward Badge) */}
                  <div className="w-[70px] h-[70px] flex items-center justify-center shrink-0">
                     <div className={`w-full h-full rounded-full border-[3px] ${item.badgeOutline} flex flex-col items-center justify-center relative overflow-hidden shadow-sm ${item.badgeBg}`}>
                        <div className="absolute inset-0 bg-white/40"></div>
                        <div className={`relative z-10 font-black text-center ${item.badgeColor}`}>
                           <div className="text-[13px] leading-none tracking-tighter drop-shadow-sm px-1 break-words pb-0.5">{item.badgeText}</div>
                        </div>
                        <div className="relative z-10 mt-0.5 bg-white/90 text-gray-800 text-[6.5px] font-black px-1.5 rounded-sm uppercase border border-gray-200/50 shadow-sm">{item.badgeSub}</div>
                     </div>
                  </div>

               </div>
             )
           })
         ) : (
           <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-60">
             <div className="text-[40px]">{activeTab === 'active' ? '🔍' : '🏆'}</div>
             <p className="text-[13px] font-bold text-gray-400">
               {activeTab === 'active' ? 'ยังไม่มีภารกิจในหมวดหมู่นี้' : 'ยังไม่มีภารกิจที่จบแล้วในหมวดหมู่นี้'}
             </p>
           </div>
         )}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
