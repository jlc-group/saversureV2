"use client";

import { useState } from "react";

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  return (
    <div className="w-full flex flex-col min-h-[100dvh] items-center bg-[#F5F7F6] font-sans pb-24 relative overflow-hidden">
        
      {/* Decorative Premium Header */}
      <div className="w-full max-w-[480px] bg-gradient-to-b from-[#E8F5E9] to-[#F5F7F6] pt-10 pb-6 px-6 relative overflow-hidden border-b border-gray-200/40">
         <div className="absolute right-[-15%] top-[-30%] w-48 h-48 bg-[#4CAF50] opacity-[0.06] rounded-full blur-2xl pointer-events-none"></div>
         <div className="absolute left-[-10%] bottom-[10%] w-32 h-32 bg-yellow-400 opacity-[0.04] rounded-full blur-xl pointer-events-none"></div>
         
         <div className="relative z-10 flex flex-col">
            <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border border-green-100 mb-3 text-[20px]">📷</div>
            <h1 className="text-[24px] font-black text-gray-900 tracking-tight leading-none mb-1.5">สแกนสะสมแต้ม</h1>
            <p className="text-[12.5px] font-medium text-gray-500">สแกน QR Code หรือกรอกรหัสจากกล่องผลิตภัณฑ์เพื่อรับคะแนนทันที</p>
         </div>
      </div>

      {/* Enhancements / Motivation */}
      <div className="text-center mt-3 px-6 w-full max-w-[480px]">
        <div className="bg-white inline-block px-4 py-2 rounded-full text-[#4CAF50] text-[11.5px] font-black border border-green-100 shadow-sm tracking-wide">
           🎯 อีกเพียง 43 แต้ม แลกรับของฟรีได้เลย!
        </div>
      </div>

      {/* Actions Container wrapped in a beautiful card */}
      <div className="px-4 mt-4 w-full max-w-[480px]">
        <div className="bg-white rounded-[24px] p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-gray-100 w-full relative">
          
          {/* Primary Action (SCAN) */}
          <button 
            onClick={() => setShowPermissionModal(true)}
            className="w-full bg-gradient-to-b from-[#4CAF50] to-[#388E3C] hover:from-[#388E3C] hover:to-[#2E7D32] text-white rounded-[20px] py-6 flex flex-col items-center justify-center gap-3 shadow-[0_8px_20px_rgba(76,175,80,0.3)] active:scale-[0.98] transition-all relative overflow-hidden group border border-[#4CAF50]"
          >
            {/* Micro Animation Pulse Simulation */}
            <div className="absolute w-[80px] h-[80px] bg-white/20 rounded-full animate-ping opacity-75"></div>
            
            <svg className="w-12 h-12 relative z-10 drop-shadow-sm" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8V5a2 2 0 012-2h3m10 0h3a2 2 0 012 2v3M3 16v3a2 2 0 002 2h3m10 0h3a2 2 0 002-2v-3M7 7h1m-1 3h1m3-3h1m-1 3h1m3-3h1m-1 3h1m-8 4v1m3-1v1m3-1v1" />
            </svg>
            <span className="text-[18px] font-black tracking-wide drop-shadow-sm relative z-10">เปิดกล้องสแกน QR Code</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 py-5 w-[85%] mx-auto">
            <div className="h-[1px] bg-gray-100 flex-1"></div>
            <span className="text-gray-300 text-[10px] font-black tracking-[0.2em] uppercase">หรือ</span>
            <div className="h-[1px] bg-gray-100 flex-1"></div>
          </div>

          {/* Secondary Action (CODE INPUT) */}
          <div className="bg-[#F5F7F6] rounded-[18px] p-4 border border-gray-100/80 shadow-inner">
             <div className="text-center mb-3">
               <div className="text-gray-800 font-bold text-[14px]">กรอกคิวอาร์โค้ดด้วยตัวเอง</div>
               <p className="text-gray-400 text-[10px] mt-0.5 font-medium">หากสแกนไม่ติด ให้กรอกรหัส 8 หรือ 9 หลัก</p>
             </div>
             
             <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="EX. 12345678" 
                  className="bg-white border border-gray-200 text-center text-[18px] font-black tracking-[0.25em] rounded-xl py-3 w-full outline-none focus:ring-2 focus:ring-[#4CAF50] transition-all text-gray-800 placeholder-gray-300 uppercase shadow-sm"
                  maxLength={9}
                />
                <button 
                  disabled={code.length < 8}
                  className={`w-full rounded-xl py-3 text-[14px] font-black shadow-sm transition-all ${code.length >= 8 ? 'bg-[#4CAF50] text-white active:scale-[0.98] shadow-[0_4px_12px_rgba(76,175,80,0.3)]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  ยืนยันรหัส
                </button>
             </div>

             <div className="mt-4 text-center">
               <button className="text-gray-400 text-[10.5px] font-bold hover:text-[#4CAF50] transition-colors flex items-center justify-center gap-1.5 mx-auto">
                 <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 คลิกเพื่อดูวิธีหารหัสจากกล่อง
               </button>
             </div>
          </div>
        </div>
      </div>

      {/* Permission Modal OVERLAY */}
      {showPermissionModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 px-6 opacity-100 transition-opacity">
           <div className="bg-white rounded-[24px] w-full max-w-[320px] overflow-hidden shadow-2xl transform scale-100 transition-transform">
              <div className="bg-green-50 aspect-[2/1] relative flex items-center justify-center overflow-hidden">
                 <div className="absolute w-[180px] h-[180px] bg-[#4CAF50]/15 rounded-full animate-ping"></div>
                 <div className="absolute w-[120px] h-[120px] bg-[#4CAF50]/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
                 
                 <div className="w-16 h-16 bg-[#4CAF50] rounded-full flex items-center justify-center shadow-lg relative z-10 border-4 border-white">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                 </div>
              </div>
              <div className="p-6 text-center">
                 <h3 className="text-[18px] font-black text-gray-900 mb-2 tracking-tight">อนุญาตให้เข้าถึงกล้อง</h3>
                 <p className="text-[12.5px] text-gray-500 mb-6 font-medium leading-relaxed">แอปจำเป็นต้องเปิดใช้งานกล้อง<span className="text-[#4CAF50] font-bold">เพื่อสแกน QR Code</span> บนกล่องผลิตภัณฑ์และรับแต้มสะสมทันที</p>
                 
                 <div className="flex gap-3">
                   <button 
                     onClick={() => setShowPermissionModal(false)}
                     className="flex-1 py-3 text-[13px] font-bold text-gray-500 bg-gray-100 rounded-[14px] hover:bg-gray-200 transition-colors"
                   >
                     ไม่อนุญาต
                   </button>
                   <button 
                     onClick={() => setShowPermissionModal(false)}
                     className="flex-1 py-3 text-[13px] font-bold text-white bg-[#4CAF50] rounded-[14px] shadow-[0_4px_12px_rgba(76,175,80,0.3)] hover:bg-[#388E3C] transition-colors"
                   >
                     อนุญาตกล้อง
                   </button>
                 </div>
              </div>
           </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}} />
    </div>
  );
}
