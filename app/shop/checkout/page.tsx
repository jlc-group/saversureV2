"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutPage() {
  const router = useRouter();
  
  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] min-h-screen relative font-sans pb-[100px]">
      
      {/* 1. Header */}
      <div className="fixed top-0 w-full max-w-[480px] z-50 bg-white shadow-sm flex items-center px-3 py-3 border-b border-gray-100">
         <button onClick={() => router.back()} className="text-[#ee4d2d] w-8 h-8 flex items-center justify-center -ml-1 active:bg-orange-50 rounded-full transition-colors mr-2">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-[17.5px] font-black text-gray-800 tracking-tight">ทำการสั่งซื้อ</h1>
      </div>
      <div className="pt-[52px]"></div>

      {/* Candy-cane stripe envelope pattern (classic marketplace style for Address) */}
      <div className="w-full h-[3px] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MiIgaGVpZ2h0PSI0Ij48cmVjdCB3aWR0aD0iMjEiIGhlaWdodD0iNCIgZmlsbD0iI2ZmY2RkMiIvPjxyZWN0IHg9IjIxIiB3aWR0aD0iMjEiIGhlaWdodD0iNCIgZmlsbD0iI2I4ZTlkZSIvPjwvc3ZnPg==')] bg-repeat-x"></div>
      
      {/* 2. Address Block */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-3 active:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100">
         <div className="text-gray-600 self-start mt-0.5">
            <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
         </div>
         <div className="flex-1">
            <div className="font-bold text-[13.5px] text-gray-800">ที่อยู่สำหรับจัดส่ง <span className="text-gray-400 font-medium ml-1">| 089-123-4567</span></div>
            <div className="text-[11.5px] text-gray-600 leading-relaxed mt-0.5 line-clamp-2 pr-2">ฉัตรธิดา สุขสบาย 123/45 ถนนสุขุมวิท 71 แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110</div>
         </div>
         <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </div>

      {/* 3. Items Block */}
      <div className="mt-2 bg-white flex flex-col shadow-sm">
         {/* Title */}
         <div className="p-3 border-b border-gray-100 text-[13px] font-black text-gray-800 flex items-center gap-1.5 uppercase tracking-tight">
            <svg className="w-[14px] h-[14px] text-[#ee4d2d]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Jula's Herb Official
         </div>
         {/* Item 1 */}
         <div className="p-3.5 flex items-start gap-3 bg-[#fafafa] border-b border-white">
            <div className="w-[64px] h-[64px] bg-white border border-gray-200 rounded-sm shrink-0 overflow-hidden">
               <img src="https://placehold.co/200x200/e8f5e9/2e7d32?text=Product" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="flex-1 flex flex-col justify-between h-[64px]">
               <h3 className="text-[12px] font-medium text-gray-800 line-clamp-1 leading-snug">กันแดดแตงโม หลอดใหญ่ 40ml. DD Watermelon</h3>
               <div className="text-[11px] text-gray-500 line-clamp-1">ตัวเลือก: หลอดใหญ่ 40ml</div>
               <div className="flex justify-between items-center mt-auto pb-[1px]">
                  <span className="text-[13.5px] font-medium text-gray-800">฿199</span>
                  <span className="text-[11.5px] font-bold text-gray-500">x1</span>
               </div>
            </div>
         </div>
         {/* Item 2 */}
         <div className="p-3.5 flex items-start gap-3 bg-[#fafafa]">
            <div className="w-[64px] h-[64px] bg-white border border-gray-200 rounded-sm shrink-0 overflow-hidden">
               <img src="https://placehold.co/200x200/fff3e0/e65100?text=Product" className="w-full h-full object-cover mix-blend-multiply" />
            </div>
            <div className="flex-1 flex flex-col justify-between h-[64px]">
               <h3 className="text-[12px] font-medium text-gray-800 line-clamp-1 leading-snug">เซรั่มจุฬาเฮิร์บ หัวเชื้อหน้าใส 8ml (สูตรผิวขาว)</h3>
               <div className="text-[11px] text-gray-500 line-clamp-1">ตัวเลือก: กล่อง (6 ซอง)</div>
               <div className="flex justify-between items-center mt-auto pb-[1px]">
                  <span className="text-[13.5px] font-medium text-gray-800">฿195</span>
                  <span className="text-[11.5px] font-bold text-gray-500">x2</span>
               </div>
            </div>
         </div>
         
         {/* Message */}
         <div className="px-3.5 py-3 border-t border-b border-gray-100 flex items-center justify-between">
            <span className="text-[13px] font-medium text-gray-800 w-[70px]">ข้อความ:</span>
            <input type="text" placeholder="ฝากข้อความถึงผู้ขาย" className="flex-1 text-[12.5px] text-right bg-transparent outline-none ml-2 text-gray-800 placeholder:text-gray-400 font-medium" />
         </div>

         {/* Delivery Info */}
         <div className="p-3.5 border-b border-gray-100 flex items-start justify-between cursor-pointer active:bg-gray-50 transition-colors">
            <div>
               <div className="text-[13.5px] text-[#00bfa5] font-black tracking-tight">Standard Delivery</div>
               <div className="text-[11px] text-gray-500 mt-0.5 font-medium">ได้รับสินค้าภายใน 26-28 มี.ค.</div>
            </div>
            <div className="flex items-center gap-2">
               <div className="flex flex-col items-end">
                  <span className="text-[13px] font-medium text-gray-800">฿30</span>
                  <span className="text-[10px] text-green-600 line-through opacity-80 decoration-green-600 tracking-tight">-฿30 จัดส่งฟรี</span>
               </div>
               <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </div>
         
         <div className="px-3.5 py-3.5 flex items-center justify-between text-[13px] border-b border-gray-50">
            <span className="font-medium text-gray-500">ยอดรวมคำสั่งซื้อ (3 ชิ้น):</span>
            <span className="font-bold text-[#ee4d2d] text-[15px]">฿589</span>
         </div>
      </div>

      {/* 4. Payment Methods Block */}
      <div className="mt-2 bg-white shadow-sm">
         <div className="p-3.5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2.5 text-[13.5px] font-medium text-gray-800">
               <svg className="w-[20px] h-[20px] text-orange-500 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
               วิธีการชำระเงิน
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
               <span className="text-[12px] font-medium text-[#ee4d2d]">โอนเงินผ่านสแกน QR Code</span>
               <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </div>
      </div>

      {/* 5. Summary Breakdown List */}
      <div className="mt-2 bg-white px-3.5 py-4 text-[12px] space-y-2.5 shadow-sm text-gray-500 pb-5">
         <div className="flex justify-between items-center font-bold text-gray-800 text-[13px] pb-1.5 border-b border-gray-50">
            <div className="flex items-center gap-1.5">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
               รายละเอียดการชำระเงิน
            </div>
         </div>
         <div className="flex justify-between items-center mt-2.5 font-medium">
            <span>รวมค่าสินค้า</span>
            <span className="text-gray-800">฿589</span>
         </div>
         <div className="flex justify-between items-center font-medium">
            <span>รวมค่าจัดส่ง</span>
            <span className="text-gray-800">฿30</span>
         </div>
         <div className="flex justify-between items-center font-medium">
            <span>ส่วนลดค่าจัดส่ง</span>
            <span className="text-[#00bfa5]">-฿30</span>
         </div>
         <div className="flex justify-between items-center font-medium">
            <span>ใช้แต้ม Jula Point (140แต้ม) <span className="text-[#FFD700] ml-0.5 relative top-[-1px]">💰</span></span>
            <span className="text-[#ee4d2d]">-฿14</span>
         </div>
         <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-gray-100">
            <span className="text-gray-800 font-bold text-[13.5px]">ยอดชำระเงินทั้งหมด</span>
            <span className="text-[#ee4d2d] text-[18px] font-black drop-shadow-sm tracking-tight leading-none">฿575</span>
         </div>
      </div>

      <div className="px-5 py-4 text-[10.5px] text-gray-400 leading-snug font-medium flex items-start gap-1.5 text-justify">
         <svg className="w-3.5 h-3.5 shrink-0 mt-px text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
         การคลิก "สั่งซื้อสินค้า" หมายความว่าคุณได้ยอมรับ <span className="text-blue-500">เงื่อนไขการให้บริการ</span> และ <span className="text-blue-500">นโยบายความเป็นส่วนตัว</span> ของ Jula's Herb เรียบร้อยแล้ว
      </div>

      {/* 6. Sticky Bottom Action Bar */}
      <div className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[60px] bg-white flex items-center z-[60] border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] text-right pl-3 pr-0">
         <div className="flex-1 flex flex-col justify-center pr-3 pb-0.5">
            <span className="text-[12.5px] font-medium text-gray-800 flex items-center justify-end gap-1.5">
               ยอดชำระเงินทั้งหมด 
               <span className="text-[#ee4d2d] font-black text-[18px] drop-shadow-sm tracking-tight leading-none pt-1">
                 <span className="text-[12px] font-bold">฿</span>575
               </span>
            </span>
         </div>
         <button className="bg-[#ee4d2d] text-white h-full px-6 flex items-center justify-center font-bold text-[14px] active:bg-[#d44327] transition-colors w-[130px] shadow-[inset_1px_0_0_rgba(255,255,255,0.2)]">
            สั่งซื้อสินค้า
         </button>
      </div>

    </div>
  );
}
