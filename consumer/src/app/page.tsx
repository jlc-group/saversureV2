"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";

function JulaHerbHome() {
  const [activeTab, setActiveTab] = useState("julaherb");

  return (
    <>
      <div className="bg-[#8ac43f] text-white px-4 py-2 flex items-center justify-between text-sm sticky top-14 z-40 shadow-sm">
        <div className="font-bold">ฉัตรธิดา Points</div>
        <div className="flex items-center gap-2 font-bold bg-[#7ab036] px-3 py-1 rounded-full text-xs box-border border-white/20 border">
          <span className="flex items-center gap-1">แต้ม 125 <span className="text-yellow-300 text-sm">🪙</span></span>
          <span className="text-white/50 px-1">|</span>
          <span className="flex items-center gap-1">เพชร 0 <span className="text-cyan-200 text-sm">💎</span></span>
        </div>
      </div>

      <div className="bg-[#f8f9fa] min-h-screen pb-24">
        <div className="p-4 pt-5">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x">
            <div className="w-[88vw] shrink-0 snap-center rounded-[16px] bg-gradient-to-br from-[#8ac43f] to-[#71a62d] text-white p-5 relative overflow-hidden h-36 flex items-center box-border aspect-[21/9] shadow-md">
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
              <div className="relative z-10 w-full">
                <h2 className="text-3xl font-bold mb-2 drop-shadow-md tracking-wide">คำถามที่พบบ่อย</h2>
                <p className="text-[11px] opacity-90 drop-shadow-sm flex flex-wrap gap-1.5 font-medium">
                  <span className="bg-black/10 px-2 py-0.5 rounded-full">การสแกนสะสมแต้ม</span>
                  <span className="bg-black/10 px-2 py-0.5 rounded-full">การแลกของรางวัล</span>
                  <span className="bg-black/10 px-2 py-0.5 rounded-full">วิธีเช็คของแท้</span>
                </p>
              </div>
              <div className="absolute top-3 right-4 text-white/50 text-xs font-bold uppercase tracking-widest">JULA'S HERB</div>
            </div>
            
            <div className="w-[88vw] shrink-0 snap-center rounded-[16px] bg-gradient-to-br from-[#1a9444] to-[#15783a] text-white p-5 relative overflow-hidden h-36 flex items-center box-border aspect-[21/9] shadow-md">
               <div className="relative z-10 w-full">
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2.5 py-1 rounded-full inline-block mb-2 shadow-sm">กิจกรรม</div>
                <h2 className="text-2xl font-bold mb-1 shadow-black">JDent Challenge</h2>
                <p className="text-xs opacity-90 font-medium">ป้ายยาดี มีรางวัล เพียบ!</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-1.5 mt-4">
            <div className="w-5 h-1.5 bg-[#8ac43f] rounded-full transition-all"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full transition-all"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full transition-all"></div>
            <div className="w-1.5 h-1.5 bg-gray-300 rounded-full transition-all"></div>
          </div>
        </div>

        <div className="px-4 mt-1">
          <h2 className="text-[22px] font-bold text-gray-900 mb-4 tracking-tight">แลกสิทธิพิเศษสำหรับคุณ</h2>
          
          <div className="flex overflow-x-auto scrollbar-hide gap-6 border-b-2 border-gray-100 pb-0.5 mb-5 relative">
            {[
              { id: 'julaherb', label: 'สินค้าจุฬาเฮิร์บ' },
              { id: 'premium', label: 'สินค้าพรีเมียม' },
              { id: 'lifestyle', label: 'ไลฟ์สไตล์' },
              { id: 'donate', label: 'ร่วมบริจาค' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap pb-2.5 text-[15px] transition-all relative ${activeTab === tab.id ? 'text-[#8ac43f] font-bold' : 'text-gray-400 font-medium hover:text-gray-600'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute -bottom-[2px] left-0 right-0 h-[3px] bg-[#8ac43f] rounded-t-full shadow-[0_-1px_4px_rgba(138,196,63,0.3)]"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-4">
          <div className="bg-white rounded-[16px] border border-gray-100 flex overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] h-44 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="w-[45%] bg-[#fff0f4] relative flex flex-col items-center justify-center p-3 border-r border-gray-50">
               <div className="absolute top-2.5 text-pink-300 text-[9px] uppercase font-bold tracking-[0.2em]">Jula's Herb</div>
               <div className="text-7xl my-auto drop-shadow-xl transform -rotate-6 filter saturate-150">🦷</div>
               <div className="mt-auto bg-white/95 px-2.5 py-1 rounded-full shadow-sm text-[9px] font-bold w-[95%] text-center truncate text-gray-700">เจเด้นท์ 3X เอ็กซ์ตร้า 70 กรัม</div>
            </div>
            <div className="w-[55%] p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[#8ac43f] font-black text-xl leading-tight tracking-wide">แลกรับฟรี !</div>
                <div className="text-gray-800 text-sm font-bold leading-snug mt-1">ยาสีฟันเจเด้นท์ สูตรเสียวฟัน</div>
                <div className="text-[#8ac43f] font-bold text-2xl mt-1.5 flex items-baseline gap-1">120 <span className="text-sm">บาท</span></div>
                <div className="text-[10px] text-gray-500 mt-2 leading-tight bg-gray-50 p-1.5 rounded-md">
                  <span className="font-bold text-gray-700">พิเศษ! ลดแลกแต้มสินค้า</span><br/>
                  เพียง <span className="text-[#8ac43f] font-bold text-[11px]">168</span> แต้ม <span className="text-gray-400 text-[9px]">(ปกติ <span className="line-through">240</span> แต้ม)</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[9px] font-bold text-gray-400">จัดส่งฟรีทั่วประเทศ</span>
                <button className="bg-[#8ac43f] hover:bg-[#7ab036] text-white rounded-lg py-1.5 px-3 text-xs font-bold shadow-[0_4px_10px_rgba(138,196,63,0.3)] active:scale-95 transition-all flex items-center gap-1">
                  ใช้ 168 🪙
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[16px] border border-gray-100 flex overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.03)] h-44 hover:shadow-[0_6px_16px_rgba(0,0,0,0.06)] transition-shadow">
            <div className="w-[45%] bg-[#fff0f0] relative flex flex-col items-center justify-center p-3 border-r border-gray-50">
               <div className="absolute top-2.5 text-red-300 text-[9px] uppercase font-bold tracking-[0.2em]">Jula's Herb</div>
               <div className="text-7xl my-auto drop-shadow-xl transform filter saturate-150">💄</div>
               <div className="mt-auto bg-white/95 px-2.5 py-1 rounded-full shadow-sm text-[9px] font-bold w-[95%] text-center truncate text-gray-700">วอเตอร์เมลอน ลิปเซรั่ม 2.5g</div>
            </div>
            <div className="w-[55%] p-3.5 flex flex-col justify-between">
              <div>
                <div className="text-[#8ac43f] font-black text-xl leading-tight tracking-wide">แลกรับฟรี !</div>
                <div className="text-gray-800 text-sm font-bold leading-snug mt-1">แทททูลิปเซรั่ม สีแดง #02</div>
                <div className="text-gray-400 text-xs font-medium mt-0.5">Burgundy</div>
                <div className="text-[#8ac43f] font-bold text-2xl mt-1 flex items-baseline gap-1">99 <span className="text-sm">บาท</span></div>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[9px] font-bold text-gray-400">มีค่าจัดส่ง</span>
                <button className="bg-[#8ac43f] hover:bg-[#7ab036] text-white rounded-lg py-1.5 px-3 text-xs font-bold shadow-[0_4px_10px_rgba(138,196,63,0.3)] active:scale-95 transition-all flex items-center gap-1">
                  ใช้ 198 🪙
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />
      <div className="pt-14 relative z-0">
        <JulaHerbHome />
      </div>
      <BottomNav />
    </div>
  );
}
