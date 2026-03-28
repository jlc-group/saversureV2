"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("julaherb");
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const router = useRouter();

  // 1. Banner state
  const [currentSlide, setCurrentSlide] = useState(0);
  const banners = [
    { id: 1, img: "https://shop.julasherb.in.th/wp-content/uploads/2023/08/AW-banner-web.jpg" },
    { id: 2, bg: "bg-gradient-to-r from-green-500 to-green-700", text: "แลกแต้มสุดคุ้ม วันนี้เท่านั้น!" },
    { id: 3, bg: "bg-gradient-to-r from-yellow-400 to-orange-500", text: "ภารกิจพิเศษ รับ 500 แต้ม" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const julaherbItems = [
    { id: 1, name: "เซรั่มมะรุม ลดรอยดำ 8ml", price: "49", points: "168", oldPoints: "250", badge: "ยอดขายอันดับ 1<br/>ลดรอยไวใน 7 วัน", bg: "#E8F5E9", emoji: "🌿", watermark1: "MORINGA", watermark2: "SERUM", topBrand: "JULA'S HERB" },
    { id: 3, name: "ยาสีฟันเจเด้นท์ สูตรเสียวฟัน", price: "120", points: "240", oldPoints: null, badge: "เจเด้นท์ 3X เอ็กซ์ตร้า แคร์<br/>ทูธเพสท์ 70 กรัม", bg: "#F0ACC9", emoji: "🦷", watermark1: "JDENT 3X", watermark2: "EXTRA CARE", topBrand: "JULA'S HERB" },
    { id: 4, name: "วอเตอร์เมลอน แอลอีดี คุชชั่น", price: "390", points: "450", oldPoints: "780", badge: "ดีดี้ วอเตอร์เมลอน แมทท์<br/>เอสพีเอฟ 50", bg: "#F0E68C", emoji: "🍉", watermark1: "WATERMELON", watermark2: "EE CUSHION", topBrand: "JULA'S HERB" },
  ];

  const premiumItems = [
    { id: 11, name: "หมอนอิงแตงโม ลิมิเต็ด", price: "490", points: "800", oldPoints: "1200", badge: "หมอนอิงเนื้อนุ่ม<br/>ขนาด 45 ซม.", bg: "#FCE4EC", emoji: "🍉", watermark1: "LIMITED", watermark2: "EDITION", topBrand: "JULA PREMIUM" },
    { id: 12, name: "ร่มกันยูวี Marigold", price: "350", points: "500", oldPoints: null, badge: "พกพาง่าย<br/>กันแดด 100%", bg: "#FFF9C4", emoji: "🌂", watermark1: "UV", watermark2: "PROTECTION", topBrand: "JULA LIFESTYLE" },
    { id: 13, name: "ผ้าห่มซุกตัว Jula's Herb", price: "890", points: "1500", oldPoints: null, badge: "ผ้าฟลีซนุ่มพิเศษ<br/>อุ่นสบาย", bg: "#E3F2FD", emoji: "🛏️", watermark1: "FLEECE", watermark2: "BLANKET", topBrand: "VIP EXCLUSIVE" },
  ];

  const lifestyleItems = [
    { id: 2, name: "Shopee E-Coupon 50.-", price: "50", points: "500", oldPoints: null, badge: "คูปองนำไปใช้ลดทันที<br/>บนแอป Shopee", bg: "#FFCC80", emoji: "🛍️", watermark1: "SHOPEE", watermark2: "E-COUPON", topBrand: "DIGITAL VOUCHER" },
    { id: 22, name: "Lotus's Gift Card 100.-", price: "100", points: "1000", oldPoints: "1200", badge: "ใช้แทนเงินสด<br/>คุ้มสุดๆ", bg: "#B2EBF2", emoji: "🛒", watermark1: "LOTUS'S", watermark2: "GIFTCARD", topBrand: "PHYSICAL CARD" },
    { id: 23, name: "ตั๋วหนัง Major Cineplex", price: "250", points: "2500", oldPoints: null, badge: "ดูหนังฟรี 1 ที่นั่ง<br/>ที่นั่งปกติทุกสาขา", bg: "#E1BEE7", emoji: "🍿", watermark1: "MAJOR", watermark2: "CINEPLEX", topBrand: "DIGITAL CODE" },
  ];

  const getActiveItems = () => {
    if (activeTab === 'premium') return premiumItems;
    if (activeTab === 'lifestyle') return lifestyleItems;
    return julaherbItems;
  };

  return (
    <div className="w-full flex flex-col items-center pb-8 pt-1">
      
      {/* 1. Hero Carousel */}
      <div className="w-full relative bg-white pb-3 pt-2">
         <div className="px-3 w-full max-w-[480px] mx-auto overflow-hidden rounded-xl relative">
            <div className="flex transition-transform duration-500 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)`}}>
               {banners.map((b, i) => (
                  <div key={i} className="min-w-full h-[140px] rounded-xl overflow-hidden relative shadow-sm border border-gray-100">
                     {b.img ? (
                        <img src={b.img} className="w-full h-full object-cover" alt="banner"/>
                     ) : (
                        <div className={`w-full h-full ${b.bg} flex items-center justify-center`}>
                           <h2 className="text-white text-xl font-bold drop-shadow-md">{b.text}</h2>
                        </div>
                     )}
                  </div>
               ))}
            </div>
            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
               {banners.map((_, i) => (
                  <div key={i} className={`h-1.5 rounded-full transition-all ${currentSlide === i ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}></div>
               ))}
            </div>
         </div>
      </div>

      {/* Section Title & Tabs */}
      <div className="px-4 mt-3 w-full max-w-[480px]">
        <h2 className="text-[18px] font-black text-gray-900 mb-2">แลกสิทธิพิเศษสำหรับคุณ</h2>
        
        <div className="flex overflow-x-auto scrollbar-none gap-3 pb-1 relative w-full mb-3 pt-1 px-0.5">
          {[
            { id: 'julaherb', label: 'สินค้าจุฬาเฮิร์บ 🌿' },
            { id: 'premium', label: 'พรีเมียมกิฟท์ 🎁' },
            { id: 'lifestyle', label: 'ไลฟ์สไตล์ & คูปอง 🛒' },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap px-4 py-2 text-[13.5px] rounded-full transition-all border ${activeTab === tab.id ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-[0_2px_8px_rgba(76,175,80,0.3)] font-bold' : 'bg-white text-gray-600 border-gray-200 font-medium active:bg-gray-50 hover:bg-green-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Point Filters (Only show for Julaherb to keep UI clean, or show everywhere if wanted) */}
        {activeTab === 'julaherb' && (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1.5 pt-0.5 mb-1 bg-white animate-fade-in">
            {['ทั้งหมด', '< 100 แต้ม', '100 - 200 แต้ม', '200 - 300 แต้ม', '> 300 แต้ม'].map((f, i) => (
               <button 
                 key={i} 
                 onClick={() => setActiveFilter(f)}
                 className={`shrink-0 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold transition-all border ${activeFilter === f ? 'bg-green-50 text-[#2E7D32] border-green-200 shadow-sm' : 'bg-white text-gray-500 border-gray-200 active:bg-gray-50'}`}
               >
                  {f}
               </button>
            ))}
          </div>
        )}
      </div>

      {/* Dynamic Reward Cards List */}
      <div className="px-4 space-y-7 mt-2 w-full max-w-[480px] pb-10">
        {getActiveItems().map((item, idx) => (
          <div 
            onClick={() => router.push(`/reward/${item.id}`)} 
            key={item.id} 
            className={`bg-white rounded-[16px] border border-gray-100 flex overflow-visible shadow-[0_12px_40px_rgba(0,0,0,0.04)] h-[210px] relative z-0 ${idx > 0 ? "mt-8" : "mt-3"} cursor-pointer active:scale-[0.98] transition-all animate-fade-in group`}
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Left Side (Image Area) */}
            <div className="w-[45%] relative rounded-l-[16px] overflow-hidden flex flex-col justify-between">
              {/* Premium abstract background: soft dynamic color washed out */}
              <div className="absolute inset-0 opacity-40 mix-blend-multiply transition-opacity group-hover:opacity-50" style={{ backgroundColor: item.bg }}></div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-transparent"></div>
              
              <div className="relative z-10 p-3 flex flex-col items-start h-full">
                {/* Sleek Top Label */}
                <div className="text-gray-800 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[8px] uppercase tracking-widest font-black shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-white/60">
                   {item.topBrand || "JULA'S HERB"}
                </div>
                {/* Emoji / Product (Centered) */}
                <div className="flex-1 w-full flex items-center justify-center -mt-3">
                  <div className="text-[75px] drop-shadow-[0_15px_15px_rgba(0,0,0,0.15)] group-hover:scale-110 transition-transform duration-500 ease-out filter saturate-[1.15]">{item.emoji}</div>
                </div>
              </div>
              <div className="absolute bottom-2.5 w-full text-center text-[6px] text-gray-500 font-bold tracking-widest uppercase opacity-60">
                 Terms & Conditions Apply
              </div>
            </div>

            {/* Pill Badge Removed for cleaner premium look */}

            {/* Right Side (Text Area) */}
            <div className="w-[55%] bg-white p-3.5 flex flex-col justify-between rounded-r-[16px] relative z-10">
              <div className="flex flex-col w-full">
                
                {/* Clean Product Name */}
                <div className="text-gray-900 text-[14px] font-black leading-[1.3] tracking-tight line-clamp-2 pr-1">
                  {item.name}
                </div>
                
                {/* Subtle Value Tag */}
                <div className="flex items-center gap-2 mt-2 opacity-90">
                   <div className="bg-gray-50 border border-gray-100 text-gray-500 text-[9px] font-bold px-1.5 py-0.5 rounded leading-none flex items-center gap-1">
                      <span className="line-through decoration-gray-400">฿{item.price}</span>
                   </div>
                   <div className="text-[10px] text-gray-300">•</div>
                   <div className="text-gray-500 text-[10px] font-semibold tracking-wide">จัดส่งฟรี</div>
                </div>

                {/* Point Box - Premium Style (Brand Colors) */}
                {item.oldPoints && Number(item.oldPoints) > Number(item.points) ? (
                  <div className="mt-4 w-full flex flex-col group-hover:-translate-y-0.5 transition-transform duration-300">
                     <div className="bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white text-[9px] font-bold px-2.5 py-1 rounded-t-[8px] tracking-widest shadow-sm w-max uppercase flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        Special Offer
                     </div>
                     <div className="bg-gradient-to-br from-[#FAFAFA] to-white border border-[#ff416c]/20 border-t-0 rounded-b-[8px] rounded-tr-[8px] w-full py-2 px-3 flex flex-col shadow-sm -mt-[1px]">
                        <div className="text-[10px] text-gray-400 font-semibold flex items-center gap-1.5 leading-none mb-1">
                           ปกติ <span className="line-through decoration-red-300">{item.oldPoints}</span>
                        </div>
                        <div className="text-[#ff416c] font-black leading-none text-[22px] flex items-baseline gap-1 mt-0.5 tracking-tighter drop-shadow-sm">
                           {item.points} <span className="text-[9.5px] font-bold text-gray-400 tracking-widest uppercase ml-0.5">Points</span>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="mt-4 w-full flex flex-col border-t border-gray-100 pt-3 relative">
                     <div className="text-gray-400 text-[9.5px] font-bold mb-1.5 tracking-widest uppercase">Redeem For</div>
                     <div className="text-[#8ac43f] font-black leading-none text-[24px] flex items-baseline gap-1.5 tracking-tighter drop-shadow-sm">
                        {item.points} <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Points</span>
                     </div>
                  </div>
                )}
              </div>

              {/* Minimalist Brand Button */}
              <div className="w-full mt-auto pt-3">
                <button className="bg-gradient-to-r from-[#8ac43f] to-[#7ab036] hover:from-[#7ab036] hover:to-[#6b9e2f] text-white rounded-[10px] py-[9px] w-full text-[13px] font-bold shadow-[0_4px_12px_rgba(138,196,63,0.3)] active:scale-[0.98] transition-all tracking-wide flex items-center justify-center gap-2">
                  แลกรับสิทธิ์ <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-none {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
      `}} />
    </div>
  );
}
