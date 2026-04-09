"use client";

import Link from "next/link";
import { useState } from "react";

export default function ShopPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const flashSale = [
    { id: 101, title: "ดีดีครีมกันแดดแตงโม 8ml (1กล่อง/6ซอง)", price: 195, oldPrice: 234, soldProgress: 85, image: "https://placehold.co/300x300/e8f5e9/4caf50?text=DD+Watermelon" },
    { id: 102, title: "เซรั่มมะรุม ลดรอยดำ 8ml (1กล่อง/6ซอง)", price: 195, oldPrice: 234, soldProgress: 92, image: "https://placehold.co/300x300/f3e5f5/9c27b0?text=Moringa+Serum" },
    { id: 103, title: "เจลแต้มสิวดอกดาวเรือง (1กล่อง/6ซอง)", price: 199, oldPrice: 240, soldProgress: 100, image: "https://placehold.co/300x300/fff8e1/ffb300?text=Marigold+Gel" },
  ];

  const products = [
    { id: 1, title: "สบู่แตงโม ล้างหน้าใส (ก้อนละ 60g)", price: 59, sold: "12.5 พัน", rating: 4.9, image: "https://placehold.co/400x400/ffebee/d32f2f?text=Watermelon+Soap", isMall: true, isDiscount: true, tags: ["ส่งฟรี", "คืน 10%"] },
    { id: 2, title: "เซรั่มแครอท หน้าใส (1กล่อง/6ซอง)", price: 195, sold: "8.2 พัน", rating: 4.8, image: "https://placehold.co/400x400/fff3e0/e65100?text=Carrot+Serum", isMall: true, tags: ["ส่งฟรี"] },
    { id: 3, title: "เจลขัดขี้ไคล มะขาม (1ซอง)", price: 49, sold: "5.1 พัน", rating: 4.7, image: "https://placehold.co/400x400/efebe9/5d4037?text=Tamarind", isMall: false, isDiscount: true, tags: ["โปรโมชั่น"] },
    { id: 4, title: "กันแดดแตงโม หลอดใหญ่ 40ml คุ้มสุดในแอป", price: 199, sold: "22 พัน", rating: 5.0, image: "https://placehold.co/400x400/e8f5e9/2e7d32?text=Sunscreen", isMall: true, tags: ["คืน 10%"] },
    { id: 5, title: "เจลแต้มสิว ดาวเรือง สูตรใหม่ อ่อนโยน (1หลอด)", price: 159, sold: "18 พัน", rating: 4.9, image: "https://placehold.co/400x400/fff8e1/ffb300?text=Acne+Gel", isMall: true, tags: ["ส่งฟรี"] },
    { id: 6, title: "สบู่ลำไย ลดฝ้ากระ (ก้อน 60g) แบบก้อนเดี่ยว", price: 59, sold: "9 พัน", rating: 4.8, image: "https://placehold.co/400x400/f3e5f5/8e24aa?text=Longan+Soap", isMall: false, tags: [] },
  ];

  const showOldShop = false;

  if (!showOldShop) {
    return (
      <div className="w-full flex flex-col min-h-[100dvh] bg-[#F5F7F6] font-sans pb-24 relative overflow-hidden">
        
        {/* Header matching Profile/Home aesthetic */}
        <div className="w-full max-w-[480px] bg-gradient-to-b from-[#E8F5E9] to-[#F5F7F6] pt-10 pb-6 px-6 relative overflow-hidden border-b border-gray-200/40">
           <div className="absolute right-[-15%] top-[-30%] w-48 h-48 bg-[#4CAF50] opacity-[0.06] rounded-full blur-2xl pointer-events-none"></div>
           <div className="absolute left-[-10%] bottom-[10%] w-32 h-32 bg-yellow-400 opacity-[0.04] rounded-full blur-xl pointer-events-none"></div>
           
           <div className="relative z-10 flex flex-col">
              <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-green-100 mb-3 text-[20px]">🛍️</div>
              <h1 className="text-[24px] font-black text-gray-900 tracking-tight leading-none mb-1.5">ช้อปออนไลน์</h1>
              <p className="text-[12.5px] font-medium text-gray-500">เลือกซื้อสินค้าแบรนด์จุฬาเฮิร์บง่ายๆ ผ่านช่องทางที่คุณสะดวกได้เลย</p>
           </div>
        </div>

        {/* Action Buttons List */}
        <div className="w-full px-4 flex flex-col gap-3.5 relative z-10 mt-4">
            
            {/* Shopee Button */}
            <a href="#" className="bg-white rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#EE4D2D]/30 hover:shadow-[0_4px_20px_rgba(238,77,45,0.08)] active:scale-[0.98] transition-all w-full group">
               <div className="w-[46px] h-[46px] bg-[#EE4D2D] rounded-[14px] overflow-hidden shrink-0 shadow-sm flex items-center justify-center group-hover:bg-[#d04024] transition-colors relative">
                 <svg className="w-[28px] h-[28px] text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6h-3.5a3.5 3.5 0 1 0-7 0H5c-1.1 0-2 .9-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8c0-1.1-.9-2-2-2zm-7-2a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5.5 11.5c0 1.9-2.3 2.9-4.2 2A2.8 2.8 0 0 1 11.4 16c-.2-.6 0-1.2.6-1.5.6-.2 1.3-.1 1.6.4.2.4.6 1 .6.5 0 1-.3 1-.7 0-1.2-3.8-1-3.8-3.4 0-1.4 1-2.4 2.5-2.7a2.9 2.9 0 0 1 2.8.9c.4.4.5 1 .2 1.5-.2.5-.8.7-1.3.4-.3-.2-.7-.3-1-.3-.6 0-1 .3-1 .6 0 1.2 3.8 1.1 3.8 3.5z"/></svg>
               </div>
               <div className="flex-1 flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 tracking-tight leading-tight mb-0.5">Julaherb_officialshop</span>
                  <span className="text-[11px] text-gray-400 font-medium">สั่งซื้อผ่าน Shopee รับโค้ดลดเพิ่ม</span>
               </div>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-[#EE4D2D] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
            
            {/* Lazada Button */}
            <a href="#" className="bg-white rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#0F136D]/30 hover:shadow-[0_4px_20px_rgba(15,19,109,0.08)] active:scale-[0.98] transition-all w-full group">
               <div className="w-[46px] h-[46px] bg-gradient-to-br from-[#0F136D] to-[#121896] rounded-[14px] shrink-0 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-x-0 bottom-0 top-[40%] bg-gradient-to-r from-[#F53D2D] to-[#FF8A00] transform skew-y-[-15deg] origin-bottom-left scale-110"></div>
                 <span className="relative z-10 font-black text-white text-[15px] italic leading-none drop-shadow-sm pr-1">Laz</span>
               </div>
               <div className="flex-1 flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 tracking-tight leading-tight mb-0.5">Jula's Herb</span>
                  <span className="text-[11px] text-gray-400 font-medium">LazMall การันตีของแท้ 100%</span>
               </div>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-[#0F136D] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* Website Button */}
            <a href="#" className="bg-white rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#4CAF50]/30 hover:shadow-[0_4px_20px_rgba(76,175,80,0.08)] active:scale-[0.98] transition-all w-full group">
               <div className="w-[46px] h-[46px] bg-[#E8F5E9] rounded-[14px] shrink-0 shadow-sm flex items-center justify-center relative border border-green-50 overflow-hidden">
                 <svg className="w-[28px] h-[28px] text-[#4CAF50] group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16.5c-4.14 0-7.5-3.36-7.5-7.5 0-4.14 3.36-7.5 7.5-7.5 4.14 0 7.5 3.36 7.5 7.5 0 4.14-3.36 7.5-7.5 7.5zM15 10c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"/></svg>
               </div>
               <div className="flex-1 flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 tracking-tight leading-tight mb-0.5">www.julaherbshop.com</span>
                  <span className="text-[11px] text-gray-400 font-medium">เว็บไซต์หลัก (ส่งฟรีทั่วไทย)</span>
               </div>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-[#4CAF50] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* LINE OpenChat Button */}
            <a href="#" className="bg-white rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#00C300]/30 hover:shadow-[0_4px_20px_rgba(0,195,0,0.08)] active:scale-[0.98] transition-all w-full group">
               <div className="w-[46px] h-[46px] bg-[#00C300] rounded-[14px] shrink-0 shadow-sm flex items-center justify-center relative">
                 <div className="bg-white w-[24px] h-[24px] rounded-lg rounded-bl-sm flex items-center justify-center text-[#00C300] font-black text-[12px] leading-none pb-0.5 shadow-sm">LINE</div>
                 <div className="absolute top-[8px] right-[8px] w-2 h-2 bg-yellow-400 rounded-full border border-[#00C300]"></div>
               </div>
               <div className="flex-1 flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 tracking-tight leading-snug mb-0.5">ติดต่อตะกร้าจุฬาเฮิร์บ</span>
                  <span className="text-[11px] text-gray-400 font-medium">LINE OpenChat ปรึกษาและสั่งซื้อ</span>
               </div>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-[#00C300] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>

            {/* LINE Admin Button */}
            <a href="#" className="bg-white rounded-[20px] p-3.5 pr-5 flex items-center gap-4 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#00C300]/30 hover:shadow-[0_4px_20px_rgba(0,195,0,0.08)] active:scale-[0.98] transition-all w-full group">
               <div className="w-[46px] h-[46px] bg-[#00C300] rounded-[14px] shrink-0 shadow-sm flex flex-col items-center justify-center">
                 <svg className="w-[28px] h-[28px] text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M21.2 10.4c0-4.6-4.5-8.4-10.1-8.4S1 5.8 1 10.4c0 4.1 3.6 7.6 8.5 8.3.3.1.8.3 1 .9l.2 1.3c0 .2.3.8.9.5.6-.3 3.6-2.1 6.1-4.5 2.2-2 3.5-4.5 3.5-6.5zM7.2 13.5H5.4c-.3 0-.5-.2-.5-.5v-4.8c0-.3.2-.5.5-.5h.9c.3 0 .5.2.5.5v3.8h1.4c.3 0 .5.2.5.5v.5c0 .3-.2.5-.5.5zm2.8 0h-1c-.3 0-.5-.2-.5-.5v-4.8c0-.3.2-.5.5-.5h1c.3 0 .5.2.5.5v4.8c-.1.3-.3.5-.5.5zm4.8 0h-1c-.1 0-.3-.1-.4-.2l-2-2.7v2.4c0 .3-.2.5-.5.5h-1c-.3 0-.5-.2-.5-.5v-4.8c0-.3.2-.5.5-.5h1c.1 0 .3.1.4.2l2 2.7V8.7c0-.3.2-.5.5-.5h1c.3 0 .5.2.5.5v4.8c0 .3-.2.5-.5.5zm3.1-.5v-.5c0-.3-.2-.5-.5-.5h-1.4v-.9h1.4c.3 0 .5-.2.5-.5v-.5c0-.3-.2-.5-.5-.5h-1.4V9.6h1.4c.3 0 .5-.2.5-.5V8.6c0-.3-.2-.5-.5-.5h-2.3c-.3 0-.5.2-.5.5v4.8c0 .3.2.5.5.5h2.3c.3 0 .5-.2.5-.5z"/></svg>
               </div>
               <div className="flex-1 flex flex-col">
                  <span className="text-[14px] font-black text-gray-800 tracking-tight leading-tight mb-0.5">สั่งซื้อที่แอดมิน</span>
                  <span className="text-[11px] text-gray-400 font-medium">พูดคุยสอบถามและสั่งซื้อผ่านทีมงาน</span>
               </div>
               <svg className="w-4 h-4 text-gray-300 group-hover:text-[#00C300] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>

        </div>

        {/* Extra bottom padding */}
        <div className="h-10"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center bg-[#f5f5f5] pb-24 font-sans relative">
      
      {/* 1. Header: Search Bar & Icons (Sticky Shopee Style) */}
      <div className="w-full max-w-[480px] bg-white pt-2.5 pb-2.5 px-3 sticky top-[56px] z-[40] shadow-[0_2px_12px_rgba(0,0,0,0.06)] flex items-center justify-between gap-3 border-b border-gray-100">
         <div className="flex-1 bg-gray-100/80 h-9 rounded-[4px] flex items-center px-3 border border-transparent focus-within:border-[#ee4d2d] focus-within:bg-white transition-all shadow-inner relative group">
            <svg className="w-[18px] h-[18px] text-gray-400 mr-2 shrink-0 group-focus-within:text-[#ee4d2d]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input 
              type="text" 
              placeholder="ค้นหาสกินแคร์ จุฬาเฮิร์บ..." 
              className="bg-transparent border-none outline-none text-[13px] w-full text-gray-700 placeholder:text-gray-400 font-medium font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Shopee camera icon hint */}
            <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
               <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
         </div>
         
         <div className="flex items-center gap-2">
            <button className="relative p-1 text-[#ee4d2d] hover:bg-orange-50 rounded-full transition-colors active:scale-95 flex items-center justify-center">
               <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               <span className="absolute -top-[2px] right-0 bg-[#ee4d2d] text-white text-[9px] font-black min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full border-[1.5px] border-white shadow-sm">2</span>
            </button>
            <button className="p-1 text-[#ee4d2d] hover:bg-orange-50 rounded-full transition-colors active:scale-95 flex items-center justify-center relative">
               <svg className="w-[26px] h-[26px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               <span className="absolute top-[2px] right-[4px] w-2 h-2 bg-[#ee4d2d] border border-white rounded-full"></span>
            </button>
         </div>
      </div>

      {/* 2. Hero Carousel Banners */}
      <div className="w-full max-w-[480px] bg-white cursor-pointer group">
         <div className="w-full aspect-[2.35/1] bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] relative overflow-hidden flex flex-col justify-center px-6">
            <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white opacity-10 rounded-full mix-blend-overlay filter blur-2xl pointer-events-none"></div>
            <div className="absolute left-[-5%] bottom-[-40%] w-48 h-48 bg-yellow-400 opacity-20 rounded-full mix-blend-overlay filter blur-[40px] pointer-events-none"></div>
            
            <div className="relative z-10 w-[70%]">
               <div className="flex gap-1.5 mb-2">
                 <span className="bg-white text-[#ee4d2d] text-[10px] font-black px-1.5 py-0.5 rounded-[2px] shadow-sm uppercase tracking-wide">Jula Mall Exclusive</span>
                 <span className="bg-[#4CAF50] text-white text-[10px] font-black px-1.5 py-0.5 rounded-[2px] shadow-sm uppercase tracking-wide border border-green-400">Official</span>
               </div>
               <h2 className="text-white text-[19px] font-black leading-tight drop-shadow-md tracking-tight mb-2">โค้ดลดเดือด<br/>กลางเดือนช้อปกระจาย!</h2>
               <p className="text-white/95 text-[11.5px] font-medium max-w-[160px] leading-snug drop-shadow-sm">แจกโค้ดลดเพิ่ม 150.- สกินแคร์ทุกชิ้น คุ้มมาก</p>
            </div>
            
            {/* Shopee-style Dot Indicators inside the banner */}
            <div className="absolute bottom-3 right-4 z-20 flex gap-1.5">
                 <div className="w-[14px] h-[5px] bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.1)]"></div>
                 <div className="w-[5px] h-[5px] bg-white/60 rounded-full transition-all"></div>
                 <div className="w-[5px] h-[5px] bg-white/60 rounded-full transition-all"></div>
                 <div className="w-[5px] h-[5px] bg-white/60 rounded-full transition-all"></div>
            </div>
         </div>
      </div>

      {/* 3. Category Icons Grid (Shopee style menu matrix) */}
      <div className="w-full max-w-[480px] bg-white pt-4 pb-2 px-3 shadow-sm mb-2 rounded-b-[12px]">
         <div className="grid grid-cols-5 gap-y-4 gap-x-1.5">
            {[
              { id: 1, label: 'Jula Mall', icon: '🛍️' },
              { id: 2, label: 'ส่งฟรี 0.-', icon: '🚚' },
              { id: 3, label: 'ลด 50%', icon: '🔥' },
              { id: 4, label: 'ลดคุ้มคืนคอยน์', icon: '💰' },
              { id: 5, label: 'ไลฟ์สด', icon: '📹' },
              { id: 6, label: 'Jula Video', icon: '▶️' },
              { id: 7, label: 'เกมลุ้นรางวัล', icon: '🎮' },
              { id: 8, label: 'รีวิวแน่น', icon: '⭐' },
              { id: 9, label: 'สมาชิก VIP', icon: '👑' },
              { id: 10, label: 'ทั้งหมด', icon: '🔰' },
            ].map((item, index) => (
              <Link href="#" key={item.id} className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform">
                 <div className="w-[42px] h-[42px] bg-gray-50 flex items-center justify-center rounded-[14px] text-[20px] border border-gray-100 group-hover:bg-orange-50 transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    {item.icon}
                 </div>
                 <span className="text-[10px] text-gray-700 font-medium tracking-tight text-center leading-tight">{item.label}</span>
              </Link>
            ))}
         </div>
         
         <div className="flex justify-center mt-3 gap-1.5 pb-2">
            <div className="w-3.5 h-1 bg-[#ee4d2d] rounded-full"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
         </div>
      </div>

      {/* 4. Flash Sale Banner Section */}
      <div className="w-full max-w-[480px] bg-white mb-2 pt-3 pb-4 shadow-sm">
         <div className="flex items-center justify-between px-3.5 mb-3">
            <div className="flex items-center gap-2">
               <h2 className="text-[16px] font-black italic text-[#ee4d2d] drop-shadow-sm tracking-tighter">FLASH <span className="text-gray-800">SALE</span></h2>
               <div className="flex items-center gap-1 text-[10.5px] font-black text-white">
                 <div className="bg-black px-1.5 py-[2px] rounded-[3px] shadow-sm">02</div> :
                 <div className="bg-black px-1.5 py-[2px] rounded-[3px] shadow-sm">45</div> :
                 <div className="bg-black px-1.5 py-[2px] rounded-[3px] shadow-sm">12</div>
               </div>
            </div>
            <button className="text-[10.5px] font-bold text-gray-400 flex items-center gap-0.5 active:scale-95">ดูทั้งหมด <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg></button>
         </div>

         <div className="flex overflow-x-auto gap-3 px-3.5 scrollbar-none pb-2">
            {flashSale.map(item => (
               <div key={item.id} className="w-[105px] shrink-0 border border-gray-100 rounded-[8px] p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)] group cursor-pointer active:scale-95 transition-transform overflow-hidden relative">
                  
                  {/* Mall or Discount Tag overlay top left */}
                  <div className="absolute top-0 left-0 bg-[#faca51] text-yellow-950 font-black text-[9px] px-1.5 py-[2px] rounded-br-[4px] shadow-sm z-10 w-auto text-center leading-tight border border-[#cca131]">ลด<br/>45%</div>

                  <div className="w-full aspect-square bg-gray-50 rounded-[4px] overflow-hidden group-hover:opacity-90 transition-opacity">
                     <img src={item.image} alt="product" className="w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  
                  <div className="mt-2 text-center relative px-1">
                     <div className="text-[#ee4d2d] font-black text-[15px] leading-none mb-1.5 flex justify-center items-end gap-0.5">
                       <span className="text-[10px] font-bold">฿</span>{item.price}
                     </div>
                     
                     <div className="w-full bg-[#fcd4d4] rounded-full h-[12px] relative overflow-hidden flex items-center justify-center border border-[#ffa8a8]">
                        <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#ee4d2d] to-[#ff7337] transition-all" style={{ width: `${item.soldProgress}%` }}></div>
                        <span className="relative z-10 text-[8.5px] font-black text-white drop-shadow-md">
                           {item.soldProgress === 100 ? 'ขายแล้ว 100%' : `ขายแล้ว ${item.soldProgress} ชิ้น`}
                        </span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </div>

      {/* 5. Product Feed (Shopee 2-Column Masonry/Grid) */}
      <div className="w-full max-w-[480px] bg-[#f5f5f5] pt-2 px-1.5 pb-4">
         
         <div className="flex items-center justify-center mb-4 mt-2">
            <div className="w-12 h-[1px] bg-red-400"></div>
            <h2 className="text-[14px] font-black text-[#ee4d2d] mx-2 tracking-wide flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" /></svg>
              สินค้าแนะนำประจำวัน
            </h2>
            <div className="w-12 h-[1px] bg-red-400"></div>
         </div>

         <div className="grid grid-cols-2 gap-1.5">
            {products.map((p, i) => (
               <Link href={`/shop/product/${p.id}`} key={p.id} className="bg-white rounded-[4px] shadow-sm hover:shadow-md transition-shadow relative cursor-pointer group active:scale-[0.99] border-b-2 border-transparent hover:border-[#ee4d2d] overflow-hidden flex flex-col">
                  
                  {/* Image Block */}
                  <div className="w-full aspect-square bg-[#f8f9fa] relative overflow-hidden group-hover:opacity-95">
                     <img src={p.image} className="w-full h-full object-cover mix-blend-multiply transition-transform duration-500 group-hover:scale-[1.03]" alt="Product view" />
                     {p.isMall && (
                       <div className="absolute top-0 left-0 bg-[#d0011b] text-white text-[8px] font-black px-1.5 py-[2px] rounded-br-[4px] shadow-sm select-none">Mall</div>
                     )}
                     {p.isDiscount && (
                       <div className="absolute top-0 right-0 bg-[#ffe97a] text-[#ee4d2d] text-[9px] font-black px-1.5 py-[2px] text-center leading-tight shadow-sm opacity-90 w-[32px] border-b border-l border-yellow-200">ลด<br/>20%</div>
                     )}
                  </div>
                  
                  {/* Content Block */}
                  <div className="p-2 flex flex-col justify-between flex-1">
                     <div>
                        <h3 className="text-[12px] font-medium text-gray-800 line-clamp-2 leading-snug tracking-tight mb-1.5">
                          {p.isMall && <span className="bg-[#d0011b] text-white text-[9px] font-bold px-1 py-[1px] rounded-[2px] mr-1 align-middle inline-block leading-none">Mall</span>}
                          {p.title}
                        </h3>
                        {/* Tags area */}
                        {p.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                             {p.tags.map(tag => (
                               <span key={tag} className={`text-[8.5px] px-1 py-[1px] border leading-none shrink-0 line-clamp-1 truncate rounded-sm leading-tight ${tag.includes('ส่งฟรี') ? 'border-green-400 text-green-600 bg-green-50' : 'border-orange-400 text-orange-600 bg-orange-50'}`}>
                                 {tag}
                               </span>
                             ))}
                          </div>
                        )}
                     </div>

                     <div className="mt-1">
                        <div className="flex items-center justify-between">
                           <div className="text-[#ee4d2d] font-bold text-[15px] leading-none flex items-start gap-px">
                             <span className="text-[10px] mt-[1px]">฿</span>{p.price}
                           </div>
                           <div className="text-[9.5px] text-gray-500 font-medium">
                             ขายแล้ว {p.sold} ชิ้น
                           </div>
                        </div>
                        {/* Rating row (optional Shopee detail) */}
                        <div className="flex items-center gap-0.5 mt-1.5">
                           <svg className="w-2.5 h-2.5 text-[#ffc107]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                           <span className="text-[9.5px] text-gray-400">{p.rating} (Reviewers)</span>
                        </div>
                     </div>
                  </div>
                  
                  {/* Subtle Shopee-style "Find Similar" overlay button on hover */}
                  <div className="absolute top-[80px] right-2 w-7 h-7 bg-white/90 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-gray-100">
                     <svg className="w-3.5 h-3.5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  </div>
               </Link>
            ))}
         </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}
