"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface StaffUser {
  id: string;
  email: string | null;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: string;
  created_at: string;
}

const roleOptions = [
  { value: "brand_admin", label: "Brand Admin" },
  { value: "brand_staff", label: "Brand Staff" },
  { value: "factory_user", label: "Factory User" },
  { value: "viewer", label: "Viewer" },
];

const roleStyle: Record<string, string> = {
  super_admin: "bg-[#fce4ec] text-[#c62828]",
  brand_admin: "bg-[var(--md-primary-light)] text-[var(--md-primary)]",
  brand_staff: "bg-[var(--md-info-light)] text-[var(--md-info)]",
  factory_user: "bg-[#fff3e0] text-[#e65100]",
  viewer: "bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]",
};

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "brand_staff",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.get<{ data: StaffUser[]; total: number }>("/api/v1/staff");
      setStaff(data.data || []);
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/v1/staff", form);
      setShowForm(false);
      setForm({ email: "", password: "", first_name: "", last_name: "", role: "brand_staff" });
      fetchData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed";
      alert(msg);
    }
  };

  const handleUpdateRole = async (id: string, role: string) => {
    setActionId(id);
    try {
      await api.patch(`/api/v1/staff/${id}`, { role });
      fetchData();
    } catch {
      alert("Failed to update role");
    } finally {
      setActionId(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    setActionId(id);
    try {
      await api.patch(`/api/v1/staff/${id}`, { status: newStatus });
      fetchData();
    } catch {
      alert("Failed to update");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this staff member? This cannot be undone.")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/staff/${id}`);
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
            Staff Management
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            {total} staff members
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-[40px] px-5 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all flex items-center gap-2"
        >
          {showForm ? (
            "Cancel"
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              Invite Staff
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-xl)] md-elevation-2 p-6 mb-6">
          <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-4">
            Invite New Staff
          </h2>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={fieldClass}
              required
            />
            <input
              type="password"
              placeholder="Password (min 6)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={fieldClass}
              required
              minLength={6}
            />
            <input
              type="text"
              placeholder="First Name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              className={fieldClass}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              className={fieldClass}
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={fieldClass}
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="h-[48px] bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all"
            >
              Create Staff
            </button>
          </form>
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Name
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Email
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Role
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Status
              </th>
              <th className="text-left px-5 py-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Joined
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
            ) : staff.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-[var(--md-on-surface-variant)]">
                  No staff members yet
                </td>
              </tr>
            ) : (
              staff.map((s) => {
                const name = [s.first_name, s.last_name].filter(Boolean).join(" ");
                return (
                  <tr
                    key={s.id}
                    className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors"
                  >
                    <td className="px-5 py-3 text-[13px] font-medium text-[var(--md-on-surface)]">
                      {name || "—"}
                    </td>
                    <td className="px-5 py-3 text-[13px] text-[var(--md-on-surface-variant)]">
                      {s.email || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {s.role === "super_admin" ? (
                        <span className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${roleStyle[s.role]}`}>
                          {s.role.replace("_", " ")}
                        </span>
                      ) : (
                        <select
                          value={s.role}
                          onChange={(e) => handleUpdateRole(s.id, e.target.value)}
                          disabled={actionId === s.id}
                          className="h-[28px] px-2 text-[12px] border border-[var(--md-outline-variant)] rounded-[6px] bg-transparent outline-none focus:border-[var(--md-primary)]"
                        >
                          {roleOptions.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-medium ${
                          s.status === "active"
                            ? "bg-[var(--md-success-light)] text-[var(--md-success)]"
                            : "bg-[var(--md-error-light)] text-[var(--md-error)]"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-[var(--md-on-surface-variant)]">
                      {new Date(s.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      {s.role !== "super_admin" && (
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => handleToggleStatus(s.id, s.status)}
                            disabled={actionId === s.id}
                            className={`h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] transition-all disabled:opacity-50 ${
                              s.status === "active"
                                ? "text-[var(--md-warning)] bg-[var(--md-warning-light)]"
                                : "text-[var(--md-success)] bg-[var(--md-success-light)]"
                            }`}
                          >
                            {s.status === "active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            disabled={actionId === s.id}
                            className="h-[26px] px-2.5 text-[11px] font-medium rounded-[6px] text-[var(--md-error)] bg-[var(--md-error-light)] hover:opacity-80 transition-all disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
