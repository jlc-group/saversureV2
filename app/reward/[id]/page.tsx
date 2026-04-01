"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, use } from "react";

export default function RewardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [rewardData, setRewardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userPoints, setUserPoints] = useState(0);

  // Fetch real addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoadingAddresses(true);
        const response = await fetch('/api/v1/profile/addresses');
        if (response.ok) {
          const data = await response.json();
          setAddresses(data.data || []);
          // Set default address if available
          const defaultAddr = data.data?.find((addr: any) => addr.is_default);
          if (defaultAddr) {
            setSelectedAddressId(defaultAddr.id);
          } else if (data.data?.length > 0) {
            setSelectedAddressId(data.data[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch addresses:', error);
      } finally {
        setLoadingAddresses(false);
      }
    };
    
    fetchAddresses();
  }, []);

  // Fetch reward data from API
  useEffect(() => {
    const fetchRewardData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/v1/rewards/${resolvedParams.id}`);
        if (response.ok) {
          const data = await response.json();
          setRewardData(data);
        } else {
          // Fallback to mock data if API fails
          const mockData = getMockRewardData(resolvedParams.id);
          setRewardData(mockData);
        }
      } catch (error) {
        console.error('Failed to fetch reward data:', error);
        // Fallback to mock data
        const mockData = getMockRewardData(resolvedParams.id);
        setRewardData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchRewardData();
  }, [resolvedParams.id]);

  // Fetch user points
  useEffect(() => {
    const fetchUserPoints = async () => {
      try {
        const response = await fetch('/api/v1/points/balance');
        if (response.ok) {
          const data = await response.json();
          setUserPoints(data.balance || 0);
        }
      } catch (error) {
        console.error('Failed to fetch user points:', error);
        setUserPoints(2420); // Fallback
      }
    };

    fetchUserPoints();
  }, []);

  const currentAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getMockRewardData = (id: string) => {
    if (id === '1') {
      return {
        title: "เซรั่มมะรุม ลดรอยดำ 8ml (1 ซอง) Jula's Herb",
        points: 168,
        type: "physical",
        image: "https://shop.julasherb.in.th/wp-content/uploads/2021/04/0J5A1303-1-300x300.jpg",
        ref: "JHA-992-837A",
        desc: "ฟรีค่าส่ง! สินค้าแท้ส่งตรงจากบริษัท"
      };
    }
    if (id === '2') {
      return {
        title: "โค้ดส่วนลด 50 บาท (Shopee)",
        points: 500,
        type: "digital",
        image: "https://placehold.co/800x800/ffffee/ff8800?text=Shopee",
        ref: "SHP-50-DISCOUNT",
        desc: "โค้ดสามารถใช้เป็นส่วนลดได้ทันทีในแอปพลิเคชัน Shopee"
      };
    }
    return {
      title: "หมอนอิงแตงโม ลิมิเต็ด อิดิชั่น",
      points: 1200,
      type: "physical",
      image: "https://placehold.co/800x800/fce4ec/ec407a?text=🍉+Premium",
      ref: "PRM-101-WTM",
      desc: "สินค้าแรร์ไอเทม น่ารัก นุ่มนิ่ม (ขนาด 45cm)"
    };
  };

  const handlePreRedeem = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRedeem = async () => {
    try {
      const payload = {
        reward_id: resolvedParams.id,
        address_id: rewardData?.delivery_type === 'shipping' ? selectedAddressId : undefined
      };

      const response = await fetch('/api/v1/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowConfirmModal(false);
        setTimeout(() => {
           setShowSuccessModal(true);
        }, 300);
      } else {
        const errorData = await response.json();
        console.error('Redeem failed:', errorData);
        alert(errorData.message || 'เกิดข้อผิดพลาดในการแลกรางวัล');
      }
    } catch (error) {
      console.error('Network error:', error);
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    }
  };

  if (loading || !rewardData) {
    return (
      <div className="w-full flex items-center justify-center min-h-screen bg-[#F5F5F5]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col bg-[#F5F5F5] min-h-screen relative font-sans pb-[100px]">
      
      {/* 1. Floating Back Button (Local Nav) */}
      <div className="absolute top-3 left-3 z-30">
         <button onClick={() => router.back()} className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
         </button>
      </div>

      {/* 2. Hero Image */}
      <div className="w-full aspect-square bg-gray-50 relative">
         <img src={rewardData.image_url || rewardData.image} alt={rewardData.name || rewardData.title} className="w-full h-full object-cover mix-blend-multiply opacity-90" />
         <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
         <div className="absolute bottom-4 right-4 bg-black/60 text-white text-[10.5px] font-black px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm font-mono tracking-widest border border-white/20">REF: {(rewardData.ref || 'SRV-TEST').substring(0,6)}</div>
      </div>

      {/* 3. Reward Info (Points & Title) */}
      <div className="bg-white px-4 pt-4 pb-5 mb-2 shadow-sm rounded-b-[16px]">
         <div className="flex items-start justify-between mb-2">
            <h1 className="text-[17px] font-bold text-gray-800 leading-snug pr-4">{rewardData.name || rewardData.title}</h1>
            <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gray-50 border border-gray-100 text-gray-400">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
         </div>
         
         <div className="flex items-end gap-1.5 mb-4 border-b border-gray-100 pb-4">
            <div className="flex items-baseline gap-1">
               <span className="text-[28px] font-black text-gray-800 leading-none">{rewardData.point_cost || rewardData.points}</span>
               <span className="text-[15px] font-semibold text-orange-500 mb-1">P</span>
            </div>
            <span className="text-[11px] text-gray-400 mb-1.5">คะแนน</span>
         </div>

         <p className="text-[13px] text-gray-600 leading-relaxed">{rewardData.description || rewardData.desc}</p>
      </div>

      {/* 4. User Points Status */}
      <div className="bg-white mx-4 px-4 py-3 rounded-[12px] mb-2 shadow-sm">
         <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                  <span className="text-orange-500 text-[12px] font-bold">🪙</span>
               </div>
               <div>
                  <p className="text-[11px] text-gray-500">แต้มสะสม</p>
                  <p className="text-[16px] font-bold text-gray-800">{userPoints.toLocaleString()} P</p>
               </div>
            </div>
         </div>
         
         <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
               <span className="text-[13px] text-gray-600">ยอดคงเหลือหลังแลก:</span>
               <span className="text-[16px] font-bold text-orange-600">{(userPoints - (rewardData.point_cost || rewardData.points)).toLocaleString()} P</span>
            </div>
            {(userPoints < (rewardData.point_cost || rewardData.points)) && (
               <div className="bg-red-50 text-red-600 text-[11px] px-2 py-1 rounded-full font-medium">
                  แต้มไม่พอ
               </div>
            )}
         </div>
      </div>

      {/* 5. Shipping Address (for physical rewards) */}
      {(rewardData.delivery_type === 'shipping' || rewardData.type === 'physical') && (
        <div className="bg-white mx-4 px-4 py-3 rounded-[12px] mb-2 shadow-sm">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                 <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                 <span className="text-[13px] font-semibold text-gray-700">ที่อยู่จัดส่ง</span>
              </div>
              <button className="text-blue-600 text-[12px] font-medium">เปลี่ยน</button>
           </div>
           {currentAddress ? (
              <div className="text-[12px] text-gray-600">
                 <p className="font-medium text-gray-800">{currentAddress.recipient_name}</p>
                 <p>{currentAddress.phone}</p>
                 <p>{currentAddress.address_line1}</p>
              </div>
           ) : (
              <div className="text-[12px] text-gray-400">
                 กรุณาเพิ่มที่อยู่จัดส่ง
              </div>
           )}
        </div>
      )}

      {/* 6. Redeem Button */}
      <div className="px-4 mt-4">
         <button
            onClick={handlePreRedeem}
            disabled={userPoints < (rewardData.point_cost || rewardData.points)}
            className={`w-full h-[52px] rounded-[12px] font-semibold text-[15px] transition-all ${
               userPoints >= (rewardData.point_cost || rewardData.points)
                 ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg'
                 : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
         >
            {userPoints >= (rewardData.point_cost || rewardData.points) ? 'แลกแต้ม' : 'แต้มไม่พอ'}
         </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[16px] w-full max-w-sm p-5">
              <h3 className="text-[16px] font-bold text-gray-800 mb-4">ยืนยันการแลกแต้ม</h3>
              
              <div className="bg-gray-50 rounded-[8px] p-3 mb-4">
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-gray-600">สินค้าที่แลก:</span>
                    <span className="text-[13px] font-medium text-gray-800">{rewardData.name || rewardData.title}</span>
                 </div>
                 <div className="flex justify-between items-center mb-2">
                    <span className="text-[13px] text-gray-600">ใช้คะแนน:</span>
                    <span className="text-[13px] font-medium text-orange-500">-{rewardData.point_cost || rewardData.points} P</span>
                 </div>
                 <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="text-[13px] text-gray-600">คงเหลือ:</span>
                    <span className="text-[13px] font-bold text-gray-800">{userPoints - (rewardData.point_cost || rewardData.points)} P</span>
                 </div>
              </div>

              <div className="flex gap-3">
                 <button
                    onClick={() => setShowConfirmModal(false)}
                    className="flex-1 h-[44px] border border-gray-300 rounded-[8px] text-[14px] font-medium text-gray-600"
                 >
                    ยกเลิก
                 </button>
                 <button
                    onClick={handleConfirmRedeem}
                    className="flex-1 h-[44px] bg-orange-500 text-white rounded-[8px] text-[14px] font-medium"
                 >
                    ยืนยันแลกแต้ม
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-[16px] w-full max-w-sm p-5 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              </div>
              <h3 className="text-[16px] font-bold text-gray-800 mb-2">แลกแต้มสำเร็จ!</h3>
              <p className="text-[13px] text-gray-600 mb-4">รายการของคุณได้รับการยืนยันแล้ว</p>
              <button
                 onClick={() => {
                    setShowSuccessModal(false);
                    router.push('/profile');
                 }}
                 className="w-full h-[44px] bg-orange-500 text-white rounded-[8px] text-[14px] font-medium"
                 >
                 ดูประวัติ
              </button>
           </div>
        </div>
      )}
    </div>
  );
}