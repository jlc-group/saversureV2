"use client";

import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { isLoggedIn, getUser, logout } from "@/lib/auth";
import { api } from "@/lib/api";

interface Profile {
  id: string;
  display_name: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  avatar_url: string | null;
  phone_verified: boolean;
}

interface Address {
  id: string;
  label: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2: string | null;
  district: string | null;
  sub_district: string | null;
  province: string | null;
  postal_code: string | null;
  is_default: boolean;
}

const inputClass =
  "w-full h-[44px] px-4 border border-[var(--outline)] rounded-[var(--radius-md)] text-[14px] text-[var(--on-surface)] bg-transparent outline-none focus:border-[#1976d2] focus:border-2 transition-all";

export default function ProfilePage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [balances, setBalances] = useState<{ currency: string; name: string; balance: number }[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", display_name: "", birth_date: "", gender: "" });
  const [addrModal, setAddrModal] = useState<"add" | "edit" | null>(null);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrForm, setAddrForm] = useState({
    label: "",
    recipient_name: "",
    phone: "",
    address_line1: "",
    address_line2: "",
    district: "",
    sub_district: "",
    province: "",
    postal_code: "",
    is_default: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const user = getUser();

  const loadData = async () => {
    if (!isLoggedIn()) return;
    try {
      const [p, a, b] = await Promise.all([
        api.get<Profile>("/api/v1/profile"),
        api.get<{ data: Address[] }>("/api/v1/profile/addresses"),
        api.get<{ data: { currency: string; name: string; balance: number }[] }>("/api/v1/my/balances"),
      ]);
      setProfile(p);
      setAddresses(a.data || []);
      setBalances(b.data || []);
      setEditForm({
        first_name: p.first_name || "",
        last_name: p.last_name || "",
        display_name: p.display_name || "",
        birth_date: p.birth_date || "",
        gender: p.gender || "",
      });
    } catch {
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    const li = isLoggedIn();
    setLoggedIn(li);
    if (li) loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await api.patch<Profile>("/api/v1/profile", {
        first_name: editForm.first_name || undefined,
        last_name: editForm.last_name || undefined,
        display_name: editForm.display_name || undefined,
        birth_date: editForm.birth_date || undefined,
        gender: editForm.gender || undefined,
      });
      setProfile(updated);
      setEditing(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (addrModal === "add") {
        await api.post("/api/v1/profile/addresses", {
          label: addrForm.label,
          recipient_name: addrForm.recipient_name,
          phone: addrForm.phone,
          address_line1: addrForm.address_line1,
          address_line2: addrForm.address_line2 || undefined,
          district: addrForm.district || undefined,
          sub_district: addrForm.sub_district || undefined,
          province: addrForm.province || undefined,
          postal_code: addrForm.postal_code || undefined,
          is_default: addrForm.is_default,
        });
      } else if (editingAddr) {
        await api.patch(`/api/v1/profile/addresses/${editingAddr.id}`, {
          label: addrForm.label,
          recipient_name: addrForm.recipient_name,
          phone: addrForm.phone,
          address_line1: addrForm.address_line1,
          address_line2: addrForm.address_line2 || undefined,
          district: addrForm.district || undefined,
          sub_district: addrForm.sub_district || undefined,
          province: addrForm.province || undefined,
          postal_code: addrForm.postal_code || undefined,
          is_default: addrForm.is_default,
        });
      }
      await loadData();
      setAddrModal(null);
      setEditingAddr(null);
      setAddrForm({
        label: "",
        recipient_name: "",
        phone: "",
        address_line1: "",
        address_line2: "",
        district: "",
        sub_district: "",
        province: "",
        postal_code: "",
        is_default: false,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("ลบที่อยู่นี้?")) return;
    try {
      await api.delete(`/api/v1/profile/addresses/${id}`);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "ลบไม่สำเร็จ");
    }
  };

  const openEditAddr = (a: Address) => {
    setEditingAddr(a);
    setAddrForm({
      label: a.label,
      recipient_name: a.recipient_name,
      phone: a.phone,
      address_line1: a.address_line1,
      address_line2: a.address_line2 || "",
      district: a.district || "",
      sub_district: a.sub_district || "",
      province: a.province || "",
      postal_code: a.postal_code || "",
      is_default: a.is_default,
    });
    setAddrModal("edit");
  };

  const openAddAddr = () => {
    setEditingAddr(null);
    setAddrForm({
      label: "",
      recipient_name: "",
      phone: "",
      address_line1: "",
      address_line2: "",
      district: "",
      sub_district: "",
      province: "",
      postal_code: "",
      is_default: false,
    });
    setAddrModal("add");
  };

  const totalPoints = balances.reduce((s, b) => s + b.balance, 0);

  if (!loggedIn) {
    return (
      <div className="pb-20">
        <div className="bg-gradient-to-br from-[#1976d2] to-[#1557b0] text-white px-5 pt-12 pb-6 rounded-b-[24px]">
          <h1 className="text-[22px] font-semibold">Profile</h1>
        </div>
        <div className="px-5 mt-10 text-center">
          <p className="text-[14px] text-[var(--on-surface-variant)] mb-4">กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</p>
          <Link
            href="/login"
            className="inline-block h-[44px] px-8 leading-[44px] bg-[#1976d2] text-white rounded-[var(--radius-xl)] text-[14px] font-medium"
          >
            เข้าสู่ระบบ
          </Link>
          <Link
            href="/register"
            className="block mt-3 text-[14px] text-[#1976d2]"
          >
            ลงทะเบียนสมาชิก
          </Link>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-gradient-to-br from-[#1976d2] to-[#1557b0] text-white px-5 pt-12 pb-8 rounded-b-[24px]">
        <h1 className="text-[22px] font-semibold">Profile</h1>

        {/* Profile card */}
        <div className="mt-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-[24px] font-bold overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              (profile?.display_name || profile?.first_name || user?.user_id)?.[0]?.toUpperCase() || "?"
            )}
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-medium">
              {profile?.display_name || profile?.first_name || `User ${user?.user_id?.slice(0, 8)}`}
            </p>
            <p className="text-[12px] opacity-70 mt-0.5">{profile?.phone || "-"}</p>
            {profile?.phone_verified && (
              <span className="inline-flex items-center gap-1 mt-1 text-[11px] text-[var(--success-light)]">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
                ยืนยันแล้ว
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 bg-white/15 backdrop-blur rounded-[var(--radius-md)] p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] opacity-70">คะแนนสะสม</p>
            <p className="text-[24px] font-bold">{totalPoints.toLocaleString()}</p>
          </div>
          <Link
            href="/rewards"
            className="h-[32px] px-4 leading-[32px] bg-white/20 rounded-[var(--radius-xl)] text-[12px] font-medium"
          >
            แลกรางวัล
          </Link>
        </div>
      </div>

      <div className="px-5 mt-6 space-y-6">
        {/* Edit profile form */}
        <div className="bg-white rounded-[var(--radius-lg)] elevation-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
            <h2 className="text-[15px] font-medium text-[var(--on-surface)]">แก้ไขโปรไฟล์</h2>
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="text-[13px] text-[#1976d2] font-medium"
              >
                แก้ไข
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="text-[13px] text-[var(--on-surface-variant)]"
              >
                ยกเลิก
              </button>
            )}
          </div>
          {editing ? (
            <form onSubmit={handleSaveProfile} className="p-4 space-y-3">
              {error && (
                <div className="p-2 bg-[var(--error-light)] rounded text-[12px] text-[var(--error)]">{error}</div>
              )}
              <div>
                <label className="block text-[11px] text-[var(--on-surface-variant)] mb-1">ชื่อ</label>
                <input
                  type="text"
                  value={editForm.first_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))}
                  className={inputClass}
                  placeholder="ชื่อจริง"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--on-surface-variant)] mb-1">นามสกุล</label>
                <input
                  type="text"
                  value={editForm.last_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))}
                  className={inputClass}
                  placeholder="นามสกุล"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--on-surface-variant)] mb-1">ชื่อแสดง</label>
                <input
                  type="text"
                  value={editForm.display_name}
                  onChange={(e) => setEditForm((f) => ({ ...f, display_name: e.target.value }))}
                  className={inputClass}
                  placeholder="ชื่อที่แสดง"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--on-surface-variant)] mb-1">วันเกิด</label>
                <input
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm((f) => ({ ...f, birth_date: e.target.value }))}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-[11px] text-[var(--on-surface-variant)] mb-1">เพศ</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm((f) => ({ ...f, gender: e.target.value }))}
                  className={inputClass}
                >
                  <option value="">-- เลือก --</option>
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[44px] bg-[#1976d2] text-white rounded-[var(--radius-xl)] text-[14px] font-medium disabled:opacity-50"
              >
                {loading ? "กำลังบันทึก..." : "บันทึก"}
              </button>
            </form>
          ) : (
            <div className="p-4 text-[14px] text-[var(--on-surface-variant)] space-y-1">
              <p>ชื่อ: {profile?.first_name} {profile?.last_name}</p>
              <p>วันเกิด: {profile?.birth_date || "-"}</p>
              <p>เพศ: {profile?.gender === "male" ? "ชาย" : profile?.gender === "female" ? "หญิง" : profile?.gender || "-"}</p>
            </div>
          )}
        </div>

        {/* Addresses */}
        <div className="bg-white rounded-[var(--radius-lg)] elevation-1 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--outline-variant)]">
            <h2 className="text-[15px] font-medium text-[var(--on-surface)]">ที่อยู่</h2>
            <button
              onClick={openAddAddr}
              className="text-[13px] text-[#1976d2] font-medium flex items-center gap-1"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"> <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /> </svg>
              เพิ่ม
            </button>
          </div>
          <div className="divide-y divide-[var(--outline-variant)]">
            {addresses.length === 0 ? (
              <div className="p-6 text-center text-[13px] text-[var(--on-surface-variant)]">
                ยังไม่มีที่อยู่ <button onClick={openAddAddr} className="text-[#1976d2] ml-1">เพิ่มที่อยู่</button>
              </div>
            ) : (
              addresses.map((a) => (
                <div key={a.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[14px] font-medium text-[var(--on-surface)]">{a.label}</p>
                      <p className="text-[12px] text-[var(--on-surface-variant)] mt-0.5">{a.recipient_name} · {a.phone}</p>
                      <p className="text-[12px] text-[var(--on-surface-variant)]">{a.address_line1}</p>
                      {a.is_default && (
                        <span className="inline-block mt-1 text-[10px] bg-[#1976d2]/20 text-[#1976d2] px-2 py-0.5 rounded">ค่าเริ่มต้น</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => openEditAddr(a)} className="text-[12px] text-[#1976d2]">แก้ไข</button>
                      <button onClick={() => handleDeleteAddress(a.id)} className="text-[12px] text-[var(--error)]">ลบ</button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Menu links */}
        <div className="bg-white rounded-[var(--radius-lg)] elevation-1 overflow-hidden">
          <Link href="/history" className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--outline-variant)] active:bg-[var(--surface-container)]">
            <svg viewBox="0 0 24 24" fill="var(--on-surface-variant)" className="w-5 h-5">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            <span className="text-[14px] text-[var(--on-surface)] flex-1">ประวัติคะแนน</span>
            <svg viewBox="0 0 24 24" fill="var(--on-surface-variant)" className="w-4 h-4 opacity-50">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </Link>
          <Link href="/history/redeems" className="flex items-center gap-3 px-4 py-3.5 active:bg-[var(--surface-container)]">
            <svg viewBox="0 0 24 24" fill="var(--on-surface-variant)" className="w-5 h-5">
              <path d="M19 14V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zm-9-1c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-6v11c0 1.1-.9 2-2 2H4v-2h17V7h2z" />
            </svg>
            <span className="text-[14px] text-[var(--on-surface)] flex-1">ประวัติการแลก</span>
            <svg viewBox="0 0 24 24" fill="var(--on-surface-variant)" className="w-4 h-4 opacity-50">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </Link>
        </div>

        <button
          onClick={logout}
          className="w-full h-[48px] bg-white rounded-[var(--radius-lg)] elevation-1 text-[var(--error)] text-[14px] font-medium flex items-center justify-center gap-2 active:bg-[var(--error-light)]"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
          </svg>
          ออกจากระบบ
        </button>
      </div>

      {/* Address modal */}
      {addrModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-t-[24px] sm:rounded-[var(--radius-lg)] p-6">
            <h3 className="text-[18px] font-semibold text-[var(--on-surface)] mb-4">
              {addrModal === "add" ? "เพิ่มที่อยู่" : "แก้ไขที่อยู่"}
            </h3>
            <form onSubmit={handleSaveAddress} className="space-y-3">
              {error && <div className="p-2 bg-[var(--error-light)] rounded text-[12px] text-[var(--error)]">{error}</div>}
              <input type="text" placeholder="ป้ายชื่อ (เช่น บ้าน, ที่ทำงาน)" value={addrForm.label} onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))} className={inputClass} required />
              <input type="text" placeholder="ชื่อผู้รับ" value={addrForm.recipient_name} onChange={(e) => setAddrForm((f) => ({ ...f, recipient_name: e.target.value }))} className={inputClass} required />
              <input type="tel" placeholder="เบอร์โทร" value={addrForm.phone} onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} required />
              <input type="text" placeholder="ที่อยู่บรรทัด 1" value={addrForm.address_line1} onChange={(e) => setAddrForm((f) => ({ ...f, address_line1: e.target.value }))} className={inputClass} required />
              <input type="text" placeholder="ที่อยู่บรรทัด 2 (ไม่บังคับ)" value={addrForm.address_line2} onChange={(e) => setAddrForm((f) => ({ ...f, address_line2: e.target.value }))} className={inputClass} />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" placeholder="ตำบล/แขวง" value={addrForm.sub_district} onChange={(e) => setAddrForm((f) => ({ ...f, sub_district: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="อำเภอ/เขต" value={addrForm.district} onChange={(e) => setAddrForm((f) => ({ ...f, district: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="จังหวัด" value={addrForm.province} onChange={(e) => setAddrForm((f) => ({ ...f, province: e.target.value }))} className={inputClass} />
                <input type="text" placeholder="รหัสไปรษณีย์" value={addrForm.postal_code} onChange={(e) => setAddrForm((f) => ({ ...f, postal_code: e.target.value }))} className={inputClass} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={addrForm.is_default} onChange={(e) => setAddrForm((f) => ({ ...f, is_default: e.target.checked }))} className="accent-[#1976d2]" />
                <span className="text-[13px]">ตั้งเป็นที่อยู่หลัก</span>
              </label>
              <div className="flex gap-3 mt-4">
                <button type="button" onClick={() => { setAddrModal(null); setEditingAddr(null); }} className="flex-1 h-[44px] border border-[var(--outline)] rounded-[var(--radius-xl)] text-[14px]">ยกเลิก</button>
                <button type="submit" disabled={loading} className="flex-1 h-[44px] bg-[#1976d2] text-white rounded-[var(--radius-xl)] text-[14px] font-medium disabled:opacity-50">{loading ? "..." : "บันทึก"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
