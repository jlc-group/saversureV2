"use client";

import { use } from "react";
import { useRouter } from "next/navigation";

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  // Mock timeline data
  const trackingEvents = [
    { id: 1, date: "20 มี.ค. 2569", time: "14:30 น.", title: "จัดส่งสำเร็จ", desc: "พัสดุถูกจัดส่งสำเร็จ (ผู้รับ: นิติบุคคลคอนโด)", active: true, isFinal: true },
    { id: 2, date: "20 มี.ค. 2569", time: "09:15 น.", title: "อยู่ระหว่างการจัดส่ง", desc: "พนักงานขนส่งกำลังนำส่งพัสดุของคุณ (นายสมชาย เบอร์ 081-xxx-xxxx)", active: false },
    { id: 3, date: "19 มี.ค. 2569", time: "18:45 น.", title: "พัสดุถึงสาขาปลายทาง", desc: "พัสดุถึงสาขาปลายทาง (กรุงเทพมหานคร)", active: false },
    { id: 4, date: "18 มี.ค. 2569", time: "22:15 น.", title: "พัสดุออกจากศูนย์คัดแยก", desc: "พัสดุออกจากศูนย์คัดแยกสินค้า (สมุทรปราการ)", active: false },
    { id: 5, date: "18 มี.ค. 2569", time: "14:20 น.", title: "บริษัทขนส่งเข้ารับพัสดุแล้ว", desc: "บริษัทขนส่ง (Kerry Express) เข้ารับพัสดุเรียบร้อยแล้ว", active: false },
    { id: 6, date: "17 มี.ค. 2569", time: "10:05 น.", title: "ผู้ส่งกำลังเตรียมพัสดุ", desc: "ร้านค้ากำลังแพ็คสินค้าและเตรียมจัดส่งให้คุณ", active: false }
  ];

  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] min-h-screen font-sans pb-10">
      
      {/* Header */}
      <div className="bg-white w-full max-w-[480px] z-40 sticky top-0 border-b border-gray-100 flex items-center justify-center py-3.5 shadow-sm">
         <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center text-gray-500 active:bg-gray-50 rounded-full">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
         </div>
         <span className="text-[17px] font-black tracking-tight text-gray-800">สถานะการจัดส่งพัสดุ</span>
      </div>

      <div className="px-4 mt-4 w-full max-w-[480px]">
         
         {/* Order Item Summary */}
         <div className="bg-white rounded-[16px] p-4 shadow-sm border border-gray-100 flex gap-4 items-center mb-4">
            <div className="w-[60px] h-[60px] bg-pink-50 rounded-xl flex items-center justify-center text-[30px] shadow-inner shrink-0 border border-pink-100">
               🎁
            </div>
            <div className="flex-1">
               <div className="text-[13px] font-bold text-gray-800 leading-tight">หมอนอิงแตงโม ลิมิเต็ด อิดิชั่น Jula's Herb</div>
               <div className="text-[11px] text-gray-500 mt-1">แลกเมื่อ 17 มี.ค. 2569</div>
            </div>
         </div>

         {/* Courier Info Card */}
         <div className="bg-gradient-to-r from-orange-400 to-[#ee4d2d] rounded-[16px] p-4 text-white shadow-[0_4px_16px_rgba(238,77,45,0.3)] mb-4 flex items-center justify-between">
            <div>
               <div className="text-[11px] font-semibold text-orange-100 mb-0.5 tracking-wide">Kerry Express</div>
               <div className="text-[18px] font-black tracking-widest drop-shadow-sm font-mono flex items-center gap-2">
                  TH123456789
                  <button onClick={() => alert('คัดลอกเลขพัสดุแล้ว!')} className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center hover:bg-white/30 active:scale-95 transition-all">
                     <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  </button>
               </div>
            </div>
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
               <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </div>
         </div>

         {/* Timeline */}
         <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100">
            <h2 className="text-[13.5px] font-black text-gray-800 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
               <svg className="w-4 h-4 text-[#4CAF50]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
               เส้นทางพัสดุ
            </h2>

            <div className="relative pl-3 mt-2 space-y-0 text-[12.5px]">
               {/* Vertical Line */}
               <div className="absolute left-[19px] top-2 bottom-6 w-[2px] bg-gray-100"></div>
               
               {trackingEvents.map((event, index) => (
                 <div key={event.id} className={`relative flex gap-4 pb-6 ${index === trackingEvents.length - 1 ? '' : ''}`}>
                    
                    {/* Event Dot */}
                    <div className="relative z-10 w-4 pl-[3px] pt-1">
                       {event.active ? (
                         <div className="w-5 h-5 -ml-[4.5px] bg-[#4CAF50] rounded-full flex items-center justify-center shadow-[0_0_0_4px_rgba(76,175,80,0.15)] ring-2 ring-white">
                            {event.isFinal ? (
                               <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            ) : (
                               <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                         </div>
                       ) : (
                         <div className="w-2.5 h-2.5 ml-[0.5px] mt-[1.5px] bg-gray-300 rounded-full ring-4 ring-white"></div>
                       )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 pt-0.5">
                       <h3 className={`font-bold ${event.active ? 'text-[#2E7D32] text-[13.5px]' : 'text-gray-600'}`}>{event.title}</h3>
                       <p className={`mt-0.5 leading-relaxed font-medium pr-2 ${event.active ? 'text-gray-700' : 'text-gray-400 text-[11px]'}`}>{event.desc}</p>
                       <p className={`text-[10px] mt-1 font-bold ${event.active ? 'text-[#4CAF50]' : 'text-gray-400'}`}>{event.date} • {event.time}</p>
                    </div>

                 </div>
               ))}
            </div>
         </div>

      </div>
    </div>
  );
}
