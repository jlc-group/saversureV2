"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function FAQPage() {
  const router = useRouter();
  const [open, setOpen] = useState<number | null>(1);

  const faqs = [
    { id: 1, title: "สแกนคิวอาร์โค้ดสะสมแต้มอย่างไร?", format: "คุณสามารถเปิดหน้าหลัก เลือกปุ่มสัญลักษณ์ 'สแกน QR' ตรงกลางด้านล่าง และนำกล้องไปสแกนที่ QR Code บนด้านหลังกล่องผลิตภัณฑ์ Jula's Herb ที่ร่วมรายการ เพื่อรับคะแนนสะสมได้ทันที (จำกัดสูงสุด 20 แต้ม/วัน)" },
    { id: 2, title: "แต้มสะสมมีวันหมดอายุหรือไม่?", format: "คะแนนสะสมและสถานะระดับสมาชิกจะมีอายุ 1 ปีปฏิทิน นับจากวันที่ได้รับคะแนน โดยบริษัทฯ จะทำการตัดคะแนนที่หมดอายุทุกๆ วันที่ 31 ธันวาคม ของทุกปี" },
    { id: 3, title: "สามารถนำแต้ม Jula Point ไปแลกอะไรได้บ้าง?", format: "แต้มสามารถนำไปแลกของรางวัลพิเศษ, สินค้า Limited Edition, สินค้า Jula Herb, หรือ e-Voucher เพื่อใช้เป็นส่วนลดค่าสินค้าในเว็บ Jula Mall ได้ตามที่แสดงไว้ในเมนู 'รางวัล (Reward)'" },
    { id: 4, title: "หากสแกนแล้วไม่ได้รับแต้มต้องทำอย่างไร?", format: "กรณีสแกนแล้วเกิดระบบขัดข้อง กรุณาตรวจสอบว่าสภาพ QR Code ไม่ฉีกขาด และยังไม่ได้ถูกสแกนซ้ำ หากมั่นใจว่าโค้ดสมบูรณ์ คุณสามารถกรอกตัวเลข 8 หลักใต้ QR Code ด้วยตนเองในช่องสแกน หรือติดต่อ Line Official: @JulasHerb" },
    { id: 5, title: "วิธีติดตามสถานะการจัดส่งของรางวัล?", format: "เมื่อทำการแลกของรางวัลที่เป็น Physical Product เรียบร้อยแล้ว คุณสามารถติดตามสถานะการจัดส่งได้ที่ เมนู 'โปรไฟล์' เลือก 'ประวัติกิจกรรม' หรือ 'การสั่งซื้อของฉัน > กำลังจัดส่ง'" }
  ];

  return (
    <div className="bg-[#F5F7F6] min-h-[100dvh] w-full font-sans pb-10">
      <div className="bg-white w-full max-w-[480px] fixed top-[56px] z-40 flex items-center justify-between px-2 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border-b border-gray-100">
         <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center text-gray-600 active:bg-gray-50 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
         <h1 className="text-[17px] font-bold text-gray-800">คำถามที่พบบ่อย (FAQ)</h1>
         <div className="w-10"></div>
      </div>
      <div className="pt-[60px]"></div>

      <div className="px-5 py-4 pb-2">
         <div className="bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center text-[24px]">👩🏻‍💻</div>
            <h2 className="text-[17px] font-black text-gray-900 leading-tight">พบปัญหาการใช้งาน?<br/><span className="text-[#4CAF50]">มาดูคำตอบกันที่นี่!</span></h2>
         </div>
      </div>

      <div className="px-5 flex flex-col gap-2.5 mt-2">
         {faqs.map(item => (
            <div key={item.id} className={`bg-white rounded-[14px] overflow-hidden transition-all duration-300 ${open === item.id ? 'border-[1.5px] border-[#4CAF50] shadow-[0_6px_16px_rgba(76,175,80,0.12)] -translate-y-0.5' : 'border border-gray-200 shadow-sm'}`}>
               <button 
                 onClick={() => setOpen(open === item.id ? null : item.id)}
                 className={`w-full flex items-center justify-between p-4 px-4.5 text-left font-bold text-[13.5px] transition-colors ${open === item.id ? 'bg-[#f4fbf5] text-[#1b5e20]' : 'bg-white text-gray-800 hover:bg-gray-50'}`}
               >
                  <span className="pr-4 leading-snug">{item.title}</span>
                  <svg className={`w-4 h-4 shrink-0 transition-transform duration-300 ${open === item.id ? 'rotate-180 text-[#4CAF50]' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
               </button>
               
               <div className={`transition-all duration-300 overflow-hidden ${open === item.id ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="bg-[#f4fbf5] p-4.5 pt-0 text-[12.5px] text-gray-600 leading-relaxed font-medium">
                     <div className="h-px w-full bg-green-100/50 mb-3"></div>
                     {item.format}
                  </div>
               </div>
            </div>
         ))}
      </div>
      
      <div className="mt-8 text-center text-gray-400 text-[12px] font-medium border-t border-dashed border-gray-300 pt-6 mx-6">
         หากไม่พบคำตอบที่คุณต้องการ<br/><button className="font-bold text-[#4CAF50] bg-white border border-[#4CAF50] px-5 py-2 rounded-full shadow-sm mt-3 active:scale-95 transition-transform flex items-center gap-1.5 mx-auto"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg> ติดต่อฝ่ายบริการลูกค้า 24 ชม.</button>
      </div>

    </div>
  );
}
