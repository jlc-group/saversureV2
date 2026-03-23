"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface BonusRule {
  id?: string;
  product_id: string | null;
  product_name?: string;
  product_sku?: string;
  currency: string;
  bonus_type: "fixed" | "multiplier";
  bonus_amount: number;
  expires_at: string | null;
  expiry_action: string;
}

interface Promotion {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  apply_to: string;
  status: string;
  approved_by: string | null;
  approved_at: string | null;
  rejection_note: string | null;
  bonus_rules: BonusRule[];
  is_active: boolean;
  created_at: string;
}

interface PointCurrency {
  id: string;
  code: string;
  name: string;
  icon: string;
}

const statusConfig: Record<string, { label: string; cls: string; dot: string }> = {
  draft: { label: "แบบร่าง", cls: "bg-gray-100 text-gray-600", dot: "bg-gray-400" },
  pending_approval: { label: "รออนุมัติ", cls: "bg-amber-50 text-amber-700", dot: "bg-amber-500" },
  approved: { label: "อนุมัติแล้ว", cls: "bg-green-50 text-green-600", dot: "bg-green-500" },
  rejected: { label: "ไม่อนุมัติ", cls: "bg-red-50 text-red-600", dot: "bg-red-500" },
  inactive: { label: "ปิดใช้งาน", cls: "bg-gray-100 text-gray-500", dot: "bg-gray-400" },
};

const expiryLabels: Record<string, string> = { keep: "เก็บถาวร", convert: "แปลงเป็น Point", expire: "หายไป" };

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString("th-TH", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
  } catch { return d; }
}

function fmtDateTime(d: string) {
  try {
    return new Date(d).toLocaleString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return d; }
}

export default function PromotionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [promo, setPromo] = useState<Promotion | null>(null);
  const [currencies, setCurrencies] = useState<PointCurrency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get<Promotion>(`/api/v1/promotions/${id}`),
      api.get<{ data: PointCurrency[] }>("/api/v1/currencies"),
    ]).then(([p, c]) => {
      setPromo(p);
      setCurrencies(c.data || []);
    }).catch((err) => {
      setError(err instanceof Error ? err.message : "ไม่พบโปรโมชั่น");
    }).finally(() => setLoading(false));
  }, [id]);

  const getCurrencyInfo = (code: string) => {
    const c = currencies.find((cr) => cr.code === code);
    return c ? { icon: c.icon, name: c.name } : { icon: "⭐", name: code };
  };

  const si = promo ? (statusConfig[promo.status] || statusConfig.draft) : statusConfig.draft;

  const handleAction = async (action: string, body?: object) => {
    if (!promo) return;
    try {
      await api.post(`/api/v1/promotions/${promo.id}/${action}`, body || {});
      const updated = await api.get<Promotion>(`/api/v1/promotions/${promo.id}`);
      setPromo(updated);
    } catch (err) { toast.error(err instanceof Error ? err.message : `Failed to ${action}`); }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <svg className="animate-spin w-6 h-6 text-[var(--md-primary)]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (error || !promo) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--md-error)] text-[14px]">{error || "ไม่พบโปรโมชั่น"}</p>
        <button onClick={() => router.push("/promotions")} className="mt-4 text-[var(--md-primary)] hover:underline text-[13px]">← กลับหน้ารายการ</button>
      </div>
    );
  }

  const rules = promo.bonus_rules || [];
  const now = new Date();
  const startDate = new Date(promo.start_date);
  const endDate = new Date(promo.end_date);
  const isOngoing = promo.status === "approved" && now >= startDate && now <= endDate;
  const isExpired = now > endDate;

  const pointRules = rules.filter((r) => r.currency === "point" || r.currency === "");
  const currencyRules = rules.filter((r) => r.currency !== "point" && r.currency !== "");

  const productGroups = new Map<string, BonusRule[]>();
  for (const r of rules) {
    const key = r.product_id || "__all__";
    if (!productGroups.has(key)) productGroups.set(key, []);
    productGroups.get(key)!.push(r);
  }

  const btnSmall = "h-[32px] px-4 text-[12px] font-medium rounded-[var(--md-radius-sm)] transition-all";

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push("/promotions")}
        className="inline-flex items-center gap-1 text-[13px] text-[var(--md-on-surface-variant)] hover:text-[var(--md-on-surface)] mb-4 transition-colors"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" /></svg>
        กลับหน้ารายการ
      </button>

      {/* Header card */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[24px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">{promo.name}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium shrink-0 ${si.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${si.dot}`} />
                {si.label}
              </span>
              {isOngoing && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[11px] font-semibold animate-pulse">
                  ● กำลังใช้งาน
                </span>
              )}
            </div>
            {promo.description && (
              <p className="text-[14px] text-[var(--md-on-surface-variant)] mb-3">{promo.description}</p>
            )}

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              <div>
                <span className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">เริ่มต้น</span>
                <p className="font-medium text-[var(--md-on-surface)]">{fmtDate(promo.start_date)}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">สิ้นสุด</span>
                <p className={`font-medium ${isExpired ? "text-[var(--md-error)]" : "text-[var(--md-on-surface)]"}`}>
                  {fmtDate(promo.end_date)} {isExpired && "(หมดอายุแล้ว)"}
                </p>
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">ใช้กับ</span>
                <p className="font-medium text-[var(--md-on-surface)]">
                  {promo.apply_to === "all_products" ? "ทุกสินค้า" : "เลือกรายสินค้า"}
                </p>
              </div>
              {promo.approved_at && (
                <div>
                  <span className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">อนุมัติเมื่อ</span>
                  <p className="font-medium text-[var(--md-on-surface)]">{fmtDateTime(promo.approved_at)}</p>
                </div>
              )}
              <div>
                <span className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)]">สร้างเมื่อ</span>
                <p className="font-medium text-[var(--md-on-surface)]">{fmtDateTime(promo.created_at)}</p>
              </div>
            </div>

            {promo.rejection_note && promo.status === "rejected" && (
              <div className="mt-3 p-3 rounded-[var(--md-radius-sm)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                <p className="text-[12px] font-medium text-[var(--md-error)]">❌ เหตุผลที่ไม่อนุมัติ:</p>
                <p className="text-[13px] text-[var(--md-error)] mt-1">{promo.rejection_note}</p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-2 shrink-0">
            {(promo.status === "draft" || promo.status === "rejected") && (
              <>
                <button onClick={() => router.push("/promotions")} className={`${btnSmall} text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80`}>✏️ แก้ไข</button>
                <button onClick={() => handleAction("submit")} className={`${btnSmall} text-white bg-[var(--md-primary)] hover:opacity-90`}>ส่งอนุมัติ</button>
              </>
            )}
            {promo.status === "pending_approval" && (
              <>
                <button onClick={() => handleAction("approve")} className={`${btnSmall} text-white bg-green-600 hover:bg-green-700`}>อนุมัติ</button>
                <button onClick={() => { const note = prompt("เหตุผลที่ไม่อนุมัติ:"); if (note) handleAction("reject", { note }); }} className={`${btnSmall} text-white bg-[var(--md-error)] hover:opacity-90`}>ไม่อนุมัติ</button>
              </>
            )}
            {promo.status === "approved" && (
              <button onClick={() => handleAction("deactivate")} className={`${btnSmall} text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] hover:bg-[var(--md-surface-container-high)]`}>ปิดใช้งาน</button>
            )}
            {promo.status === "inactive" && (
              <button onClick={() => handleAction("reactivate")} className={`${btnSmall} text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80`}>เปิดใช้งาน</button>
            )}
          </div>
        </div>
      </div>

      {/* Bonus Rules */}
      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-[var(--md-outline-variant)]">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)]">Bonus Rules ({rules.length} rules)</h2>
          <p className="text-[12px] text-[var(--md-on-surface-variant)] mt-0.5">กฎโบนัสที่ใช้กับโปรโมชั่นนี้</p>
        </div>

        {rules.length === 0 ? (
          <div className="px-6 py-10 text-center text-[var(--md-on-surface-variant)]">
            <p className="text-[14px]">ยังไม่มี Bonus Rule</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--md-outline-variant)]">
            {Array.from(productGroups.entries()).map(([key, groupRules]) => {
              const firstRule = groupRules[0];
              const isAllProducts = key === "__all__";

              return (
                <div key={key} className="px-6 py-4">
                  {/* Product header */}
                  <div className="flex items-center gap-2 mb-3">
                    {isAllProducts ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">🌐</span>
                        <span className="text-[13px] font-semibold text-[var(--md-on-surface)]">ทุกสินค้า</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[16px]">📦</span>
                        <div>
                          <p className="text-[13px] font-semibold text-[var(--md-on-surface)]">{firstRule.product_name || "—"}</p>
                          {firstRule.product_sku && (
                            <p className="text-[11px] font-mono text-[var(--md-on-surface-variant)]">{firstRule.product_sku}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rules for this product */}
                  <div className="grid gap-2 ml-7">
                    {groupRules.map((r, i) => {
                      const ci = getCurrencyInfo(r.currency);
                      return (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-[var(--md-radius-md)] bg-[var(--md-surface-container)] text-[13px]">
                          <span className="text-[20px]">{ci.icon}</span>
                          <div className="flex-1">
                            <span className="font-bold text-[var(--md-primary)] text-[15px]">
                              {r.bonus_type === "multiplier" ? `×${r.bonus_amount}` : `+${r.bonus_amount}`}
                            </span>
                            <span className="ml-2 text-[var(--md-on-surface)]">{ci.name}</span>
                            {r.bonus_type === "multiplier" && (
                              <span className="ml-2 text-[11px] text-[var(--md-on-surface-variant)]">(ตัวคูณ)</span>
                            )}
                          </div>
                          {r.currency !== "point" && r.expires_at && (
                            <div className="text-right shrink-0">
                              <p className="text-[11px] text-amber-600">⏰ หมดอายุ {fmtDateTime(r.expires_at)}</p>
                              <p className="text-[10px] text-[var(--md-on-surface-variant)]">เมื่อหมดอายุ: {expiryLabels[r.expiry_action] || r.expiry_action}</p>
                            </div>
                          )}
                          {r.currency !== "point" && !r.expires_at && (
                            <span className="text-[11px] text-green-600 shrink-0">♾️ ไม่หมดอายุ</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pointRules.length > 0 && (
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-5">
            <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-2">Point Bonus</p>
            <div className="space-y-1.5">
              {pointRules.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-[13px]">
                  <span className="text-green-600 font-bold">{r.bonus_type === "multiplier" ? `×${r.bonus_amount}` : `+${r.bonus_amount}`}</span>
                  <span className="text-[var(--md-on-surface-variant)]">🪙 Point</span>
                  {r.product_name && <span className="text-[10px] text-[var(--md-on-surface-variant)]">({r.product_sku || r.product_name})</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {currencyRules.length > 0 && (
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-5">
            <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-2">Currency Bonus</p>
            <div className="space-y-1.5">
              {currencyRules.map((r, i) => {
                const ci = getCurrencyInfo(r.currency);
                return (
                  <div key={i} className="flex items-center gap-2 text-[13px]">
                    <span className="text-purple-600 font-bold">+{r.bonus_amount}</span>
                    <span className="text-[var(--md-on-surface-variant)]">{ci.icon} {ci.name}</span>
                    {r.product_name && <span className="text-[10px] text-[var(--md-on-surface-variant)]">({r.product_sku || r.product_name})</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-5">
          <p className="text-[10px] uppercase tracking-wide text-[var(--md-on-surface-variant)] mb-2">ข้อมูลโปรโมชั่น</p>
          <div className="space-y-1.5 text-[13px]">
            <p><span className="text-[var(--md-on-surface-variant)]">จำนวน Rules:</span> <span className="font-medium">{rules.length}</span></p>
            <p><span className="text-[var(--md-on-surface-variant)]">สินค้าร่วมรายการ:</span> <span className="font-medium">{promo.apply_to === "all_products" ? "ทั้งหมด" : `${productGroups.size - (productGroups.has("__all__") ? 1 : 0)} สินค้า`}</span></p>
            <p><span className="text-[var(--md-on-surface-variant)]">ระยะเวลา:</span> <span className="font-medium">{Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} วัน</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
