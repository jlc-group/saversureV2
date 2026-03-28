"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MyRewardsWalletPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("coupons");

  const mockRewards = [
    {
      id: 1,
      type: "coupons",
      title: "คูปองส่วนลด 100 บาท (VIP)",
      desc: "ส่วนลดพิเศษเมื่อซื้อสินค้าครบ 500 บาทขึ้นไป",
      source: "ได้รับจากภารกิจ: ฉลองความสำเร็จ",
      dateStr: "หมดอายุ 31 ธ.ค. 69",
      status: "ready",
      statusText: "พร้อมใช้งาน",
      icon: "🎫",
      bg: "bg-gradient-to-br from-[#FFF8E1] to-[#FFECB3]",
      border: "border-[#FFE082]"
    },
    {
      id: 2,
      type: "coupons",
      title: "ส่วนลด 40 บาท (DD Cream)",
      desc: "ใช้เป็นส่วนลดสำหรับดีดีครีมแตงโมขนาดใดก็ได้",
      source: "ได้รับจากภารกิจ: สแกนดีดีครีม",
      dateStr: "หมดอายุ 15 เม.ย. 69",
      status: "ready",
      statusText: "พร้อมใช้งาน",
      icon: "🎁",
      bg: "bg-gradient-to-br from-[#ffebee] to-[#ffcdd2]",
      border: "border-[#ef9a9a]"
    },
    {
      id: 3,
      type: "physical",
      title: "หมอนผ้าห่มแตงโม พรีเมียม",
      desc: "หมอนผ้าห่มลายน่ารักสุดพรีเมียมจากเจเด้นท์",
      source: "ใช้ 1,200 แต้ม แลกรับ",
      dateStr: "TBKK829103994TH",
      status: "shipping",
      statusText: "กำลังจัดส่ง 🚚",
      icon: "📦",
      bg: "bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]",
      border: "border-[#90CAF9]"
    }
  ];

  const displayItems = mockRewards.filter(item => item.type === activeTab);

  return (
    <div className="w-full flex items-center justify-center bg-[#F5F7F6] min-h-screen">
      <div className="w-full max-w-[480px] bg-[#F5F7F6] min-h-screen flex flex-col relative font-sans shadow-[0_0_40px_rgba(0,0,0,0.05)] pb-[100px]">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 flex items-center justify-center border-b border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer" onClick={() => router.back()}>
            <div className="w-8 h-8 flex items-center justify-center text-gray-500 rounded-full active:bg-gray-50 transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </div>
          </div>
          <h1 className="text-[17px] font-black tracking-tight text-gray-800">กระเป๋าของรางวัล</h1>
        </div>

        {/* User Summary Card */}
        <div className="px-4 py-5">
           <div className="bg-gradient-to-br from-[#1b5e20] to-[#4CAF50] rounded-[20px] p-5 text-white shadow-[0_8px_24px_rgba(76,175,80,0.25)] relative overflow-hidden">
              <div className="absolute -right-4 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 flex justify-between items-center">
                 <div>
                    <h2 className="text-[13px] font-medium text-green-50 mb-1">ของรางวัลทั้งหมด</h2>
                    <div className="flex items-baseline gap-1.5">
                       <span className="text-[32px] font-black leading-none drop-shadow-sm">3</span>
                       <span className="text-[14px] font-bold text-green-100">รายการ</span>
                    </div>
                 </div>
                 <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-inner">
                    <span className="text-[24px]">🏆</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Sub Tabs */}
        <div className="px-4 mb-4">
           <div className="bg-white p-1 rounded-[14px] flex gap-1 shadow-sm border border-gray-100/50">
              <button 
                onClick={() => setActiveTab('coupons')}
                className={`flex-1 py-2 text-[13.5px] font-bold rounded-[10px] transition-all duration-300 ${activeTab === 'coupons' ? 'bg-[#4CAF50] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                 คูปองส่วนลด
              </button>
              <button 
                onClick={() => setActiveTab('physical')}
                className={`flex-1 py-2 text-[13.5px] font-bold rounded-[10px] transition-all duration-300 ${activeTab === 'physical' ? 'bg-[#4CAF50] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                 ของพรีเมียมจัดส่ง
              </button>
           </div>
        </div>

        {/* Rewards List */}
        <div className="px-4 flex flex-col gap-3.5">
           {displayItems.length > 0 ? displayItems.map(item => (
              <div key={item.id} className="bg-white rounded-[20px] p-4 flex flex-col border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                 
                 {/* Decorative Top Banner */}
                 <div className={`absolute top-0 left-0 right-0 h-1.5 ${item.bg}`}></div>
                 
                 <div className="flex gap-4 mt-2">
                    <div className={`w-[70px] h-[70px] ${item.bg} border ${item.border} rounded-[16px] flex items-center justify-center text-[36px] shadow-sm shrink-0`}>
                       {item.icon}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                       <div className="flex items-start justify-between">
                          <h3 className="text-[14.5px] font-black text-gray-800 leading-tight mb-1 pr-2">{item.title}</h3>
                       </div>
                       <p className="text-[11px] text-gray-500 font-medium leading-snug mb-1">{item.desc}</p>
                       <p className="text-[9.5px] text-gray-400 font-bold bg-gray-50 inline-block px-1.5 py-0.5 rounded border border-gray-100 mb-2">{item.source}</p>
                    </div>
                 </div>
                 
                 {/* Action Footer */}
                 <div className="mt-3 pt-3 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <div>
                       <div className="text-[10px] text-gray-400 font-medium">สถานะ</div>
                       <div className={`text-[12px] font-black ${item.status === 'ready' ? 'text-[#f57c00]' : 'text-[#1976d2]'}`}>{item.statusText}</div>
                    </div>
                    
                    {item.status === 'ready' ? (
                       <button onClick={() => alert('จำลองการเปิดใช้งานคูปองส่วนลด (แสดง QR Barcode / ใช้งานหน้า Checkout)')} className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] text-[#5D4037] text-[12px] font-black px-5 py-2 rounded-xl shadow-sm active:scale-95 transition-transform">
                          ใช้งานทันที
                       </button>
                    ) : (
                       <button onClick={() => alert('ไปหน้าคำสั่งซื้อของฉัน เพื่อเช็กสถานะพัสดุ')} className="bg-[#E3F2FD] text-[#0D47A1] text-[12px] font-black px-4 py-2 rounded-xl border border-[#90CAF9] shadow-sm active:scale-95 transition-transform flex items-center gap-1.5">
                          ติดตามพัสดุ
                       </button>
                    )}
                 </div>
              </div>
           )) : (
              <div className="py-20 flex flex-col items-center justify-center gap-3 opacity-60">
                 <div className="text-[40px]">📭</div>
                 <p className="text-[13px] font-bold text-gray-400 flex flex-col items-center">
                    ยังไม่มีรางวัลในหมวดหมู่นี้
                    <span className="text-[11px] mt-1 font-medium">ไปทำภารกิจหรือแลกแต้มเพื่อรับรางวัลเลย!</span>
                 </p>
                 <button onClick={() => router.push('/missions')} className="mt-2 text-[#4CAF50] text-[12px] font-bold underline">ดูภารกิจทั้งหมด</button>
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
