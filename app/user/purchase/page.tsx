"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function PurchaseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    { id: 'all', label: "ทั้งหมด" },
    { id: 'to_pay', label: "ที่ต้องชำระ" },
    { id: 'to_ship', label: "ที่ต้องจัดส่ง" },
    { id: 'shipping', label: "กำลังจัดส่ง" },
    { id: 'completed', label: "สำเร็จแล้ว" },
    { id: 'cancelled', label: "ยกเลิกแล้ว" },
  ];

  // Mock Orders Data
  const orders = [
    {
      id: "ORD-2026-X89B1",
      status: "to_ship",
      statusLabel: "ผู้จัดส่งกำลังเตรียมพัสดุ",
      statusColor: "text-[#ee4d2d]",
      items: [
         {
            name: "Jula's Herb เซรั่มบำรุงผิวหน้าสูตรเข้มข้น (50ml)",
            variant: "สูตร: ผิวกระจ่างใส",
            price: 490,
            originalPrice: 590,
            qty: 1,
            image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1312-300x300.jpg"
         }
      ],
      itemCount: 1,
      total: 490,
      actions: ["ติดต่อผู้ขาย"],
      primaryAction: "ขยายระยะเวลาจัดส่ง"
    },
    {
      id: "ORD-2026-C44D2",
      status: "shipping",
      statusLabel: "พัสดุกำลังจัดส่ง - เคอรี่ เอ็กซ์เพรส",
      statusColor: "text-[#2e7d32]",
      items: [
         {
            name: "ครีมกันแดดแตงโม Jula's Herb SPF50 PA+++ (40g)",
            variant: "สูตร: กันแดดเนื้อน้ำ",
            price: 245,
            originalPrice: 350,
            qty: 2,
            image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1303-1-300x300.jpg"
         }
      ],
      itemCount: 2,
      total: 490,
      actions: ["สถานะการจัดส่ง", "ติดต่อผู้ขาย"],
      primaryAction: "ฉันได้ตรวจสอบและยอมรับสินค้า"
    },
    {
      id: "ORD-2026-A11Z5",
      status: "to_pay",
      statusLabel: "ที่ต้องชำระเงิน",
      statusColor: "text-[#ee4d2d]",
      items: [
         {
            name: "เซ็ตดูแลผิวหน้า สูตรแก้ลดเลือนริ้วรอย Jula's Herb",
            variant: "เซ็ต 3 ชิ้น",
            price: 990,
            originalPrice: 1290,
            qty: 1,
            image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1313-300x300.jpg"
         }
      ],
      itemCount: 1,
      total: 990,
      actions: ["ยกเลิกคำสั่งซื้อ", "ติดต่อผู้ขาย"],
      primaryAction: "ชำระเงิน"
    }
  ];

  const displayOrders = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div className="min-h-[100dvh] bg-[#F5F7F6] w-full font-sans pb-10 flex flex-col items-center relative">
      
      {/* Coming Soon Overlay */}
      <div className="fixed inset-0 z-[60] bg-white/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-auto">
         <div className="bg-white rounded-[24px] p-6 text-center shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-green-50 max-w-[280px] animate-fade-in relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-[#4CAF50] rounded-full blur-2xl opacity-10"></div>
            <div className="text-[48px] mb-2 drop-shadow-sm relative z-10">🛒</div>
            <h2 className="text-[18px] font-black text-gray-900 mb-1.5 relative z-10 tracking-tight">ระบบสั่งซื้อ<br/>กำลังเตรียมพร้อม</h2>
            <p className="text-[12px] text-gray-500 font-medium relative z-10 leading-relaxed">คาดว่าจะสามารถให้ใช้บริการได้เร็วๆ นี้ โปรดรอติดตามอัปเดตจากเรานะครับ</p>
            <button onClick={() => router.back()} className="mt-5 bg-[#4CAF50] text-white font-bold text-[13px] px-6 py-2.5 rounded-[12px] shadow-[0_4px_12px_rgba(76,175,80,0.3)] active:scale-95 transition-transform relative z-10 w-full">กลับไปหน้าโปรไฟล์</button>
         </div>
      </div>

      {/* 1. Header fixed top */}
      <div className="bg-white w-full max-w-[480px] fixed top-[56px] z-50 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-b border-gray-100 flex items-center justify-between px-2 py-3">
         <button className="w-10 h-10 flex items-center justify-center text-gray-600 active:bg-gray-50 rounded-full transition-colors opacity-40">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-[17px] font-bold text-gray-800 tracking-tight">การสั่งซื้อของฉัน</h1>
         <div className="w-10 flex items-center justify-center text-gray-400 opacity-40">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
         </div>
      </div>

      {/* 2. Top Tabs sliding */}
      <div className="fixed top-[112px] w-full max-w-[480px] z-40 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.03)] border-b border-gray-50/50">
         <div className="flex overflow-x-auto scrollbar-none snap-x snap-mandatory px-2">
            {tabs.map((tab) => (
               <button
                 key={tab.id}
                 className={`shrink-0 snap-start px-3.5 py-3.5 text-[13px] font-bold whitespace-nowrap border-b-[3px] transition-colors duration-200 ${activeTab === tab.id ? 'border-[#4CAF50] text-[#4CAF50]' : 'border-transparent text-gray-400'}`}
               >
                 {tab.label}
               </button>
            ))}
         </div>
      </div>

      <div className="pt-[168px] w-full max-w-[480px] flex flex-col gap-3.5 px-3">
        {displayOrders.length > 0 ? (
           displayOrders.map((order, idx) => (
              <div key={idx} className="bg-white w-full shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-gray-100 rounded-[20px] flex flex-col overflow-hidden">
                 
                 {/* Store & Status Header */}
                 <div className="flex items-center justify-between p-3.5 border-b border-gray-50 bg-[#fafdfa]/50">
                    <div className="flex items-center gap-1.5">
                       <div className="w-5 h-5 bg-green-50 rounded-full flex items-center justify-center text-[#4CAF50]"><svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" /></svg></div>
                       <span className="font-black text-[13px] text-gray-800 tracking-tight">Jula's Herb Official</span>
                       <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                    </div>
                    <span className={`text-[11.5px] font-black tracking-tight ${order.statusColor === 'text-[#ee4d2d]' ? 'text-orange-500' : 'text-[#4CAF50]'}`}>{order.statusLabel}</span>
                 </div>

                 {/* Order Items */}
                 {order.items.map((item, iDx) => (
                    <div key={iDx} className="p-3.5 bg-white flex gap-3.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors">
                       <div className="w-[84px] h-[84px] bg-gray-50 border border-gray-100 rounded-[12px] overflow-hidden shrink-0 shadow-sm">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                       </div>
                       <div className="flex-1 flex flex-col py-0.5">
                          <span className="text-[13px] text-gray-800 font-bold leading-tight line-clamp-2">{item.name}</span>
                          <span className="text-[11px] text-gray-400 mt-1 font-medium">{item.variant}</span>
                          <span className="text-[11px] text-gray-400 mt-auto font-bold">x{item.qty}</span>
                       </div>
                       <div className="flex flex-col items-end py-0.5">
                          <span className="text-[11px] text-gray-300 line-through font-medium">฿{item.originalPrice}</span>
                          <span className="text-[14px] text-[#4CAF50] font-black mt-auto leading-none">฿{item.price}</span>
                       </div>
                    </div>
                 ))}

                 {/* Total and Summary footer */}
                 <div className="p-3.5 border-b border-gray-50 flex items-center justify-between">
                    <span className="text-[11.5px] text-gray-500 font-medium">สินค้าทั้งหมด {order.itemCount} ชิ้น</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[12.5px] text-gray-700 font-bold">ยอดสุทธิ:</span>
                       <span className="text-[16px] font-black text-[#4CAF50]">฿{order.total}</span>
                    </div>
                 </div>

                 {/* Action Buttons */}
                 <div className="flex items-center justify-end gap-2.5 p-3.5 bg-white">
                    {order.actions.map((act, i) => (
                       <button key={i} className="px-4 py-2 border border-gray-200 rounded-[12px] text-[12px] text-gray-600 font-bold active:bg-gray-50 shadow-sm transition-colors">
                          {act}
                       </button>
                    ))}
                    <button className="px-4 py-2 text-white bg-[#4CAF50] hover:bg-[#388E3C] rounded-[12px] text-[12px] font-black shadow-[0_4px_12px_rgba(76,175,80,0.25)] active:scale-95 transition-all outline-none">
                       {order.primaryAction}
                    </button>
                 </div>

              </div>
           ))
        ) : (
           <div className="flex flex-col items-center justify-center pt-24 pb-16 opacity-60">
              <div className="w-[100px] h-[100px] bg-gray-100 rounded-full mb-4 flex items-center justify-center text-[40px] shadow-inner">📦</div>
              <p className="text-[14px] font-bold text-gray-500">ยังไม่มีคำสั่งซื้อ</p>
           </div>
        )}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in { animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}

export default function PurchasePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F5F5]"/>}>
      <PurchaseContent />
    </Suspense>
  )
}
