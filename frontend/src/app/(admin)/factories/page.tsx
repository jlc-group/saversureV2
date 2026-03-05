"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Factory {
  id: string;
  name: string;
  code: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  address: string | null;
  status: string;
  created_at: string;
}

export default function FactoriesPage() {
  const [factories, setFactories] = useState<Factory[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);

  const emptyForm = {
    name: "",
    code: "",
    contact_name: "",
    contact_phone: "",
    contact_email: "",
    address: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ data: Factory[]; total: number }>("/api/v1/factories");
      setFactories(data.data || []);
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
        await api.patch(`/api/v1/factories/${editId}`, form);
      } else {
        await api.post("/api/v1/factories", form);
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      alert(msg);
    }
  };

  const handleEdit = (f: Factory) => {
    setForm({
      name: f.name,
      code: f.code || "",
      contact_name: f.contact_name || "",
      contact_phone: f.contact_phone || "",
      contact_email: f.contact_email || "",
      address: f.address || "",
    });
    setEditId(f.id);
    setShowForm(true);
  };

  const handleToggleStatus = async (f: Factory) => {
    const newStatus = f.status === "active" ? "inactive" : "active";
    setActionId(f.id);
    try {
      await api.patch(`/api/v1/factories/${f.id}`, { status: newStatus });
      fetchData();
    } catch {
      alert("Failed");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this factory?")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/factories/${id}`);
      fetchData();
    } catch {
      alert("Failed to delete");
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
            Factories
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            {total} registered factories
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
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              New Factory
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-2 p-6 mb-6">
          <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-4">
            {editId ? "Edit Factory" : "New Factory"}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Factory Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fieldClass}
              required
            />
            <input
              type="text"
              placeholder="Factory Code (optional)"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              className={fieldClass}
            />
            <input
              type="text"
              placeholder="Contact Name"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className={fieldClass}
            />
            <input
              type="text"
              placeholder="Contact Phone"
              value={form.contact_phone}
              onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
              className={fieldClass}
            />
            <input
              type="email"
              placeholder="Contact Email"
              value={form.contact_email}
              onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
              className={fieldClass}
            />
            <input
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className={fieldClass}
            />
            <div className="col-span-2 flex justify-end">
              <button
                type="submit"
                className="h-[48px] px-8 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all"
              >
                {editId ? "Save Changes" : "Create Factory"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Factory
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Code
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Contact
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
            ) : factories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">
                  No factories yet
                </td>
              </tr>
            ) : (
              factories.map((f) => (
                <tr
                  key={f.id}
                  className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-[13px] font-medium text-[var(--md-on-surface)]">{f.name}</p>
                      {f.address && (
                        <p className="text-[11px] text-[var(--md-on-surface-variant)] truncate max-w-[200px]">
                          {f.address}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-[12px] font-medium text-[var(--md-on-surface)]">
                    {f.code || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div>
                      <p className="text-[12px] text-[var(--md-on-surface)]">{f.contact_name || "—"}</p>
                      {f.contact_phone && (
                        <p className="text-[11px] text-[var(--md-on-surface-variant)]">{f.contact_phone}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${
                        f.status === "active"
                          ? "bg-[var(--md-success-light)] text-[var(--md-success)]"
                          : "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]"
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-1 justify-end">
                      <button
                        onClick={() => handleEdit(f)}
                        className="h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] text-[var(--md-primary)] bg-[var(--md-primary-light)] hover:opacity-80 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(f)}
                        disabled={actionId === f.id}
                        className={`h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] transition-all disabled:opacity-50 ${
                          f.status === "active"
                            ? "text-[var(--md-warning)] bg-[var(--md-warning-light)]"
                            : "text-[var(--md-success)] bg-[var(--md-success-light)]"
                        }`}
                      >
                        {f.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDelete(f.id)}
                        disabled={actionId === f.id}
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
    </div>
  );
}
