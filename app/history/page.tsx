"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function HistoryDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // URL tab fallback checks
  const initialTab = searchParams.get('tab') || 'all';
  const [activeFilter, setActiveFilter] = useState(initialTab);

  // Coupon Viewer Modal State
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);
  const [codeType, setCodeType] = useState<'qr' | 'barcode' | 'text'>('barcode');

  // Sync state if URL search param changes directly via Next.js Link
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && tab !== activeFilter) {
      setActiveFilter(tab);
    }
  }, [searchParams]);

  const handleFilterClick = (tabId: string) => {
    setActiveFilter(tabId);
    // Push smoothly without refreshing the page data
    router.replace(`/history?tab=${tabId}`, { scroll: false });
  };

  const filters = [
    { id: "all", label: "ทั้งหมด" },
    { id: "earn", label: "สะสมแต้ม" },
    { id: "redeem", label: "แลกแต้ม" },
    { id: "lucky", label: "ลุ้นรางวัล" },
    { id: "reward", label: "ของรางวัล" },
  ];

  const mockData = [
    {
      id: 1,
      type: "earn",
      title: "ยาสีฟันเจเด้นท์ สูตรเสียวฟัน",
      refCode: "QR: 98765432",
      points: "+10 P",
      dateGroup: "วันนี้",
      dateStr: "14:30 น.",
      status: "success",
      icon: "🦷",
      bg: "#E8F5E9"
    },
    {
      id: 2,
      type: "redeem",
      title: "วอเตอร์เมลอน แอลอีดี คุชชั่น",
      refCode: "REF: JHH-8821",
      points: "-450 P",
      dateGroup: "เมื่อวาน",
      dateStr: "10:15 น.",
      status: "success",
      statusText: "สำเร็จแล้ว",
      icon: "🍉",
      bg: "#F9FBE7"
    },
    {
      id: 6,
      type: "reward",
      title: "คูปองส่วนลด 100 บาท (VIP)",
      refCode: "ได้จากภารกิจพิเศษ",
      points: "เปิดดู",
      dateGroup: "เมื่อวาน",
      dateStr: "หมดอายุ 31 ธ.ค. 69",
      status: "ready",
      statusText: "พร้อมใช้",
      icon: "🎫",
      bg: "#FFF3E0"
    },
    {
      id: 3,
      type: "lucky",
      title: "JDent Challenge โชคหล่นทับ",
      refCode: "รับ 3 สิทธิ์ลุ้นรางวัล",
      points: "-30 P",
      dateGroup: "เมื่อวาน",
      dateStr: "09:00 น.",
      status: "pending",
      statusText: "รอประกาศผล",
      icon: "🎲",
      bg: "#E3F2FD"
    },
    {
      id: 5,
      type: "earn",
      title: "สบู่แตงโม ล้างหน้าใส",
      refCode: "QR: 11223344",
      points: "+5 P",
      dateGroup: "สัปดาห์นี้",
      dateStr: "18 มี.ค. 69",
      status: "success",
      icon: "🧼",
      bg: "#E8F5E9"
    },
  ];

  const filteredData = activeFilter === "all" ? mockData : mockData.filter(d => d.type === activeFilter);

  // Group by DateGroup
  const groupedData = filteredData.reduce((acc, curr) => {
    if (!acc[curr.dateGroup]) acc[curr.dateGroup] = [];
    acc[curr.dateGroup].push(curr);
    return acc;
  }, {} as Record<string, typeof mockData>);

  return (
    <div className="w-full flex flex-col items-center pb-8">
      
      {/* Title Header */}
      <div className="px-5 mt-5 mb-4 text-center w-full max-w-[480px]">
          <h1 className="text-[22px] font-black text-gray-900">ประวัติกิจกรรมของคุณ</h1>
          <p className="text-gray-500 text-[11.5px] mt-1 font-medium max-w-[280px] mx-auto">รวมรายการสะสม แลกแต้ม และลุ้นรางวัลทั้งหมด</p>
      </div>

      {/* Advanced Inside Dashboard Card */}
      <div className="px-4 w-full max-w-[480px] mb-5">
        <div className="bg-gradient-to-br from-[#1b5e20] to-[#2E7D32] rounded-[20px] p-5 text-white shadow-[0_8px_20px_rgba(46,125,50,0.3)] relative overflow-hidden">
           <div className="absolute right-0 top-0 opacity-10 text-[80px] transform translate-x-4 -translate-y-4 pointer-events-none select-none">📊</div>
           <div className="relative z-10 w-full flex items-center justify-between">
              <div>
                 <div className="text-[10px] text-green-200 font-bold tracking-wide uppercase mb-1">สรุปการสะสม เดือนนี้</div>
                 <div className="text-[26px] font-black leading-none tracking-tight">+240 <span className="text-[14px] text-green-100 font-bold ml-0.5">แต้ม</span></div>
                 <div className="text-[10px] text-green-100 mt-2 font-medium bg-white/10 inline-block px-2 py-0.5 rounded-full border border-white/20">จากการสแกน 12 ครั้ง 🔥</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-3 rounded-[14px] border border-white/20 text-center shadow-inner">
                 <div className="text-[10px] text-green-100 font-bold mb-1 tracking-widest uppercase">สถานะ</div>
                 <div className="text-[13px] font-black text-[#FFD700] drop-shadow-sm">Jula VIP</div>
              </div>
           </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 w-full max-w-[480px] sticky top-[56px] z-[40] bg-[#F5F7F6]/95 backdrop-blur-md py-3 border-b border-gray-200/50 shadow-sm mt-[-10px]">
         <div className="flex w-full gap-2 pb-1 justify-between">
            {filters.map(f => (
               <button 
                 key={f.id}
                 onClick={() => handleFilterClick(f.id)}
                 className={`flex-1 py-1.5 rounded-full text-[11.5px] font-bold transition-all shadow-sm border whitespace-nowrap px-1 ${
                   activeFilter === f.id 
                     ? 'bg-[#4CAF50] text-white border-[#4CAF50] shadow-[0_4px_10px_rgba(76,175,80,0.3)] scale-105 z-10 relative' 
                     : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                 }`}
               >
                  {f.label}
               </button>
            ))}
         </div>
      </div>

      {/* History List */}
      <div className="px-4 w-full max-w-[480px] mt-4 space-y-6">
        {Object.keys(groupedData).length === 0 ? (
           <div className="bg-white rounded-[24px] p-8 text-center border border-gray-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] mt-6">
              <div className="text-[55px] opacity-60 mb-3 drop-shadow-sm">📭</div>
              <div className="text-[16px] font-black text-gray-800 tracking-wide">ยังไม่มีข้อมูลกิจกรรมแบบนี้</div>
              <div className="text-[12px] text-gray-400 mt-1.5 font-medium">ทำกิจกรรมใหม่ๆเพื่อบันทึกประวัติของคุณเลย!</div>
           </div>
        ) : (
          Object.entries(groupedData).map(([group, items], groupIdx) => (
            <div key={group} className="animate-fade-in" style={{animationDelay: `${groupIdx * 50}ms`}}>
               <div className="text-[12px] font-black text-gray-400 mb-3 ml-2 tracking-wide uppercase">{group}</div>
               <div className="space-y-3.5">
                  {items.map((item) => (
                     <div key={item.id} onClick={() => { if(item.type === 'reward') router.push(`/history/tracking/${item.id}`); }} className="bg-white p-3.5 rounded-[18px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100 flex items-center gap-3.5 hover:border-green-200 transition-colors active:scale-[0.98] cursor-pointer group">
                        
                        {/* Left Icon / Image */}
                        <div className="w-12 h-12 rounded-[14px] flex items-center justify-center text-[22px] shrink-0 border border-gray-50 group-hover:scale-105 transition-transform" style={{backgroundColor: item.bg}}>
                           {item.icon}
                           {/* Small notification dot if won early */}
                           {item.type === 'reward' && <div className="absolute top-[2px] right-[2px] w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>}
                        </div>
                        
                        {/* Middle Info */}
                        <div className="flex-1 overflow-hidden">
                           <div className="font-bold text-gray-800 text-[13.5px] truncate tracking-tight">{item.title}</div>
                           <div className="text-[10.5px] text-gray-400 mt-1 flex items-center gap-1.5 line-clamp-1">
                              <span className="font-bold text-gray-500 bg-gray-100 px-1.5 py-[2px] rounded text-[9.5px] border border-gray-200/50">{item.refCode}</span>
                              <span>• {item.dateStr}</span>
                           </div>
                        </div>

                        {/* Right Value & Status */}
                        <div className="text-right shrink-0 flex flex-col items-end justify-center min-w-[65px]">
                           {/* Point variations */}
                           {item.type === 'earn' && <div className="text-[#4CAF50] font-black text-[16px] drop-shadow-sm tracking-tight">{item.points}</div>}
                           {item.type === 'redeem' && <div className="text-gray-600 font-black text-[15px] tracking-tight">{item.points}</div>}
                           {item.type === 'lucky' && <div className="text-gray-600 font-black text-[15px] tracking-tight">{item.points}</div>}
                           {item.type === 'donate' && <div className="text-gray-600 font-black text-[15px] tracking-tight">{item.points}</div>}
                           {item.type === 'reward' && (
                              <button onClick={(e) => { e.stopPropagation(); setSelectedCoupon(item); setCodeType('barcode'); }} className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] text-[#5D4037] text-[11px] font-black px-3.5 py-1.5 rounded-full shadow-sm active:scale-95 transition-transform">{item.points}</button>
                           )}
                           
                           {/* Status Badges */}
                           {item.statusText && item.status === 'success' && (
                              <div className="text-[9.5px] font-bold text-green-600 mt-1">{item.statusText}</div>
                           )}
                           {item.statusText && item.status === 'ready' && (
                              <div className="text-[10.5px] font-black text-[#E65100] mt-1">{item.statusText}</div>
                           )}
                           {item.statusText && item.status === 'pending' && (
                              <div className="text-[9.5px] font-bold text-orange-500 mt-1 flex items-center gap-1">
                                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 {item.statusText}
                              </div>
                           )}
                           {item.statusText && item.status === 'shipping' && (
                              <div className="text-[9.5px] font-bold text-blue-500 mt-1 flex items-center gap-1">
                                 <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                 {item.statusText}
                              </div>
                           )}
                        </div>
                        
                     </div>
                  ))}
               </div>
            </div>
          ))
        )}
      </div>
      
      {/* Bottom padding to prevent FAB overlay issues */}
      <div className="h-[90px] shrink-0"></div>

      {/* Code Viewer Modal */}
      {selectedCoupon && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 pb-10" style={{animation: 'fadeIn 0.3s ease-out forwards', opacity: 0}}>
           <div className="bg-white w-full max-w-[340px] rounded-[24px] shadow-2xl relative overflow-hidden flex flex-col border border-white/20">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-[#FFD700] to-[#FFA000] p-5 pb-6 text-center relative border-b border-yellow-500/30">
                 <button onClick={() => setSelectedCoupon(null)} className="absolute right-3.5 top-3.5 w-8 h-8 flex items-center justify-center bg-black/10 rounded-full text-yellow-900 font-bold hover:bg-black/20 transition-colors">✕</button>
                 <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-3xl mx-auto mb-2 shadow-[0_4px_16px_rgba(0,0,0,0.1)] border-2 border-yellow-50">{selectedCoupon.icon}</div>
                 <h2 className="text-[17px] font-black text-[#5D4037] px-2 drop-shadow-sm leading-tight">{selectedCoupon.title}</h2>
                 <p className="text-[11.5px] text-yellow-900 font-bold opacity-90 mt-1 tracking-tight">{selectedCoupon.dateStr}</p>
                 
                 {/* Top Cutouts */}
                 <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-white z-20"></div>
                 <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-white z-20"></div>
              </div>
              
              <div className="relative w-full border-t-[2px] border-dashed border-gray-200"></div>

              {/* Display Area */}
              <div className="px-6 pt-5 pb-7 flex flex-col items-center bg-white relative">
                 <p className="text-[10px] text-green-700 font-bold mb-6 flex items-center gap-1.5 bg-[#E8F5E9] px-3 py-1.5 rounded-full border border-[#A5D6A7]">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    ระบบเร่งแสงหน้าจออัตโนมัติ
                 </p>

                 <div className="w-full flex-1 flex items-center justify-center min-h-[160px] mb-6">
                    {codeType === 'qr' && (
                       <div className="p-3 border border-gray-100 rounded-[20px] shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white" style={{animation: 'fadeIn 0.4s ease-out forwards', opacity: 0}}>
                          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selectedCoupon.refCode)}-${selectedCoupon.id}`} alt="QR Code" className="w-[180px] h-[180px] opacity-[0.95]" />
                       </div>
                    )}
                    {codeType === 'barcode' && (
                       <div className="w-full px-1 flex flex-col items-center" style={{animation: 'fadeIn 0.4s ease-out forwards', opacity: 0}}>
                          <img src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(selectedCoupon.refCode)}&code=Code128&translate-esc=on`} alt="Barcode" className="w-full h-[95px] object-cover mix-blend-multiply opacity-[0.95]" />
                          <div className="text-[14px] font-black text-gray-700 tracking-[0.25em] mt-4 bg-gray-50 px-4 py-1.5 rounded-lg border border-gray-100 shadow-inner">
                             {selectedCoupon.refCode}
                          </div>
                       </div>
                    )}
                    {codeType === 'text' && (
                       <div className="w-full flex" style={{animation: 'fadeIn 0.4s ease-out forwards', opacity: 0}}>
                          <div className="w-full border-2 border-dashed border-[#4CAF50] bg-[#F1F8E9] rounded-[22px] p-6 py-8 text-center relative group active:scale-[0.98] transition-all shadow-[0_4px_16px_rgba(76,175,80,0.1)]">
                             <div className="text-[11px] text-[#2E7D32] font-black uppercase tracking-widest mb-1">PROMO CODE</div>
                             <div className="text-[26px] font-black text-gray-900 tracking-wider mb-3 leading-none">{selectedCoupon.refCode}</div>
                             <button onClick={() => alert('คัดลอกโค้ดสำเร็จ!')} className="mt-2 bg-white text-[#4CAF50] border border-[#A5D6A7] text-[12px] font-black px-5 py-2.5 rounded-full inline-flex items-center gap-1.5 shadow-sm active:bg-green-50 transition-colors">
                                📋 คัดลอกโค้ด
                             </button>
                          </div>
                       </div>
                    )}
                 </div>

                 {/* Segmented Tabs for Selection */}
                 <div className="w-full bg-[#F5F7F6] p-1.5 rounded-[16px] flex border border-gray-200/60 mt-2 shadow-inner">
                    <button onClick={() => setCodeType('barcode')} className={`flex-1 py-2.5 text-[11.5px] font-bold rounded-[12px] transition-all flex flex-col items-center justify-center gap-1.5 ${codeType === 'barcode' ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                       <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4m16-4v8m-16-8v8m4-8v8m8-8v8" /></svg>
                       บาร์โค้ด
                    </button>
                    <button onClick={() => setCodeType('qr')} className={`flex-1 py-2.5 text-[11.5px] font-bold rounded-[12px] transition-all flex flex-col items-center justify-center gap-1.5 ${codeType === 'qr' ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                       <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm13 3h3v3h-3v-3z" /></svg>
                       คิวอาร์โค้ด
                    </button>
                    <button onClick={() => setCodeType('text')} className={`flex-1 py-2.5 text-[11.5px] font-bold rounded-[12px] transition-all flex flex-col items-center justify-center gap-1.5 ${codeType === 'text' ? 'bg-white text-gray-900 shadow-[0_4px_12px_rgba(0,0,0,0.06)] border border-gray-100' : 'text-gray-400 hover:text-gray-600'}`}>
                       <svg className="w-6 h-6 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                       เลขโค้ด
                    </button>
                 </div>
                 
                 <div className="w-full mt-6 text-center">
                    <p className="text-[10px] text-gray-400 font-bold leading-relaxed px-2">กรุณาแสดงหน้าจอนี้ให้พนักงาน 7-11 สแกน<br/>หรือใช้เลขโค้ดเพื่อรับสิทธิ์หน้าตะกร้าสินค้าออนไลน์</p>
                 </div>
              </div>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
      `}} />
    </div>
  );
}

// Ensure the page respects Suspense to avoid de-opts with useSearchParams
export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center font-bold text-gray-400">กำลังโหลดข้อมูล...</div>}>
      <HistoryDashboard />
    </Suspense>
  );
}
