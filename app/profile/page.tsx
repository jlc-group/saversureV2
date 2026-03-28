"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="w-full flex flex-col items-center pt-2">
      
      {/* 1. Header & Quick Status Strip */}
      <div className="w-full max-w-[480px] bg-gradient-to-b from-[#E8F5E9] to-[#F5F7F6] pt-1 pb-4 px-5 border-b border-gray-200/40 relative overflow-hidden">
        {/* Decorative background circle */}
        <div className="absolute right-[-20%] top-[-20%] w-48 h-48 bg-[#4CAF50] opacity-[0.03] rounded-full blur-2xl"></div>
        
        <div className="flex items-center gap-4 relative z-10">
           {/* Focus Avatar Box */}
           <div className="relative shrink-0">
             <div className="w-[78px] h-[78px] rounded-full bg-white border-[3px] border-[#4CAF50] p-[2px] shadow-sm">
                <img src="https://i.pravatar.cc/150?img=1" alt="avatar" className="w-full h-full object-cover rounded-full" />
             </div>
             <div className="absolute -bottom-1 -right-1 bg-gradient-to-br from-[#FFD700] to-[#FFA000] p-1.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" /></svg>
             </div>
           </div>
           
           <div className="flex-1">
             <h1 className="text-[22px] font-black text-gray-900 leading-tight tracking-tight">ฉัตรธิดา สุขสบาย</h1>
             <div className="flex items-center gap-2 mt-1.5">
               <span className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] text-yellow-950 text-[10.5px] font-black px-2.5 py-[3px] rounded-md border border-white shadow-sm tracking-widest uppercase">Jula VIP</span>
               <span className="text-gray-400 text-[11px] font-bold">สมาชิก ก.พ. 68</span>
             </div>
           </div>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4 pb-[110px] -mt-2">
        
        {/* 2. E-Commerce Domain Hub (Temporarily Hidden) */}
        {false && (
        <div className="w-full px-4 pt-1 z-10 relative">
           <div className="bg-white rounded-[22px] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100">
              <div className="flex items-center justify-between mb-3 border-b border-gray-50 pb-2.5 px-1">
                 <h2 className="text-[14px] font-black text-gray-800">การสั่งซื้อของฉัน</h2>
                 <Link href="/user/purchase?tab=all" className="text-[11.5px] text-gray-400 font-bold flex items-center gap-0.5 hover:text-[#ee4d2d] transition-colors">
                    ดูประวัติทั้งหมด <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                 </Link>
              </div>
              
              <div className="flex justify-between px-1.5 pt-2 pb-1">
                 {[
                   { id: 'to_pay', href: '/user/purchase?tab=to_pay', label: "ที่ต้องชำระ", icon: <svg className="w-[26px] h-[26px] text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>, count: 1 },
                   { id: 'to_ship', href: '/user/purchase?tab=to_ship', label: "ที่ต้องจัดส่ง", icon: <svg className="w-[26px] h-[26px] text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, count: 0 },
                   { id: 'shipping', href: '/user/purchase?tab=shipping', label: "กำลังจัดส่ง", icon: <svg className="w-[26px] h-[26px] text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>, count: 2 },
                   { id: 'review', href: '/user/purchase?tab=review', label: "ให้คะแนน", icon: <svg className="w-[26px] h-[26px] text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>, count: 0 },
                 ].map(item => (
                   <Link href={item.href} key={item.id} className="flex flex-col items-center gap-2 relative group flex-1">
                      <div className="relative">
                         <div className="w-[50px] h-[50px] rounded-full bg-gray-50 border border-gray-100/80 flex items-center justify-center group-active:scale-95 group-active:bg-[#E8F5E9] transition-all">
                            {item.icon}
                         </div>
                         {item.count > 0 && (
                           <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-[2px] border-white shadow-sm">
                             {item.count}
                           </div>
                         )}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600">{item.label}</span>
                   </Link>
                 ))}
              </div>
           </div>
        </div>
        )}

        {/* 3. Loyalty & Gamification Activity Hub */}
        <div className="w-full px-4">
           <div className="bg-white rounded-[22px] p-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-gray-100">
              <h2 className="text-[14px] font-black text-gray-800 mb-3 border-b border-gray-50 pb-2.5 px-1">กิจกรรมสะสมแต้ม</h2>
              
              <div className="grid grid-cols-3 gap-2 pt-2 pb-1">
                 {[
                   { id: 'earn', label: "สะสมแต้ม", color: "text-[#4CAF50]", bg: "bg-green-50", link: "/history?tab=earn", icon: <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg> },
                   { id: 'redeem', label: "แลกแต้ม", color: "text-orange-500", bg: "bg-orange-50", link: "/history?tab=redeem", icon: <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
                   { id: 'lucky', label: "ลุ้นโชค", color: "text-blue-500", bg: "bg-blue-50", link: "/history?tab=lucky", icon: <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" /></svg> },
                 ].map(item => (
                   <Link href={item.link} key={item.id} className="flex flex-col items-center gap-1.5 group active:scale-95 transition-transform">
                      <div className={`w-[52px] h-[52px] rounded-[16px] ${item.bg} ${item.color} flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.7)] border border-black/5`}>
                         {item.icon}
                      </div>
                      <span className="text-[10px] font-bold text-gray-600 tracking-tight">{item.label}</span>
                   </Link>
                 ))}
              </div>
           </div>
        </div>

        {/* 4. Gamification Missions Hub */}
        <div className="w-full px-4">
           <div className="bg-gradient-to-br from-[#FFD54F] to-[#FFA000] rounded-[22px] p-[2px] shadow-[0_4px_16px_rgba(255,193,7,0.3)]">
              <div className="bg-white rounded-[20px] p-4 py-5 h-full relative overflow-hidden flex items-center justify-between">
                 {/* Internal Decor */}
                 <div className="absolute -right-4 -bottom-4 text-[85px] opacity-10 pointer-events-none drop-shadow-sm select-none">🎮</div>
                 <div className="absolute right-12 top-2 text-[20px] opacity-30 animate-pulse delay-75 pointer-events-none select-none">⭐</div>
                 
                 <div className="relative z-10 w-[68%]">
                   <h2 className="text-[14px] font-black text-gray-800 flex items-center gap-2">
                      ภารกิจรายวัน <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-[4px] tracking-wide uppercase shadow-sm">Hot</span>
                   </h2>
                   <p className="text-[10.5px] text-gray-500 mt-1 font-medium leading-relaxed pr-2">อ่านบทความสาระสุขภาพวันนี้ให้ครบ รับทันที 20 แต้ม! 🔥</p>
                   
                   <div className="mt-3 bg-gray-100 rounded-full h-1.5 w-[90%] overflow-hidden border border-gray-200/50 block">
                     <div className="bg-gradient-to-r from-[#FFC107] to-[#FF8F00] h-full rounded-full w-[40%] shadow-[inset_0_-1px_2px_rgba(0,0,0,0.1)]"></div>
                   </div>
                   <div className="text-[9.5px] text-gray-400 mt-1 font-bold">ความคืบหน้า 2/5</div>
                 </div>
                 
                 <div className="relative z-10 w-[30%] flex justify-end">
                   <Link href="/missions" className="bg-gradient-to-b from-[#FFC107] to-[#FF9800] text-yellow-950 font-black text-[12px] px-4 py-2.5 rounded-2xl shadow-[0_4px_12px_rgba(255,152,0,0.4)] border border-yellow-300 active:scale-95 transition-transform flex flex-col items-center leading-tight">
                      <span className="text-[14px]">GO!</span>
                   </Link>
                 </div>
              </div>
           </div>
        </div>

        {/* 5. Utility & Settings List */}
        <div className="w-full px-4 mt-2">
           <h2 className="text-[11.5px] font-black text-gray-400 tracking-[0.15em] uppercase px-3 mb-2.5">ตั้งค่าและการช่วยเหลือ</h2>
           
           <div className="bg-white rounded-[20px] shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100 divide-y divide-gray-50 overflow-hidden">
              {[
                { id: 'address', label: "ที่อยู่สำหรับจัดส่งของรางวัล", icon: "📍", href: "/profile/address" },
                // { id: 'payment', label: "ช่องทางการชำระเงิน", icon: "💳", href: "/profile/payment" }, // Temporarily hidden (E-commerce disabled)
                { id: 'settings', label: "การตั้งค่าบัญชี", icon: "⚙️", href: "/profile/settings" },
                { id: 'faq', label: "คำถามที่พบบ่อย (FAQ)", icon: "💬", href: "/profile/faq" },
              ].map(item => (
                <Link href={item.href} key={item.id} className="flex items-center justify-between p-4 px-5 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                   <div className="flex items-center gap-3.5">
                      <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-[16px]">{item.icon}</div>
                      <span className="text-[13.5px] font-bold text-gray-700">{item.label}</span>
                   </div>
                   <svg className="w-[14px] h-[14px] text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              ))}
           </div>
        </div>

        {/* 6. Logout Button */}
        <div className="w-full px-4 mt-2">
           <button className="w-full py-3.5 bg-white hover:bg-red-50 text-red-500 font-black text-[14px] rounded-[18px] transition-colors shadow-sm border border-red-100 flex items-center justify-center gap-2">
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              ออกจากระบบ
           </button>
           <div className="text-center mt-4">
             <span className="text-[10px] text-gray-300 font-bold tracking-widest uppercase">Saversure App v2.0.1</span>
           </div>
        </div>

      </div>

    </div>
  );
}
