"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface BrandingSettings {
  logo_url: string;
  favicon_url: string;
  brand_name: string;
  primary_color: string;
  accent_color: string;
  bg_color: string;
  header_bg: string;
  custom_css: string;
  welcome_text: string;
  footer_text: string;
}

const defaultBranding: BrandingSettings = {
  logo_url: "",
  favicon_url: "",
  brand_name: "",
  primary_color: "#1976d2",
  accent_color: "#ff9800",
  bg_color: "#ffffff",
  header_bg: "#1976d2",
  custom_css: "",
  welcome_text: "",
  footer_text: "",
};

export default function BrandingPage() {
  const [form, setForm] = useState<BrandingSettings>(defaultBranding);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fetchBranding = async () => {
    try {
      const data = await api.get<BrandingSettings>("/api/v1/branding");
      setForm({ ...defaultBranding, ...data });
    } catch {
      setForm(defaultBranding);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const data = await api.put<BrandingSettings>("/api/v1/branding", form);
      setForm({ ...defaultBranding, ...data });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  const textareaClass =
    "w-full px-4 py-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none resize-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  const cssTextareaClass =
    "w-full px-4 py-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[13px] font-mono text-[var(--md-on-surface)] bg-transparent outline-none resize-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200 min-h-[180px]";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
          Branding
        </h1>
        <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
          ตั้งค่าแบรนด์ของ tenant — โลโก้ สี ข้อความ
        </p>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <form onSubmit={handleSave} className="flex-1 max-w-[640px] space-y-6">
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6">
            <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
              Identity
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  brand_name
                </label>
                <input
                  type="text"
                  value={form.brand_name}
                  onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                  className={fieldClass}
                  placeholder="Brand Name"
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  logo_url
                </label>
                <input
                  type="url"
                  value={form.logo_url}
                  onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                  className={fieldClass}
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  favicon_url
                </label>
                <input
                  type="url"
                  value={form.favicon_url}
                  onChange={(e) => setForm({ ...form, favicon_url: e.target.value })}
                  className={fieldClass}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6">
            <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
              Colors
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  primary_color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className="w-12 h-[48px] p-1 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.primary_color}
                    onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  accent_color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.accent_color}
                    onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                    className="w-12 h-[48px] p-1 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.accent_color}
                    onChange={(e) => setForm({ ...form, accent_color: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  bg_color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.bg_color}
                    onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                    className="w-12 h-[48px] p-1 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.bg_color}
                    onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  header_bg
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={form.header_bg}
                    onChange={(e) => setForm({ ...form, header_bg: e.target.value })}
                    className="w-12 h-[48px] p-1 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={form.header_bg}
                    onChange={(e) => setForm({ ...form, header_bg: e.target.value })}
                    className={fieldClass}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6">
            <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
              Content
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  welcome_text
                </label>
                <textarea
                  value={form.welcome_text}
                  onChange={(e) => setForm({ ...form, welcome_text: e.target.value })}
                  className={textareaClass}
                  rows={4}
                  placeholder="Welcome message..."
                />
              </div>
              <div>
                <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                  footer_text
                </label>
                <textarea
                  value={form.footer_text}
                  onChange={(e) => setForm({ ...form, footer_text: e.target.value })}
                  className={textareaClass}
                  rows={3}
                  placeholder="Footer text..."
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6">
            <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
              Advanced
            </h2>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                custom_css
              </label>
              <textarea
                value={form.custom_css}
                onChange={(e) => setForm({ ...form, custom_css: e.target.value })}
                className={cssTextareaClass}
                placeholder=".my-class { color: red; }"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="
                h-[40px] px-6 bg-[var(--md-primary)] text-white
                rounded-[var(--md-radius-xl)] text-[14px] font-medium
                tracking-[0.1px]
                hover:bg-[var(--md-primary-dark)]
                disabled:opacity-60 disabled:cursor-not-allowed
                active:scale-[0.98] transition-all duration-200
              "
            >
              {saving ? "Saving..." : "Save"}
            </button>
            {saved && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-[var(--md-success)] font-medium">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Saved
              </span>
            )}
          </div>
        </form>

        <div className="xl:w-[360px] flex-shrink-0">
          <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 sticky top-8">
            <h3 className="text-[14px] font-medium text-[var(--md-on-surface-variant)] mb-4 tracking-[0.4px] uppercase">
              Preview
            </h3>
            <div
              className="rounded-[var(--md-radius-lg)] overflow-hidden border border-[var(--md-outline-variant)]"
              style={{ backgroundColor: form.bg_color || "#ffffff" }}
            >
              <div
                className="px-4 py-3 flex items-center gap-3"
                style={{ backgroundColor: form.header_bg || form.primary_color || "#1976d2" }}
              >
                {form.logo_url ? (
                  <img
                    src={form.logo_url}
                    alt="Logo"
                    className="h-8 w-auto object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-[var(--md-radius-sm)] flex items-center justify-center text-white text-[12px] font-medium"
                    style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                  >
                    ?
                  </div>
                )}
                <span className="text-white font-medium text-[14px] truncate">
                  {form.brand_name || "Brand Name"}
                </span>
              </div>
              <div className="p-4 space-y-4">
                <div
                  className="rounded-[var(--md-radius-sm)] p-4"
                  style={{
                    backgroundColor: form.accent_color || "#ff9800",
                    color: "#ffffff",
                  }}
                >
                  <p className="text-[12px] font-medium opacity-90 mb-1">Sample Card</p>
                  <p className="text-[14px]">
                    {form.welcome_text || "Welcome text will appear here"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
