"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isJoined, setIsJoined] = useState(false);
  const [showProductModal, setShowProductModal] = useState({isOpen: false, category: ''});

  const getMissionData = (id: string) => {
    switch(id) {
      case '1': return {
        type: "product",
        title: "สแกนดีดีครีมครบ 6 ซอง",
        desc: "1 ซอง = 1 ดวง (สะสมได้เรื่อยๆ)",
        progress: 2, max: 6, nodes: 6, timeLeft: "เหลืออีก 15 วัน",
        reward: "คูปองส่วนลด 40 บาท",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1303-1-300x300.jpg",
        details: ["ต้องเป็น DD Cream Watermelon SPF50 ขนาด 8 กรัม เท่านั้น", "1 QR Code สามารถสแกนได้ 1 ครั้ง", "ระยะเวลาโปรโมชั่น 1 - 31 มี.ค. 2569"],
        actionBtn: "สแกน QR Code สินค้า"
      };
      case '2': return {
        type: "channel",
        title: "ซื้อสินค้าที่ 7-11 อัปใบเสร็จ",
        desc: "ส่งหลักฐานการซื้อผ่านเมนูรับแต้ม",
        progress: 0, max: 1, nodes: 1, timeLeft: "เหลืออีก 5 วัน",
        reward: "รับ 20 แต้ม",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1312-300x300.jpg",
        details: ["ถ่ายรูปใบเสร็จที่มีรายการสินค้าจุฬาเฮิร์บ", "ต้องเป็นใบเสร็จจาก 7-11 ภายใน 7 วัน"],
        actionBtn: "เลือกรูปใบเสร็จ"
      };
      case '3': return {
        type: "time",
        title: "สแกนเสาร์-อาทิตย์ ครบ 5 ครั้ง",
        desc: "สะสมยอดสแกนเฉพาะวันหยุด Weekend",
        progress: 3, max: 5, nodes: 5, timeLeft: "เหลืออีก 2 วัน",
        reward: "1 ตั๋วลุ้นโชค",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2023/07/Lotion_Shopee1.jpg",
        details: ["ระบบจะนับเฉพาะการสแกนในวันเสาร์และอาทิตย์เท่านั้น", "1 วันนับสูงสุดได้ 2 ครั้ง"],
        actionBtn: "สแกนทันที"
      };
      case '4': return {
        type: "routine",
        title: "สแกนตามรูทีน 4 step ตัวไหนก็ได้",
        desc: "ล้าง > บำรุง > กันแดด > แต้มสิว",
        progress: 1, max: 4, nodes: 4, timeLeft: "ตลอดปี",
        reward: "+100 แต้ม",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1313-300x300.jpg",
        details: ["สแกนสินค้าให้ครบ 4 หมวดหมู่", "สามารถสแกนสะสมข้ามวันได้"],
        actionBtn: "สแกนรูทีนขั้นถัดไป"
      };
      case '5': return {
        type: "category",
        title: "สแกนครบ set แตงโม ตัวไหนก็ได้",
        desc: "เจลแต้มสิว, ดีดีครีม, โลชั่น, สบู่",
        progress: 0, max: 4, nodes: 4, timeLeft: "เหลืออีก 30 วัน",
        reward: "+50 แต้ม",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1303-1-300x300.jpg",
        details: ["สแกนครบ 4 ไอเทมในตระกูลแตงโมจุฬาเฮิร์บ"],
        actionBtn: "สแกนสินค้ากลุ่มแตงโม"
      };
      case '6': return {
        type: "shopping",
        title: "ซื้อสินค้าในแอป ครบ 3 ครั้ง",
        desc: "รวมสินค้าทุกประเภทในแอป",
        progress: 1, max: 3, nodes: 3, timeLeft: "สิ้นเดือนนี้",
        reward: "คูปองลด 15%",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1313-300x300.jpg",
        details: ["สั่งซื้อสำเร็จและรับสินค้าแล้วครบ 3 ครั้ง"],
        actionBtn: "ไปหน้าสั่งซื้อเลย"
      };
      default: return {
        type: "product",
        title: "ภารกิจพิเศษจุฬาเฮิร์บ", desc: "สะสมแต้มแคมเปญพิเศษ", progress: 0, max: 5, nodes: 5, timeLeft: "ไม่จำกัดเวลา", reward: "ของขวัญพิเศษ", image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1312-300x300.jpg", details: ["เงื่อนไขโปรดติดตามทางหน้าเพจ"], actionBtn: "เริ่มภารกิจ"
      };
    }
  };

  const data = getMissionData(resolvedParams.id);
  const percent = (data.progress / data.max) * 100;
  const nodesArr = Array.from({ length: data.nodes });

  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] min-h-screen relative font-sans pb-[100px]">
      {/* Sticky Header */}
      <div className="bg-white w-full max-w-[480px] z-40 sticky top-0 border-b border-gray-100 flex items-center justify-center py-3 shadow-sm">
         <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center text-gray-500 active:bg-gray-50 rounded-full">
               <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
         </div>
         <span className="text-[17px] font-black tracking-tight text-gray-800">รายละเอียดภารกิจ</span>
      </div>

      {/* Hero Image */}
      <div className="w-full max-w-[480px] aspect-video bg-white relative">
         <img src={data.image} className="w-full h-full object-cover opacity-90" alt="Mission Cover" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
         <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="bg-red-500 text-[10px] font-black inline-block px-2 py-0.5 rounded-full uppercase tracking-wider mb-1 shadow-sm">
               HOT MISSION
            </div>
            <h1 className="text-[20px] font-black leading-tight drop-shadow-md">{data.title}</h1>
         </div>
      </div>

      <div className="px-4 w-full max-w-[480px] -mt-2 relative z-10">
         {/* Progress Card */}
         <div className="bg-white rounded-[16px] p-5 shadow-[0_4px_16px_rgba(0,0,0,0.06)] border border-gray-100">
            <h2 className="text-[14px] font-bold text-gray-800">ความคืบหน้าของคุณ</h2>
            <div className="flex justify-between items-center mt-1 mb-4">
               <p className="text-[11px] text-gray-500 font-medium">{data.desc}</p>
               <span className="bg-orange-50 text-orange-600 font-bold text-[10px] px-2 py-0.5 rounded-md">{data.timeLeft}</span>
            </div>

            <div className="w-full relative h-[8px] bg-gray-100 rounded-full flex items-center mb-6">
               <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#1b5e20] to-[#4CAF50] rounded-full transition-all duration-700 shadow-sm" style={{ width: `${percent}%` }}></div>
               
               {/* Overlay Nodes */}
               <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 flex justify-between px-0">
                  {nodesArr.map((_, i) => {
                     const nodePercent = (i / (data.nodes - 1)) * 100;
                     const isActive = percent >= nodePercent;
                     return (
                       <div key={i} className={`w-[18px] h-[18px] bg-white rounded-full flex items-center justify-center shadow-sm relative z-10 transition-colors ${isActive ? 'border-[4px] border-[#4CAF50]' : 'border-[4px] border-gray-200'}`}>
                          {isActive && (
                            <svg className="w-2.5 h-2.5 text-[#1b5e20] absolute" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                       </div>
                     )
                  })}
               </div>
            </div>

            <div className="bg-green-50 rounded-[10px] p-3 flex items-center gap-3 border border-green-100">
               <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-xl shadow-sm border border-green-50">🎁</div>
               <div>
                  <div className="text-[10px] text-[#2E7D32] font-bold uppercase tracking-widest">ของรางวัลเมื่อจบภารกิจ</div>
                  <div className="text-[15px] font-black text-gray-900">{data.reward}</div>
               </div>
            </div>
         </div>

         {/* DYNAMIC CONTEXT BLOCK BASED ON TYPE */}
         {(data.type === 'product' || data.type === 'category') && (
           <div className="mt-4 bg-[#E8F5E9] rounded-[16px] p-4 border border-[#A5D6A7] flex items-center gap-4 shadow-sm animate-fade-in">
             <div className="w-16 h-16 bg-white rounded-xl p-1 shadow-sm shrink-0 border border-green-200">
                <img src={data.image} className="w-full h-full object-cover rounded-lg" alt="" />
             </div>
             <div>
                <div className="bg-[#4CAF50] text-white text-[9px] font-bold px-1.5 py-0.5 rounded inline-block mb-1 shadow-sm">สินค้าร่วมรายการ</div>
                <div className="text-[12px] font-bold text-gray-800 leading-tight">ดีดี้ วอเตอร์เมลอน แมทท์ SPF50 แบบซอง</div>
                <div className="text-[10.5px] text-[#2E7D32] font-medium mt-1">แจ้งเตือน: รีบสแกนเลย! โควต้าใกล้หมดแล้ว 🔥</div>
             </div>
           </div>
         )}

         {data.type === 'channel' && (
           <div className="mt-4 bg-white rounded-[16px] p-5 shadow-sm border border-dashed border-gray-300 text-center flex flex-col items-center animate-fade-in relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-gray-50 rounded-full blur-xl"></div>
             <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-2 relative z-10 border border-gray-100">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
             </div>
             <p className="text-[13px] font-black text-gray-800 relative z-10">อัปโหลดรูปภาพใบเสร็จของคุณ</p>
             <p className="text-[10px] text-gray-400 mt-1 mb-1 relative z-10">ไฟล์ .JPG, .PNG ขนาดไม่เกิน 5MB</p>
             <button className="mt-3 px-6 py-2 bg-gradient-to-br from-[#1b5e20] to-[#4CAF50] text-white text-[12px] font-bold rounded-full border border-green-700 shadow-md active:scale-95 transition-transform flex items-center gap-2 relative z-10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                เลือกรูปภาพ หรือ ถ่ายรูป
             </button>
           </div>
         )}
         
         {data.type === 'routine' && (
           <div className="mt-4 bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 animate-fade-in">
             <h3 className="text-[13px] font-bold text-gray-800 mb-3">4 ขั้นตอนรูทีนผิวสวย</h3>
             <div className="space-y-3">
                {[
                  { name: "Step 1: ล้างทำความสะอาด", sub:"หมวดโฟม/สบู่", status: "done", product: "สบู่แตงโมจุฬาเฮิร์บ" },
                  { name: "Step 2: บำรุงล้ำลึก", sub:"หมวดเซรั่ม/ครีม", status: "waiting", product: "🔍 ดูสินค้าที่ร่วม" },
                  { name: "Step 3: ป้องกันแสงแดด", sub:"หมวดกันแดด/ดีดี", status: "waiting", product: "🔍 ดูสินค้าที่ร่วม" },
                  { name: "Step 4: จัดการสิวเฉพาะจุด", sub:"หมวดเจลแต้มสิว", status: "waiting", product: "🔍 ดูสินค้าที่ร่วม" }
                ].map((s, i) => (
                  <div key={i} className={`flex items-center gap-3 p-3 rounded-[12px] opacity-90 transition-all ${s.status === 'done' ? 'bg-[#E8F5E9] border border-[#A5D6A7]' : 'bg-gray-50 border border-gray-100'}`}>
                     <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-black shadow-sm ${s.status === 'done' ? 'bg-[#4CAF50] text-white' : 'bg-gray-200 text-gray-400'}`}>
                        {s.status === 'done' ? '✓' : i+1}
                     </div>
                     <div className="flex-1">
                        <div className={`text-[12px] font-black tracking-tight ${s.status === 'done' ? 'text-[#2E7D32]' : 'text-gray-700'}`}>{s.name}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{s.sub}</div>
                     </div>
                     <button onClick={() => setShowProductModal({isOpen: true, category: s.sub})} className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg text-center transition-all ${s.status === 'done' ? 'bg-white text-[#2E7D32] border border-[#A5D6A7] shadow-sm active:bg-green-50' : 'bg-white text-gray-500 border border-gray-200 active:bg-gray-50 shadow-sm'}`}>
                        {s.product}
                     </button>
                  </div>
                ))}
             </div>
           </div>
         )}

         {/* Rules / Steps */}
         <div className="mt-4 bg-white rounded-[16px] p-5 shadow-sm border border-gray-100 mb-6">
            <h2 className="text-[14px] font-black text-gray-800 mb-3">วิธีการเข้าร่วมและเงื่อนไข</h2>
            <ul className="space-y-3">
               {data.details.map((detail, idx) => (
                 <li key={idx} className="flex items-start gap-2.5 text-[12.5px] text-gray-600 font-medium">
                    <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-500 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">{idx+1}</div>
                    <span className="pt-0.5">{detail}</span>
                 </li>
               ))}
            </ul>
         </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-[480px] mx-auto bg-white border-t border-gray-100 p-4 pb-6 z-50 rounded-t-[20px] shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex items-center gap-3">
         {!isJoined ? (
            <button 
              onClick={() => setIsJoined(true)}
              className="w-full bg-[#1b5e20] hover:bg-[#144d18] text-white font-black text-[15.5px] tracking-tight py-3.5 rounded-[16px] shadow-[0_4px_12px_rgba(27,94,32,0.3)] active:scale-95 transition-all"
            >
               เข้าร่วมภารกิจนี้
            </button>
         ) : (
            <div className="w-full flex gap-2 animate-fade-in">
               <button onClick={() => { if(data.type==='shopping') router.push('/shop'); else if(data.type==='channel') alert('Select Image Modal'); else router.push('/scan'); }} className="flex-1 bg-[#4CAF50] hover:bg-[#43a047] text-white font-black text-[15px] pt-3.5 pb-3.5 rounded-[16px] shadow-[0_4px_12px_rgba(76,175,80,0.3)] active:scale-95 transition-all flex justify-center items-center gap-2">
                  {data.type !== 'shopping' && data.type !== 'channel' && (
                     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                  {data.actionBtn}
               </button>
               <button className="px-5 bg-gray-100 text-gray-700 font-bold rounded-[16px] active:scale-95 transition-all">
                  แชร์
               </button>
            </div>
         )}
      </div>

      {/* Product List Modal (For Routine Clicks) */}
      {showProductModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 animate-fade-in sm:items-center">
           <div className="bg-white w-full max-w-[480px] rounded-t-[20px] sm:rounded-[20px] p-5 pb-8 sm:pb-5 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden pb-0"></div>
              
              <div className="flex justify-between items-center mb-4">
                 <h2 className="text-[16px] font-black text-gray-800 tracking-tight">สินค้าใน {showProductModal.category}</h2>
                 <button onClick={() => setShowProductModal({isOpen: false, category: ''})} className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 font-bold active:bg-gray-200 transition-colors">✕</button>
              </div>

              <div className="overflow-y-auto scrollbar-none flex-1 -mx-2 px-2 border-t border-gray-100 pt-4">
                 <div className="grid grid-cols-2 gap-3 pb-4">
                    {[
                      { id: 1, name: "วอเตอร์เมลอน แอลอีดี คุชชั่น", img: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1303-1-300x300.jpg" },
                      { id: 2, name: "มาริโกลด์ แอคเน่ เจล", img: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1313-300x300.jpg" },
                      { id: 3, name: "ยาสีฟันเจเด้นท์ สูตรสมุนไพร", img: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1312-300x300.jpg" },
                      { id: 4, name: "โลชั่นขิงหอม ลดสิว ผิวใส", img: "https://shop.julasherb.in.th/wp-content/uploads/2023/07/Lotion_Shopee1.jpg" },
                    ].map(p => (
                      <div key={p.id} className="border border-gray-100 rounded-[12px] p-2.5 flex flex-col gap-2 shadow-sm bg-white">
                         <div className="w-full aspect-square bg-[#F5F7F6] rounded-lg p-1.5 relative">
                            <img src={p.img} className="w-full h-full object-cover mix-blend-multiply opacity-90 rounded-md" alt={p.name}/>
                            <div className="absolute top-1 right-1 bg-[#4CAF50] text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">เข้าร่วม</div>
                         </div>
                         <div className="text-[11.5px] font-bold text-gray-700 leading-snug line-clamp-2 min-h-[34px] mt-1">{p.name}</div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; opacity: 0; }
      `}} />

    </div>
  );
}
