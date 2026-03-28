"use client";

import { useState } from "react";
import Link from "next/link";

export default function NewsPage() {
   const [activeTab, setActiveTab] = useState("all");

   const campaigns = [
      {
         id: 1,
         tag: "Campaign",
         title: "JDent Challenge ป้ายยาดี มีรางวัลเพียบ!",
         desc: "ร่วมรีวิวผลิตภัณฑ์ยาสีฟันเจเด้นท์ ผ่าน TikTok รับทันที 500 แต้ม พร้อมสิทธิ์ลุ้นรับ iPhone 15 Pro Max",
         imageColor: "bg-gradient-to-br from-[#FFD700] to-[#FFA000]",
         date: "หมดเขต 30 เม.ย. 69",
         isHot: true,
         category: "campaign",
         icon: "🦷"
      },
      {
         id: 2,
         tag: "Promotion",
         title: "แต้มคูณสอง! ฉลองครบรอบจุฬาเฮิร์บ",
         desc: "สแกนคิวอาร์โค้ดสบู่แตงโมวันนี้ รับแต้มสะสม x2 ทันที ทุกกล่อง! สะสมให้ไว แลกของรางวัลได้เร็วกว่าเดิม",
         imageColor: "bg-gradient-to-br from-[#4CAF50] to-[#2E7D32]",
         date: "หมดเขต 15 เม.ย. 69",
         isHot: true,
         category: "promotion",
         icon: "🍉"
      },
      {
         id: 3,
         tag: "News",
         title: "อัปเดตใหม่! แลกของรางวัลได้ง่ายขึ้นผ่านเว็บ",
         desc: "พบกับระบบคลังของชิ้นโปรดแบบใหม่ ที่ช่วยให้คุณติดตามสถานะจัดส่งของได้แบบ Real-time ตลอด 24 ชม.",
         imageColor: "bg-gradient-to-br from-blue-400 to-blue-600",
         date: "ประกาศเมื่อ 1 มี.ค. 69",
         isHot: false,
         category: "news",
         icon: "📰"
      },
      {
         id: 4,
         tag: "Event",
         title: "กิจกรรมบริจาคแต้ม ช่วยเหลือน้องหมาจรจัด",
         desc: "สายบุญห้ามพลาด! ทุก 100 แต้มของคุณ มีค่าเท่ากับอาหาร 1 มื้อสำหรับน้องหมาที่มูลนิธิ The Voice",
         imageColor: "bg-gradient-to-br from-rose-400 to-pink-600",
         date: "ร่วมบริจาคได้ตลอดปี 69",
         isHot: false,
         category: "event",
         icon: "🐶"
      }
   ];

   return (
      <div className="w-full flex flex-col items-center pb-12 pt-2">

         {/* 1. Page Title */}
         <div className="px-5 mt-5 mb-4 w-full max-w-[480px] flex items-center justify-between">
            <div>
               <h1 className="text-[22px] font-black text-gray-900 tracking-tight">แคมเปญ & ข่าวสาร</h1>
               <p className="text-gray-500 text-[11.5px] mt-0.5 font-medium tracking-tight">อัปเดตกิจกรรม โปรโมชั่นพิเศษก่อนใคร</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-[14px] flex items-center justify-center text-[24px] border border-green-100 shadow-sm transform -rotate-12">
               📢
            </div>
         </div>

         {/* 2. Featured Banner (Hero) */}
         <div className="px-4 w-full max-w-[480px]">
            <div className="w-full bg-gradient-to-br from-[#1b5e20] to-[#2E7D32] rounded-[24px] overflow-hidden shadow-[0_8px_20px_rgba(27,94,32,0.25)] relative aspect-[1.9/1] flex items-end p-5 group cursor-pointer border border-[#4CAF50]/30 active:scale-[0.98] transition-transform">
               {/* Decoration Elements */}
               <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#4CAF50] rounded-full mix-blend-screen filter blur-[40px] opacity-60"></div>
               <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-[#8ac43f] rounded-full mix-blend-screen filter blur-[30px] opacity-40"></div>
               <div className="absolute right-4 top-4 text-[80px] opacity-20 transform rotate-[15deg] group-hover:scale-110 transition-transform duration-500 ease-out select-none pointer-events-none">🦷</div>

               <div className="absolute top-4 left-4 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-[6px] shadow-[0_2px_8px_rgba(239,68,68,0.4)] tracking-wider uppercase animate-pulse border border-red-400">Hot Event 🔥</div>

               <div className="relative z-10 w-[95%]">
                  <h2 className="text-white text-[18px] font-black leading-tight drop-shadow-md tracking-tight">JDent Challenge ป้ายยาดี มีรางวัลเพียบ!</h2>
                  <p className="text-green-100/90 text-[11.5px] mt-2 font-medium line-clamp-2 leading-relaxed">ร่วมรีวิวยาสีฟันเจเด้นท์ ผ่าน TikTok รับทันที 500 แต้ม พร้อมรับสิทธิ์ลุ้น iPhone 15 Pro Max</p>
               </div>

               <div className="absolute bottom-5 right-5 z-20">
                  <div className="bg-white text-[#1b5e20] w-8 h-8 rounded-full shadow-sm flex items-center justify-center transform group-hover:translate-x-1 transition-transform">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </div>
               </div>
            </div>
         </div>

         {/* 3. Filter Tabs (Sticky below shell) */}
         <div className="px-4 w-full max-w-[480px] sticky top-[56px] z-[40] bg-[#F5F7F6]/95 backdrop-blur-md py-4 border-b border-gray-200/50 shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
            <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
               {[
                  { id: 'all', label: 'ฟีดข่าวทั้งหมด' },
                  { id: 'campaign', label: 'แคมเปญ 🎁' },
                  { id: 'promotion', label: 'โปรโมชั่น ⚡' },
                  { id: 'news', label: 'ประกาศ 📰' },
               ].map(tab => (
                  <button
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`whitespace-nowrap px-4 py-[7px] rounded-full text-[12.5px] font-bold transition-all shadow-sm border ${activeTab === tab.id
                        ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-[0_4px_10px_rgba(76,175,80,0.3)] scale-105'
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                  >
                     {tab.label}
                  </button>
               ))}
            </div>
         </div>

         {/* 4. News Feed List */}
         <div className="px-4 w-full max-w-[480px] mt-4 flex flex-col gap-4">
            {campaigns.filter(c => activeTab === 'all' || c.category === activeTab).map((item, i) => (
               <div key={item.id} className="bg-white rounded-[22px] p-3 shadow-[0_2px_16px_rgba(0,0,0,0.03)] border border-gray-100 flex gap-3.5 hover:border-green-200 transition-colors active:scale-[0.98] cursor-pointer group" style={{ animationDelay: `${i * 100}ms` }}>

                  {/* Thumbnail Image Slot */}
                  <div className={`w-[96px] h-[96px] shrink-0 rounded-[16px] ${item.imageColor} relative overflow-hidden flex items-center justify-center shadow-inner`}>
                     <div className="absolute top-0 left-0 w-full h-full bg-black/10"></div>
                     <div className="text-[44px] drop-shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">{item.icon}</div>

                     {/* Tag Overlay */}
                     <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-gray-800 text-[8px] font-black px-1.5 py-0.5 rounded-[4px] uppercase tracking-wider shadow-sm">
                        {item.tag}
                     </div>
                  </div>

                  {/* Content Slot */}
                  <div className="flex-1 py-1 pr-1.5 flex flex-col justify-between">
                     <div>
                        <h3 className="font-bold text-gray-900 text-[13.5px] leading-tight line-clamp-2 tracking-tight">{item.title}</h3>
                        <p className="text-gray-400 text-[10.5px] mt-1.5 leading-relaxed line-clamp-2">{item.desc}</p>
                     </div>

                     <div className="flex items-center justify-between mt-2">
                        <span className="text-[#4CAF50] bg-green-50 px-2 py-0.5 rounded-md border border-green-100 text-[10px] font-bold flex items-center gap-1 shadow-sm">
                           <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                           {item.date}
                        </span>
                        <button className="text-gray-300 group-hover:text-[#4CAF50] transition-colors w-6 h-6 flex items-center justify-center bg-gray-50 group-hover:bg-green-50 rounded-full">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                        </button>
                     </div>
                  </div>

               </div>
            ))}

            {/* Empty State fallback just in case */}
            {campaigns.filter(c => activeTab === 'all' || c.category === activeTab).length === 0 && (
               <div className="bg-white rounded-[20px] p-8 text-center border border-gray-100 mt-4">
                  <div className="text-[40px] opacity-50 mb-2">📭</div>
                  <div className="text-[14px] font-bold text-gray-800">ยังไม่มีข่าวสารในหมวดหมู่นี้</div>
               </div>
            )}
         </div>

         <style dangerouslySetInnerHTML={{
            __html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      </div>
   );
}
