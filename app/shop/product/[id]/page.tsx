"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] min-h-screen relative font-sans">
      
      {/* 1. Floating / Sticky Top Transparent Header */}
      <div className={`fixed top-0 w-full max-w-[480px] z-50 transition-colors duration-300 flex items-center justify-between px-3 py-3 ${isScrolled ? 'bg-white shadow-sm' : 'bg-transparent'}`}>
         {/* Back Button */}
         <button onClick={() => router.back()} className={`w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors ${isScrolled ? 'bg-transparent text-gray-600' : 'bg-black/40 text-white backdrop-blur-sm'}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         
         <div className="flex gap-2">
           {/* Share Button */}
           <button className={`w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors ${isScrolled ? 'bg-transparent text-gray-600' : 'bg-black/40 text-white backdrop-blur-sm'}`}>
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
           </button>
           {/* Cart Button */}
           <button onClick={() => router.push('/shop/cart')} className={`relative w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors ${isScrolled ? 'bg-transparent text-gray-600' : 'bg-black/40 text-white backdrop-blur-sm'}`}>
              <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <span className="absolute -top-1 -right-1 bg-[#ee4d2d] text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-[1.5px] border-white shadow-sm">2</span>
           </button>
           {/* More Options */}
           <button className={`w-[34px] h-[34px] flex items-center justify-center rounded-full transition-colors ${isScrolled ? 'bg-transparent text-gray-600' : 'bg-black/40 text-white backdrop-blur-sm'}`}>
              <svg className="w-[20px] h-[20px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
           </button>
         </div>
      </div>

      {/* 2. Primary Image Aspect Square 1:1 */}
      <div className="w-full aspect-square bg-[#e8f5e9] relative">
         <img src="https://placehold.co/800x800/e8f5e9/2e7d32?text=Product+Image" alt="Skin Care" className="w-full h-full object-cover mix-blend-multiply flex-shrink-0" />
         {/* Carousel Image Indicator */}
         <div className="absolute bottom-4 right-4 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm">1/5</div>
      </div>

      {/* 3. Product Info Block (Price & Title) */}
      <div className="bg-white px-3.5 pt-3 pb-3 mb-2 shadow-sm relative">
         {/* Price Row */}
         <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-end gap-2">
               <div className="text-[#ee4d2d] font-black text-[22px] leading-none flex items-start gap-0.5">
                 <span className="text-[12px] mt-1 font-bold">฿</span>199
               </div>
               <div className="text-gray-400 text-[11px] font-medium line-through mb-0.5">฿250</div>
               <div className="bg-[#faca51] text-[#ee4d2d] text-[9px] font-black px-1 py-[1.5px] rounded-sm mb-0.5">ลด 20%</div>
            </div>
            {/* Share / Heart icons */}
            <div className="flex items-center gap-4 text-gray-400">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
         </div>

         {/* Product Title Row */}
         <h1 className="text-[14.5px] font-medium text-gray-800 leading-snug line-clamp-2">
            <span className="bg-[#d0011b] text-white text-[9.5px] font-bold px-1 py-0.5 rounded-[2px] mr-1.5 align-middle inline-block leading-none shadow-sm">Mall</span>
            กันแดดแตงโม ดีดีครีมกันแดดแตงโม หลอดใหญ่ 40ml. DD Watermelon Cream ปกป้องผิวจากแสงแดด หน้าเนียนใส
         </h1>

         {/* Rating & Sold Row */}
         <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-1 text-[#ffc107] text-[10px]">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-[#ee4d2d] font-bold text-[12.5px] pt-0.5 mt-px">4.9</span>
               </div>
               <div className="w-px h-3 bg-gray-200"></div>
               <span className="text-gray-500 text-[11px]">ขายแล้ว 22.4 พัน ชิ้น</span>
            </div>
         </div>
      </div>

      {/* 4. Voucher & Promotions Strip */}
      <div className="bg-white px-3.5 py-3 mb-2 shadow-sm flex items-start gap-4 cursor-pointer active:bg-gray-50">
         <span className="text-gray-500 text-[11.5px] shrink-0 mt-0.5">โค้ดส่วนลดร้านค้า</span>
         <div className="flex-1 flex gap-1 overflow-hidden">
            <div className="bg-[#fff0ed] text-[#ee4d2d] border border-[#ffcbbd] text-[10px] px-1.5 py-[1px] font-medium whitespace-nowrap">ลด 10%</div>
            <div className="bg-[#f0fdf4] text-green-600 border border-green-200 text-[10px] px-1.5 py-[1px] font-medium whitespace-nowrap">จัดส่งฟรีคูปอง</div>
         </div>
         <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
      </div>

      {/* 5. Shipping Information */}
      <div className="bg-white px-3.5 py-3 mb-2 shadow-sm flex items-start gap-4">
         <span className="text-gray-500 text-[11.5px] shrink-0 mt-0.5 w-[70px]">การจัดส่ง</span>
         <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 text-[12.5px] font-medium text-gray-800">
               <svg className="w-[18px] h-[18px] text-[#00bfa5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
               จัดส่งฟรี
            </div>
            <div className="text-[11px] text-gray-500 pl-6 space-y-0.5">
               <div>ค่าจัดส่ง: ฿0 เมื่อซื้อครบ ฿299</div>
               <div className="flex justify-between items-center text-gray-800 font-medium">
                  รับสินค้าภายใน 1-2 วัน
                  <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
               </div>
            </div>
         </div>
      </div>

      {/* 6. Shop Profile Header */}
      <div className="bg-white p-3 mb-2 shadow-sm flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full border border-gray-100 overflow-hidden relative">
               <img src="https://placehold.co/100x100/ffffff/4caf50?text=Jula" alt="Jula Shop" className="w-full h-full object-cover" />
               <div className="absolute bottom-0 left-0 right-0 bg-[#d0011b] text-white text-[7px] font-black text-center leading-tight py-[1.5px]">Mall</div>
            </div>
            <div>
               <h3 className="font-bold text-[13px] text-gray-800 mb-0.5 flex items-center gap-1">Jula's Herb Official</h3>
               <div className="text-gray-400 text-[10px] flex items-center gap-2">
                  <span>ออนไลน์เมื่อ 2 นาทีที่ผ่านมา</span>
                  <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
                  <span>จ. กรุงเทพมหานคร</span>
               </div>
            </div>
         </div>
         <button className="text-[#ee4d2d] border border-[#ee4d2d] rounded-sm text-[11px] px-3 py-1 font-medium hover:bg-orange-50 active:bg-orange-100 transition-colors">
            ดูร้านค้า
         </button>
      </div>

      {/* 7. Product Details Content block */}
      <div className="bg-white p-3.5 shadow-sm min-h-[400px]">
         <h2 className="text-[12px] font-bold text-gray-800 uppercase tracking-widest bg-gray-100/50 inline-block px-2 py-1 mb-3">รายละเอียดสินค้า</h2>
         
         <div className="text-[12.5px] text-gray-700 leading-relaxed font-sans mt-2 space-y-4">
            <p><strong>🍉 ดีดีครีมกันแดดแตงโม ☀️ (DD Watermelon Cream) SPF50 PA+++</strong></p>
            <p>ครีมกันแดดเนื้อบางเบา แตกตัวเป็นน้ำ ไม่เหนียวเหนอะหนะ ช่วยปกป้องผิวจากแสงแดด UVA และ UVB พร้อมบำรุงผิวให้สว่างกระจ่างใส เปล่งปลั่ง มีออร่า ทันทีที่ทา ด้วยสารสกัดจากแตงโมและกลูต้าไธโอนเข้มข้น</p>
            <ul className="list-disc pl-5 space-y-1">
               <li>ปรับผิวให้ขาวเนียนใสทันที 1-2 ระดับ</li>
               <li>ปกป้องแสงแดดสูงสุด SPF50 PA+++</li>
               <li>เนื้อครีมแตกตัวเป็นน้ำ เกลี่ยง่าย ซึมซาบไว ไม่เป็นคราบ</li>
               <li>เหมาะกับทุกสภาพผิว ไม่ทำให้หน้าลอย</li>
            </ul>
            <p><strong>วิธีใช้:</strong> เกลี่ยเนื้อครีมให้ทั่วใบหน้า ก่อนออกแดด 15 นาที หรือใช้ทาเป็นรองพื้นก่อนแต่งหน้าได้</p>
            <div className="bg-[#f8f9fa] w-full aspect-[3/4] rounded-sm mt-4 overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400 font-bold">
               [Product Infographic Banner 1]
            </div>
            <div className="bg-[#f8f9fa] w-full aspect-[3/4] rounded-sm mt-2 overflow-hidden border border-gray-100 flex items-center justify-center text-gray-400 font-bold">
               [Product Infographic Banner 2]
            </div>
         </div>
      </div>

      {/* 8. Fixed Bottom Action Bar (Shopee Cart Flow) */}
      <div className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[52px] bg-white flex z-[60] border-t border-gray-200">
         {/* Icon Actions */}
         <div className="flex w-[35%] bg-white">
            <button className="flex-1 flex flex-col items-center justify-center gap-0.5 border-r border-gray-100 active:bg-gray-50 text-[#00bfa5] group">
               <svg className="w-[18px] h-[18px] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
               <span className="text-[9px]">แชทเลย</span>
            </button>
            <button onClick={() => router.push('/shop/cart')} className="flex-1 flex flex-col items-center justify-center gap-0.5 hover:bg-orange-50 active:bg-orange-100 text-gray-600 border-r border-gray-100 group transition-colors">
               <svg className="w-[18px] h-[18px] group-hover:scale-110 group-hover:text-[#ee4d2d] transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9" /></svg>
               <span className="text-[9px] text-[#ee4d2d]">เพิ่มลงรถเข็น</span>
            </button>
         </div>
         {/* Buy Button */}
         <button onClick={() => router.push('/shop/checkout')} className="flex-1 bg-[#ee4d2d] text-white font-medium text-[13px] flex items-center justify-center active:bg-[#d44327] transition-colors">
            ซื้อสินค้า
         </button>
      </div>
      
    </div>
  );
}
