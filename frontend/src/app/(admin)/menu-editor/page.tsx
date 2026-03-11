"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";

interface MenuItem {
  icon: string;
  label: string;
  link: string;
  visible: boolean;
  badge_type?: string;
}

interface NavMenuData {
  id?: string;
  menu_type: string;
  items: MenuItem[];
}

const MENU_TYPES = [
  { value: "bottom_nav", label: "Bottom Navigation" },
  { value: "drawer", label: "Drawer / Side Menu" },
  { value: "header", label: "Header" },
];

const ICON_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "scan", label: "Scan" },
  { value: "gift", label: "Gift" },
  { value: "history", label: "History" },
  { value: "user", label: "User" },
  { value: "news", label: "News" },
  { value: "star", label: "Star" },
  { value: "heart", label: "Heart" },
  { value: "trophy", label: "Trophy" },
  { value: "settings", label: "Settings" },
  { value: "bell", label: "Bell" },
  { value: "support", label: "Support" },
];

const DEFAULT_BOTTOM_NAV: MenuItem[] = [
  { icon: "home", label: "หน้าหลัก", link: "/", visible: true },
  { icon: "scan", label: "สแกน", link: "/scan", visible: true },
  { icon: "history", label: "ประวัติ", link: "/history", visible: true },
  { icon: "user", label: "บัญชี", link: "/profile", visible: true },
];

export default function MenuEditorPage() {
  const [activeType, setActiveType] = useState("bottom_nav");
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const fetchMenu = useCallback(async (menuType: string) => {
    setLoading(true);
    setDirty(false);
    try {
      const data = await api.get<NavMenuData>(`/api/v1/nav-menus/${menuType}`);
      setItems(data.items?.length ? data.items : []);
    } catch {
      if (menuType === "bottom_nav") {
        setItems(DEFAULT_BOTTOM_NAV);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenu(activeType);
  }, [activeType, fetchMenu]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.put("/api/v1/nav-menus", {
        menu_type: activeType,
        items,
      });
      setSaved(true);
      setDirty(false);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { icon: "star", label: "New Item", link: "/", visible: true },
    ]);
    setDirty(true);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setDirty(true);
  };

  const updateItem = (idx: number, key: string, value: unknown) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: value } : item)),
    );
    setDirty(true);
  };

  const moveItem = (idx: number, direction: -1 | 1) => {
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
    setDirty(true);
  };

  const fieldClass =
    "w-full h-[36px] px-2.5 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[12px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            Menu Editor
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            จัดการเมนู navigation ของ consumer frontend
          </p>
        </div>
        <div className="flex items-center gap-3">
          {dirty && (
            <span className="text-[12px] text-[var(--md-warning)] font-medium">
              ● มีการเปลี่ยนแปลง
            </span>
          )}
          {saved && (
            <span className="text-[12px] text-[var(--md-success)] font-medium">
              ✓ บันทึกแล้ว
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Menu Type Tabs */}
      <div className="flex gap-2 mb-6">
        {MENU_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className={`h-[36px] px-4 rounded-[var(--md-radius-sm)] text-[13px] font-medium transition-all ${
              activeType === t.value
                ? "bg-[var(--md-primary)] text-white"
                : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin w-6 h-6 text-[var(--md-primary)]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6">
          {/* Items List */}
          <div className="flex-1">
            <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-medium text-[var(--md-on-surface)]">
                  Menu Items ({items.length})
                </h2>
                <button
                  onClick={addItem}
                  className="h-[32px] px-3 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-sm)] text-[12px] font-medium"
                >
                  + เพิ่ม
                </button>
              </div>

              {items.length === 0 ? (
                <p className="text-center py-10 text-[var(--md-on-surface-variant)] text-[13px]">
                  ยังไม่มี menu item — กด &quot;+ เพิ่ม&quot; เพื่อเริ่ม
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className={`border rounded-[var(--md-radius-sm)] p-4 transition-all ${
                        item.visible
                          ? "border-[var(--md-outline-variant)] bg-[var(--md-surface)]"
                          : "border-[var(--md-outline-variant)] bg-[var(--md-surface-container)] opacity-60"
                      }`}
                    >
                      <div className="grid grid-cols-4 gap-3">
                        <div>
                          <label className="text-[10px] text-[var(--md-on-surface-variant)] uppercase mb-1 block">
                            Icon
                          </label>
                          <select
                            value={item.icon}
                            onChange={(e) => updateItem(idx, "icon", e.target.value)}
                            className={fieldClass}
                          >
                            {ICON_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--md-on-surface-variant)] uppercase mb-1 block">
                            Label
                          </label>
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => updateItem(idx, "label", e.target.value)}
                            className={fieldClass}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-[var(--md-on-surface-variant)] uppercase mb-1 block">
                            Link
                          </label>
                          <input
                            type="text"
                            value={item.link}
                            onChange={(e) => updateItem(idx, "link", e.target.value)}
                            className={fieldClass}
                          />
                        </div>
                        <div className="flex items-end gap-1.5">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={item.visible}
                              onChange={(e) => updateItem(idx, "visible", e.target.checked)}
                              className="w-3.5 h-3.5 accent-[var(--md-primary)]"
                            />
                            <span className="text-[11px] text-[var(--md-on-surface-variant)]">
                              Visible
                            </span>
                          </label>
                          <button
                            onClick={() => moveItem(idx, -1)}
                            disabled={idx === 0}
                            className="h-[28px] w-[28px] flex items-center justify-center rounded text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] disabled:opacity-30"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveItem(idx, 1)}
                            disabled={idx === items.length - 1}
                            className="h-[28px] w-[28px] flex items-center justify-center rounded text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container)] disabled:opacity-30"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => removeItem(idx)}
                            className="h-[28px] w-[28px] flex items-center justify-center rounded text-[var(--md-error)] hover:bg-[var(--md-error-light)]/20"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="xl:w-[320px] flex-shrink-0">
            <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-5 sticky top-8">
              <h3 className="text-[14px] font-medium text-[var(--md-on-surface)] mb-4">
                Preview
              </h3>
              {activeType === "bottom_nav" && (
                <div className="border border-[var(--md-outline-variant)] rounded-[12px] overflow-hidden">
                  <div className="h-[200px] bg-[var(--md-surface-container)] flex items-center justify-center text-[var(--md-on-surface-variant)] text-[12px]">
                    Page Content
                  </div>
                  <div className="flex items-center justify-around h-[56px] bg-white border-t border-[var(--md-outline-variant)]">
                    {items
                      .filter((i) => i.visible)
                      .map((item, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-0.5">
                          <span className="text-[16px]">
                            {ICON_OPTIONS.find((o) => o.value === item.icon)?.label?.[0] || "●"}
                          </span>
                          <span className="text-[9px] text-[var(--md-on-surface-variant)]">
                            {item.label}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {activeType === "drawer" && (
                <div className="border border-[var(--md-outline-variant)] rounded-[12px] overflow-hidden">
                  <div className="p-3 bg-[var(--md-primary)] text-white text-[12px] font-medium">
                    Menu
                  </div>
                  <div className="p-2">
                    {items
                      .filter((i) => i.visible)
                      .map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-2.5 rounded text-[12px] text-[var(--md-on-surface)] hover:bg-[var(--md-surface-container)]"
                        >
                          <span className="text-[14px]">
                            {ICON_OPTIONS.find((o) => o.value === item.icon)?.label?.[0] || "●"}
                          </span>
                          {item.label}
                        </div>
                      ))}
                  </div>
                </div>
              )}
              {activeType === "header" && (
                <div className="border border-[var(--md-outline-variant)] rounded-[12px] overflow-hidden">
                  <div className="flex items-center justify-between px-4 h-[48px] bg-[var(--md-primary)] text-white">
                    <span className="text-[13px] font-medium">Brand</span>
                    <div className="flex gap-3">
                      {items
                        .filter((i) => i.visible)
                        .map((item, idx) => (
                          <span key={idx} className="text-[10px]">{item.label}</span>
                        ))}
                    </div>
                  </div>
                  <div className="h-[160px] bg-[var(--md-surface-container)] flex items-center justify-center text-[12px] text-[var(--md-on-surface-variant)]">
                    Content
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
