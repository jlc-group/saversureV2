"use client";

import { useEffect, useState, useRef } from "react";
import { api } from "@/lib/api";
import { FileUpload } from "@/components/ui/file-upload";
import toast from "react-hot-toast";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  image_url: string | null;
  points_per_scan: number;
  status: string;
  created_at: string;
}

interface ImportResult {
  total?: number;
  imported?: number;
  skipped?: number;
  errors?: string[];
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const emptyForm = { name: "", sku: "", description: "", image_url: "", points_per_scan: 1 };
  const [form, setForm] = useState(emptyForm);
  const [uploadingImage, setUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ data: Product[]; total: number }>("/api/v1/products");
      setProducts(data.data || []);
      setTotal(data.total || 0);
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
        await api.patch(`/api/v1/products/${editId}`, form);
      } else {
        await api.post("/api/v1/products", form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      toast.error(msg);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({
      name: p.name,
      sku: p.sku || "",
      description: p.description || "",
      image_url: p.image_url || "",
      points_per_scan: p.points_per_scan,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleToggleStatus = async (p: Product) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    setActionId(p.id);
    try {
      await api.patch(`/api/v1/products/${p.id}`, { status: newStatus });
      fetchData();
    } catch {
      toast.error("Failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/products/${id}`);
      fetchData();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  const fieldClass =
    "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            Products
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            {total} products
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="h-[40px] px-5 border border-[var(--md-outline)] text-[var(--md-on-surface)] rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-surface-dim)] transition-all flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
            Import CSV
          </button>
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
            {showForm ? (
              "Cancel"
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Add Product
              </>
            )}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-2 p-6 mb-6">
          <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-4">
            {editId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">ชื่อสินค้า *</label>
              <input
                type="text"
                placeholder="เช่น จุฬาเฮิร์บ เรด ออเร้นจ์ กลูต้า บูสเตอร์ เซรั่ม"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClass}
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">รหัสสินค้า (SKU)</label>
              <input
                type="text"
                placeholder="เช่น BOX-L7-6Gx6"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className={fieldClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">รายละเอียดสินค้า</label>
              <input
                type="text"
                placeholder="ชื่อภาษาอังกฤษ, ราคา, ขนาด ฯลฯ"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={fieldClass}
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">รูปสินค้า</label>
              <div className="flex items-start gap-3">
                {form.image_url ? (
                  <div className="relative w-[80px] h-[80px] rounded-[var(--md-radius-md)] overflow-hidden border border-[var(--md-outline-variant)] flex-shrink-0">
                    <img src={form.image_url} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image_url: "" })}
                      className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[11px] hover:bg-black/80"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-[80px] h-[80px] rounded-[var(--md-radius-md)] border-2 border-dashed border-[var(--md-outline-variant)] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[var(--md-on-surface-variant)] opacity-40">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    disabled={uploadingImage}
                    onClick={() => imageInputRef.current?.click()}
                    className="h-[36px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[13px] font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-dim)] transition-all disabled:opacity-50"
                  >
                    {uploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                  </button>
                  <span className="text-[11px] text-[var(--md-on-surface-variant)]">JPEG, PNG, WebP ไม่เกิน 10MB</span>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 10 * 1024 * 1024) {
                      toast.error("ไฟล์ต้องไม่เกิน 10MB");
                      return;
                    }
                    setUploadingImage(true);
                    try {
                      const fd = new FormData();
                      fd.append("file", file);
                      const result = await api.uploadForm<{ url: string }>("/api/v1/upload/image", fd);
                      setForm((prev) => ({ ...prev, image_url: result.url }));
                    } catch {
                      toast.error("อัปโหลดรูปล้มเหลว");
                    } finally {
                      setUploadingImage(false);
                      e.target.value = "";
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5">แต้มต่อการสแกน</label>
              <input
                type="number"
                placeholder="1"
                value={form.points_per_scan}
                min={1}
                onChange={(e) => setForm({ ...form, points_per_scan: parseInt(e.target.value) || 1 })}
                className={fieldClass}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-[48px] px-8 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all"
              >
                {editId ? "บันทึกการแก้ไข" : "สร้างสินค้า"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Product
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                SKU
              </th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Points/Scan
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Status
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Created
              </th>
              <th className="text-right px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">
                  <svg className="animate-spin w-5 h-5 mx-auto" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">
                  No products yet
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-9 h-9 rounded-[var(--md-radius-sm)] object-cover"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-[var(--md-radius-sm)] bg-[var(--md-surface-container)] flex items-center justify-center">
                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-[var(--md-on-surface-variant)]">
                            <path d="M18.36 9l.6 3H5.04l.6-3h12.72M20 4H4v2h16V4zm0 3H4l-1 5v2h1v6h10v-6h4v6h2v-6h1v-2l-1-5zM6 18v-4h6v4H6z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="text-[13px] font-medium text-[var(--md-on-surface)]">{p.name}</p>
                        {p.description && (
                          <p className="text-[11px] text-[var(--md-on-surface-variant)] truncate max-w-[200px]">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[12px] text-[var(--md-on-surface-variant)]">
                    {p.sku || "—"}
                  </td>
                  <td className="px-5 py-3 text-right text-[14px] font-bold text-[var(--md-primary)]">
                    {p.points_per_scan}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${
                        p.status === "active"
                          ? "bg-[var(--md-success-light)] text-[var(--md-success)]"
                          : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleEdit(p)}
                        className="h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        disabled={actionId === p.id}
                        className={`h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] transition-all disabled:opacity-50 ${
                          p.status === "active"
                            ? "text-[var(--md-warning)] bg-[var(--md-warning-light)]"
                            : "text-[var(--md-success)] bg-[var(--md-success-light)]"
                        }`}
                      >
                        {p.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={actionId === p.id}
                        className="h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] text-[var(--md-error)] bg-[var(--md-error-light)] hover:opacity-80 transition-all disabled:opacity-50"
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

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] p-6 w-full max-w-md mx-4 shadow-xl">
            <h3 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-4">Import Products (CSV)</h3>
            {!importResult ? (
              <>
                <FileUpload
                  endpoint="/api/v1/products/import"
                  accept=".csv"
                  label="เลือกไฟล์ CSV"
                  buttonText="เลือกไฟล์"
                  onUpload={(result) => {
                    setImportResult({
                      total: result.total as number,
                      imported: result.imported as number,
                      skipped: result.skipped as number,
                      errors: Array.isArray(result.errors) ? result.errors : [],
                    });
                    fetchData();
                  }}
                />
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResult(null);
                    }}
                    className="h-[40px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-xl)] text-[14px] font-medium text-[var(--md-on-surface)] hover:bg-[var(--md-surface-dim)]"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-[var(--md-radius-md)] bg-[var(--md-surface-container)]">
                    <p className="text-[11px] text-[var(--md-on-surface-variant)]">Total</p>
                    <p className="text-[18px] font-bold text-[var(--md-on-surface)]">{importResult.total ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-[var(--md-radius-md)] bg-[var(--md-success-light)]">
                    <p className="text-[11px] text-[var(--md-success)]">Imported</p>
                    <p className="text-[18px] font-bold text-[var(--md-success)]">{importResult.imported ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-[var(--md-radius-md)] bg-[var(--md-surface-container)]">
                    <p className="text-[11px] text-[var(--md-on-surface-variant)]">Skipped</p>
                    <p className="text-[18px] font-bold text-[var(--md-on-surface)]">{importResult.skipped ?? 0}</p>
                  </div>
                  <div className="p-3 rounded-[var(--md-radius-md)] bg-[var(--md-warning-light)]">
                    <p className="text-[11px] text-[var(--md-warning)]">Errors</p>
                    <p className="text-[18px] font-bold text-[var(--md-warning)]">{importResult.errors?.length ?? 0}</p>
                  </div>
                </div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="max-h-[120px] overflow-y-auto">
                    <p className="text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1">Error details:</p>
                    <ul className="text-[12px] text-[var(--md-error)] space-y-0.5">
                      {importResult.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setShowImportModal(false);
                      setImportResult(null);
                    }}
                    className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)]"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
