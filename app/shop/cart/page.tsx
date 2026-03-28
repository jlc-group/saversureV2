"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const router = useRouter();
  const [usePoints, setUsePoints] = useState(true);

  // Mocks
  const cartItems = [
    {
      id: 1,
      title: "กันแดดแตงโม หลอดใหญ่ 40ml. DD Watermelon Cream ปกป้องผิวจากแสงแดด",
      variant: "หลอดใหญ่ 40ml",
      price: 199,
      oldPrice: 250,
      qty: 1,
      image: "https://placehold.co/400x400/e8f5e9/2e7d32?text=Sunscreen",
      checked: true
    },
    {
      id: 2,
      title: "เซรั่มจุฬาเฮิร์บ หัวเชื้อหน้าใส 8ml (สูตรผิวขาว)",
      variant: "กล่อง (6 ซอง)",
      price: 195,
      oldPrice: 234,
      qty: 2,
      image: "https://placehold.co/400x400/fff3e0/e65100?text=Serum",
      checked: true
    }
  ];

  const totalGoods = cartItems.reduce((acc, item) => acc + (item.price * item.qty), 0);
  const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] min-h-screen relative font-sans pb-[100px]">
      
      {/* 1. Header */}
      <div className="fixed top-0 w-full max-w-[480px] z-50 bg-white shadow-sm flex items-center justify-between px-3 py-3 border-b border-gray-100">
         <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-[#ee4d2d] w-8 h-8 flex items-center justify-center -ml-1 active:bg-orange-50 rounded-full transition-colors">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-[17.5px] font-black text-gray-800 tracking-tight">รถเข็นช้อปปิ้ง ({totalQty})</h1>
         </div>
         <button className="text-gray-500 text-[13px] font-bold">แก้ไข</button>
      </div>
      <div className="pt-[52px]"></div>
      
      {/* Delivery Free Strip */}
      <div className="bg-[#f0fdf4] text-green-700 px-3 py-2.5 text-[11.5px] border-b border-green-100 flex items-center gap-2 font-medium shadow-sm">
         <svg className="w-[18px] h-[18px] shrink-0 border border-green-600 rounded-full p-[2px] opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
         คุณได้รับสิทธิ์จัดส่งฟรีแล้ว! (เมื่อซื้อขั้นต่ำ ฿299)
      </div>
      
      {/* 2. Shop Block */}
      <div className="mt-2 bg-white shadow-sm">
         <div className="p-3 border-b border-gray-100 flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer bg-[#ee4d2d] border-[#ee4d2d] text-white transition-all">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <div className="flex items-center gap-1.5 font-black text-[13.5px] text-gray-800 uppercase tracking-tight">
               <svg className="w-[14px] h-[14px] text-[#ee4d2d]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
               Jula Herb Official
               <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </div>
         {/* Items */}
         {cartItems.map((item, idx) => (
            <div key={item.id} className="p-3 flex items-start gap-2.5 border-b border-gray-50 last:border-none relative opacity-100 transition-opacity">
               <div className="w-5 h-5 rounded-full border border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer mt-8 bg-[#ee4d2d] border-[#ee4d2d] text-white">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
               </div>
               
               <div className="w-[84px] h-[84px] rounded-[4px] bg-gray-100 shrink-0 border border-gray-200 overflow-hidden relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                  <div className="absolute bottom-0 w-full bg-[#faca51] text-[#ee4d2d] text-[8px] font-black text-center py-[1px] border-t border-yellow-200 uppercase leading-none">ลดราคา</div>
               </div>
               
               <div className="flex-1 flex flex-col justify-between h-[84px] pr-1">
                  <div>
                    <h3 className="text-[12px] text-gray-800 line-clamp-2 leading-snug font-medium">{item.title}</h3>
                    <div className="text-[10.5px] text-gray-500 bg-gray-50 border border-gray-100 inline-block px-1.5 py-[2px] rounded shadow-[0_1px_2px_rgba(0,0,0,0.02)] mt-1.5 whitespace-nowrap truncate max-w-[150px] flex items-center gap-1">
                       {item.variant} <svg className="w-2.5 h-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end pb-0.5">
                     <span className="text-[#ee4d2d] font-black text-[15px] leading-none drop-shadow-sm"><span className="text-[11px] font-bold">฿</span>{item.price}</span>
                     <div className="flex items-center border border-gray-200/80 rounded-[4px] h-[24px] overflow-hidden bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                        <button className="w-[30px] h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 text-[14px]">−</button>
                        <div className="w-[36px] h-full flex items-center justify-center text-[12px] border-x border-gray-200/80 font-bold bg-gray-50">{item.qty}</div>
                        <button className="w-[30px] h-full flex items-center justify-center text-gray-500 hover:bg-gray-100 active:bg-gray-200 text-[14px]">+</button>
                     </div>
                  </div>
               </div>
            </div>
         ))}
      </div>
      
      {/* 3. Discount Logics */}
      <div className="mt-2 bg-white shadow-sm">
         <Link href="#" className="flex items-center justify-between p-3.5 border-b border-gray-100 active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2 text-gray-800 text-[13.5px] font-medium leading-none">
               <svg className="w-[20px] h-[20px] text-[#00bfa5] drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
               โค้ดส่วนลดของจุฬาเฮิร์บ
            </div>
            <div className="flex items-center gap-1 text-gray-400 text-[12px]">
               <span className="text-gray-400 font-medium">เข้าเพื่อเลือกโค้ด</span>
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
         </Link>
         {/* The Innovation: Binding Jula Point system into the shoppiong cart directly! */}
         <div className="p-3.5 flex items-center justify-between pointer-events-auto bg-[#fffdf0]/40">
            <div className="flex items-center gap-2">
               <div className="w-[22px] h-[22px] bg-gradient-to-br from-[#FFD700] to-[#FFA000] text-yellow-950 rounded-[6px] flex items-center justify-center text-[12px] font-black border border-[#FFC107] shadow-sm transform -rotate-6">🪙</div>
               <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-gray-800 leading-tight">ใช้ 140 แต้ม สมาชิก</span>
                  <span className="text-[10px] text-gray-500 mt-0.5">แต้มคงเหลือ: 5 <span className="font-bold text-[#ee4d2d]">-฿14 (ลดเพิ่ม)</span></span>
               </div>
            </div>
            {/* Custom Toggle Slider */}
            <div 
              onClick={() => setUsePoints(!usePoints)}
              className={`w-[44px] h-[24px] rounded-full cursor-pointer relative transition-colors border shadow-inner ${usePoints ? 'bg-[#4CAF50] border-[#388E3C]' : 'bg-gray-200 border-gray-300'}`}
            >
               <div className={`absolute top-[1.5px] w-[19px] h-[19px] bg-white rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.3)] transition-transform duration-300 ${usePoints ? 'left-[21px]' : 'left-[2px]'}`}></div>
            </div>
         </div>
      </div>
      <div className="mt-5 text-center text-gray-300 text-[10px] tracking-widest font-black uppercase">
         - End of cart -
      </div>
      
      {/* 4. Bottom Sticky Cart Action Bar */}
      <div className="fixed bottom-[env(safe-area-inset-bottom)] left-1/2 -translate-x-1/2 w-full max-w-[480px] h-[56px] bg-white flex items-center z-[60] border-t border-gray-200 shadow-[0_-4px_16px_rgba(0,0,0,0.04)] pr-0 pl-3">
         <div className="flex items-center gap-2 shrink-0">
            <div className="w-5 h-5 rounded-full border border-[1.5px] flex items-center justify-center cursor-pointer bg-[#ee4d2d] border-[#ee4d2d] text-white">
               <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-[12.5px] text-gray-600 font-medium tracking-tight">ทั้งหมด</span>
         </div>
         
         <div className="flex-1 flex flex-col items-end justify-center pr-3 pb-0.5">
            <div className="text-[13px] text-gray-800 font-medium flex items-end gap-1">
               รวม 
               <span className="text-[#ee4d2d] font-black text-[18px] leading-none drop-shadow-sm ml-0.5 relative pt-[2px]">
                 <span className="text-[12px] font-bold">฿</span>{usePoints ? totalGoods - 14 : totalGoods}
               </span>
            </div>
            {usePoints && <div className="text-[10px] bg-[#fff0ed] text-[#ee4d2d] px-1.5 py-[1px] rounded-sm font-black tracking-tight border border-[#ffcbbd] mt-1 shadow-sm leading-none">ประหยัดเพิ่ม ฿14 จากแต้ม</div>}
         </div>
         <Link href="/shop/checkout" className="bg-[#ee4d2d] text-white h-full px-6 flex items-center justify-center font-bold text-[14px] active:bg-[#d44327] transition-colors min-w-[115px] shadow-[inset_1px_0_0_rgba(255,255,255,0.2)]">
            ชำระเงิน ({totalQty})
         </Link>
      </div>
    </div>
  );
}
