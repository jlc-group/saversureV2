"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface PopupItem {
  id: string;
  title: string;
  content: string | null;
  image_url: string | null;
  link_url: string | null;
  trigger_type: string;
  target_pages: string[];
  frequency: string;
  priority: number;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

const TRIGGER_OPTIONS = [
  { value: "on_load", label: "เปิดหน้า" },
  { value: "on_login", label: "หลัง Login" },
  { value: "on_scan", label: "หลังสแกน" },
  { value: "manual", label: "Manual" },
];

const FREQ_OPTIONS = [
  { value: "every_visit", label: "ทุกครั้ง" },
  { value: "once", label: "ครั้งเดียว" },
  { value: "daily", label: "วันละครั้ง" },
];

const PAGE_OPTIONS = ["home", "scan", "rewards", "history", "profile", "news"];

export default function PopupManagerPage() {
  const [items, setItems] = useState<PopupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const emptyForm = {
    title: "",
    content: "",
    image_url: "",
    link_url: "",
    trigger_type: "on_load",
    target_pages: [] as string[],
    frequency: "every_visit",
    priority: 0,
    starts_at: "",
    ends_at: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ data: PopupItem[] }>("/api/v1/popups");
      setItems(data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.patch(`/api/v1/popups/${editId}`, form);
      } else {
        await api.post("/api/v1/popups", form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed");
    }
  };

  const handleEdit = (item: PopupItem) => {
    setForm({
      title: item.title,
      content: item.content || "",
      image_url: item.image_url || "",
      link_url: item.link_url || "",
      trigger_type: item.trigger_type,
      target_pages: item.target_pages || [],
      frequency: item.frequency,
      priority: item.priority,
      starts_at: item.starts_at || "",
      ends_at: item.ends_at || "",
    });
    setEditId(item.id);
    setShowForm(true);
  };

  const handleToggle = async (item: PopupItem) => {
    const newStatus = item.status === "published" ? "draft" : "published";
    setActionId(item.id);
    try {
      await api.patch(`/api/v1/popups/${item.id}`, { status: newStatus });
      fetchData();
    } catch {
      alert("Failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this popup?")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/popups/${id}`);
      fetchData();
    } catch {
      alert("Failed");
    } finally {
      setActionId(null);
    }
  };

  const toggleTargetPage = (page: string) => {
    setForm((prev) => ({
      ...prev,
      target_pages: prev.target_pages.includes(page)
        ? prev.target_pages.filter((p) => p !== page)
        : [...prev.target_pages, page],
    }));
  };

  const fieldClass =
    "w-full h-[40px] px-3 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all";

  const textareaClass =
    "w-full min-h-[80px] px-3 py-2 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[13px] text-[var(--md-on-surface)] bg-transparent outline-none resize-y focus:border-[var(--md-primary)] focus:border-2 transition-all";

  const statusStyle: Record<string, string> = {
    published: "bg-[var(--md-success-light)] text-[var(--md-success)]",
    draft: "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]",
    archived: "bg-[var(--md-error-light)] text-[var(--md-error)]",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            Popup Manager
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            จัดการ popup สำหรับ consumer frontend — {items.length} items
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditId(null);
              setForm(emptyForm);
            } else {
              setShowForm(true);
            }
          }}
          className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all flex items-center gap-2"
        >
          {showForm ? "Cancel" : "+ New Popup"}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-2 p-6 mb-6">
          <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-4">
            {editId ? "Edit Popup" : "New Popup"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Title
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className={textareaClass}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Image URL
              </label>
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Link URL
              </label>
              <input
                type="text"
                value={form.link_url}
                onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Trigger
              </label>
              <select
                value={form.trigger_type}
                onChange={(e) => setForm({ ...form, trigger_type: e.target.value })}
                className={fieldClass}
              >
                {TRIGGER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Frequency
              </label>
              <select
                value={form.frequency}
                onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                className={fieldClass}
              >
                {FREQ_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Priority
              </label>
              <input
                type="number"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: Number(e.target.value) })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Target Pages
              </label>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {PAGE_OPTIONS.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => toggleTargetPage(page)}
                    className={`h-[28px] px-2.5 rounded-[var(--md-radius-sm)] text-[11px] font-medium transition-all ${
                      form.target_pages.includes(page)
                        ? "bg-[var(--md-primary)] text-white"
                        : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-[var(--md-on-surface-variant)] mt-1">
                ว่าง = แสดงทุกหน้า
              </p>
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Starts At
              </label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div>
              <label className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 block uppercase tracking-[0.4px]">
                Ends At
              </label>
              <input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium"
              >
                {editId ? "Save Changes" : "Create Popup"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-4 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider">Title</th>
              <th className="text-left px-4 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider">Trigger</th>
              <th className="text-left px-4 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider">Pages</th>
              <th className="text-left px-4 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider">Priority</th>
              <th className="text-right px-4 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[var(--md-on-surface-variant)]">
                  Loading...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-[var(--md-on-surface-variant)]">
                  No popups yet
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--md-outline-variant)] last:border-0 hover:bg-[var(--md-surface-container)]"
                >
                  <td className="px-4 py-3">
                    <p className="text-[13px] font-medium text-[var(--md-on-surface)]">{item.title}</p>
                    {item.content && (
                      <p className="text-[11px] text-[var(--md-on-surface-variant)] mt-0.5 line-clamp-1">
                        {item.content}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                    {TRIGGER_OPTIONS.find((o) => o.value === item.trigger_type)?.label || item.trigger_type}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.target_pages.length === 0 ? (
                        <span className="text-[11px] text-[var(--md-on-surface-variant)]">ทุกหน้า</span>
                      ) : (
                        item.target_pages.map((p) => (
                          <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]">
                            {p}
                          </span>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${statusStyle[item.status] || ""}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                    {item.priority}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(item)}
                        className="h-[28px] px-2.5 text-[11px] font-medium text-[var(--md-primary)] hover:bg-[var(--md-primary-light)]/20 rounded-[var(--md-radius-sm)] transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggle(item)}
                        disabled={actionId === item.id}
                        className="h-[28px] px-2.5 text-[11px] font-medium text-[var(--md-on-surface-variant)] hover:bg-[var(--md-surface-container-high)] rounded-[var(--md-radius-sm)] transition-all disabled:opacity-50"
                      >
                        {item.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={actionId === item.id}
                        className="h-[28px] px-2.5 text-[11px] font-medium text-[var(--md-error)] hover:bg-[var(--md-error-light)]/20 rounded-[var(--md-radius-sm)] transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
