"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface APIKey {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  last_used_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
}

interface CreateResponse {
  id: string;
  name: string;
  key_prefix: string;
  raw_key: string;
}

const SCOPE_OPTIONS = ["scan", "redeem", "points", "users"];

export default function APIKeysPage() {
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rawKeyModal, setRawKeyModal] = useState<CreateResponse | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<APIKey | null>(null);

  const [form, setForm] = useState({
    name: "",
    scopes: [] as string[],
    expires_at: "",
  });

  const fieldClass =
    "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

  const fetchKeys = async () => {
    try {
      const data = await api.get<{ data: APIKey[] }>("/api/v1/api-keys");
      setKeys(data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        scopes: form.scopes,
        expires_at: form.expires_at || null,
      };
      const res = await api.post<CreateResponse>("/api/v1/api-keys", payload);
      setShowForm(false);
      setForm({ name: "", scopes: [], expires_at: "" });
      setRawKeyModal(res);
      fetchKeys();
    } catch {
      alert("Failed to create API key");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleScope = (scope: string) => {
    setForm((f) => ({
      ...f,
      scopes: f.scopes.includes(scope) ? f.scopes.filter((s) => s !== scope) : [...f.scopes, scope],
    }));
  };

  const handleRevoke = async () => {
    if (!revokeTarget) return;
    setActionId(revokeTarget.id);
    try {
      await api.patch(`/api/v1/api-keys/${revokeTarget.id}/revoke`, {});
      setRevokeTarget(null);
      fetchKeys();
    } catch {
      alert("Failed to revoke");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this API key? This cannot be undone.")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/api-keys/${id}`);
      fetchKeys();
    } catch {
      alert("Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  const copyRawKey = () => {
    if (rawKeyModal?.raw_key) {
      navigator.clipboard.writeText(rawKeyModal.raw_key);
    }
  };

  const formatDate = (s: string | null) =>
    s ? new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            API Keys
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            จัดการ API keys สำหรับการเชื่อมต่อภายนอก
          </p>
        </div>
        <button
          onClick={() => (showForm ? setShowForm(false) : setShowForm(true))}
          className="inline-flex items-center gap-2 h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] active:scale-[0.98] transition-all duration-200"
        >
          {showForm ? (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
              Create API Key
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
            Create API Key
          </h2>
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={fieldClass}
                placeholder="e.g. Production API"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                Scopes
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                {SCOPE_OPTIONS.map((scope) => (
                  <label
                    key={scope}
                    className="flex items-center gap-2 cursor-pointer text-[14px] text-[var(--md-on-surface)]"
                  >
                    <input
                      type="checkbox"
                      checked={form.scopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="w-4 h-4 rounded border-[var(--md-outline)] text-[var(--md-primary)] focus:ring-[var(--md-primary)]"
                    />
                    {scope}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                Expires At (optional)
              </label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className={fieldClass}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 active:scale-[0.98] transition-all duration-200"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </form>
        </div>
      )}

      {rawKeyModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRawKeyModal(null)}
        >
          <div
            className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 max-w-[480px] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-2">
              API Key Created
            </h2>
            <p className="text-[14px] text-[var(--md-warning)] mb-4">
              This key will only be shown once. Copy it now!
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                readOnly
                value={rawKeyModal.raw_key}
                className={`${fieldClass} flex-1 font-mono text-[13px]`}
              />
              <button
                onClick={copyRawKey}
                className="h-[48px] px-4 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-sm)] text-[14px] font-medium hover:bg-[var(--md-primary-dark)] transition-all"
              >
                Copy
              </button>
            </div>
            <button
              onClick={() => setRawKeyModal(null)}
              className="h-[40px] px-6 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-surface-container-high)] transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setRevokeTarget(null)}
        >
          <div
            className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 max-w-[400px] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[18px] font-medium text-[var(--md-on-surface)] mb-2">
              Revoke API Key
            </h2>
            <p className="text-[14px] text-[var(--md-on-surface-variant)] mb-4">
              Revoke &quot;{revokeTarget.name}&quot;? This key will no longer work.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRevokeTarget(null)}
                className="h-[40px] px-4 bg-[var(--md-surface-container)] text-[var(--md-on-surface)] rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:bg-[var(--md-surface-container-high)] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={actionId === revokeTarget.id}
                className="h-[40px] px-4 bg-[var(--md-warning)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium hover:opacity-90 disabled:opacity-60 transition-all"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Name
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Key Prefix
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Scopes
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Last Used
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Status
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Created
              </th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : keys.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center">
                  <div className="text-[var(--md-on-surface-variant)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                    </svg>
                    <p className="text-[14px]">No API keys yet</p>
                  </div>
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr
                  key={k.id}
                  className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150"
                >
                  <td className="px-6 py-4 text-[14px] font-medium text-[var(--md-on-surface)]">
                    {k.name}
                  </td>
                  <td className="px-6 py-4 font-mono text-[14px] text-[var(--md-on-surface-variant)]">
                    {k.key_prefix}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {k.scopes.map((s) => (
                        <span
                          key={s}
                          className="inline-flex px-2.5 py-0.5 rounded-[var(--md-radius-sm)] text-[11px] font-medium bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]"
                        >
                          {s}
                        </span>
                      ))}
                      {k.scopes.length === 0 && (
                        <span className="text-[13px] text-[var(--md-on-surface-variant)]">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface-variant)]">
                    {formatDate(k.last_used_at)}
                  </td>
                  <td className="px-6 py-4">
                    {k.active ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium bg-[var(--md-success-light)] text-[var(--md-success)]">
                        active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--md-radius-sm)] text-[12px] font-medium bg-[var(--md-error-light)] text-[var(--md-error)]">
                        revoked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface-variant)]">
                    {formatDate(k.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1.5 justify-end">
                      {k.active && (
                        <button
                          onClick={() => setRevokeTarget(k)}
                          disabled={actionId === k.id}
                          className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-warning)] bg-[var(--md-warning-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200 disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(k.id)}
                        disabled={actionId === k.id}
                        className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-error)] bg-[var(--md-error-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200 disabled:opacity-50"
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
