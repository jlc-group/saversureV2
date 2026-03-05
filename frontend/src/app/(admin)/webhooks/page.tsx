"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  last_triggered_at: string | null;
  last_status: number | null;
  failure_count: number;
  created_at: string;
}

interface WebhookLog {
  id: string;
  event: string;
  payload: string;
  status_code: number | null;
  response_body: string | null;
  duration_ms: number | null;
  created_at: string;
}

const EVENT_OPTIONS = [
  "scan",
  "redeem",
  "points_credit",
  "reward_claimed",
  "support_created",
];

function truncateUrl(url: string, maxLen = 45) {
  if (url.length <= maxLen) return url;
  return url.slice(0, maxLen - 3) + "...";
}

function formatDate(s: string | null) {
  if (!s) return "—";
  const d = new Date(s);
  return d.toLocaleString();
}

function statusBadge(status: number | null) {
  if (status === null) return <span className="text-[var(--md-on-surface-variant)]">—</span>;
  const isOk = status >= 200 && status < 300;
  const isWarn = status >= 400 && status < 500;
  const isErr = status >= 500 || status < 200;
  const cls = isOk
    ? "bg-[var(--md-success-light)] text-[var(--md-success)]"
    : isWarn
      ? "bg-[var(--md-warning-light)] text-[var(--md-warning)]"
      : "bg-[var(--md-error-light)] text-[var(--md-error)]";
  return (
    <span className={`inline-flex px-2.5 py-0.5 rounded-[var(--md-radius-sm)] text-[12px] font-medium ${cls}`}>
      {status}
    </span>
  );
}

const fieldClass =
  "w-full h-[48px] px-4 border border-[var(--md-outline)] rounded-[var(--md-radius-sm)] text-[14px] text-[var(--md-on-surface)] bg-transparent outline-none focus:border-[var(--md-primary)] focus:border-2 transition-all duration-200";

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);
  const [expandedLogsId, setExpandedLogsId] = useState<string | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [testResult, setTestResult] = useState<WebhookLog | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  const emptyForm = { url: "", events: [] as string[], active: true };
  const [form, setForm] = useState(emptyForm);

  const fetchWebhooks = async () => {
    try {
      const data = await api.get<{ data: Webhook[] }>("/api/v1/webhooks");
      setWebhooks(data.data || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  useEffect(() => {
    if (!expandedLogsId) {
      setLogs([]);
      return;
    }
    setLogsLoading(true);
    api
      .get<{ data: WebhookLog[] }>(`/api/v1/webhooks/${expandedLogsId}/logs`)
      .then((res) => setLogs(res.data || []))
      .catch(() => setLogs([]))
      .finally(() => setLogsLoading(false));
  }, [expandedLogsId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setCreatedSecret(null);
    try {
      const res = await api.post<Webhook & { secret?: string }>("/api/v1/webhooks", {
        url: form.url.trim(),
        events: form.events,
      });
      setCreatedSecret(res.secret ?? null);
      setShowForm(false);
      setForm({ ...emptyForm });
      fetchWebhooks();
    } catch {
      alert("Failed to create webhook");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/v1/webhooks/${editingId}`, {
        url: form.url.trim(),
        events: form.events,
        active: form.active,
      });
      setShowForm(false);
      setEditingId(null);
      setForm({ ...emptyForm });
      fetchWebhooks();
    } catch {
      alert("Failed to update webhook");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (w: Webhook) => {
    setForm({
      url: w.url,
      events: [...w.events],
      active: w.active,
    });
    setEditingId(w.id);
    setShowForm(true);
    setCreatedSecret(null);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
    setCreatedSecret(null);
  };

  const toggleEvent = (event: string) => {
    setForm((f) => ({
      ...f,
      events: f.events.includes(event)
        ? f.events.filter((e) => e !== event)
        : [...f.events, event],
    }));
  };

  const handleToggleActive = async (w: Webhook) => {
    setActionId(w.id);
    try {
      await api.patch(`/api/v1/webhooks/${w.id}`, { active: !w.active });
      fetchWebhooks();
    } catch {
      alert("Failed to update");
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this webhook?")) return;
    setActionId(id);
    try {
      await api.delete(`/api/v1/webhooks/${id}`);
      if (expandedLogsId === id) setExpandedLogsId(null);
      fetchWebhooks();
    } catch {
      alert("Failed to delete");
    } finally {
      setActionId(null);
    }
  };

  const handleTest = async (id: string) => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await api.post<WebhookLog>(`/api/v1/webhooks/${id}/test`, {});
      setTestResult(res);
    } catch {
      alert("Failed to send test webhook");
    } finally {
      setTestLoading(false);
    }
  };

  const editForm = editingId !== null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-normal text-[var(--md-on-surface)] tracking-[-0.5px]">
            Webhooks
          </h1>
          <p className="text-[14px] text-[var(--md-on-surface-variant)] mt-1">
            จัดการ webhook endpoints สำหรับรับ event notifications
          </p>
        </div>
        <button
          onClick={() => {
            if (showForm) cancelForm();
            else {
              setEditingId(null);
              setForm({ ...emptyForm });
              setShowForm(true);
            }
          }}
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
              Add Webhook
            </>
          )}
        </button>
      </div>

      {createdSecret && (
        <div className="bg-[var(--md-warning-light)] border border-[var(--md-warning)] rounded-[var(--md-radius-lg)] p-4 mb-6">
          <p className="text-[14px] font-medium text-[var(--md-warning)] mb-2">
            Save this secret for signature verification
          </p>
          <code className="block p-3 bg-[var(--md-surface)] rounded-[var(--md-radius-sm)] text-[13px] font-mono text-[var(--md-on-surface)] break-all">
            {createdSecret}
          </code>
        </div>
      )}

      {showForm && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-6 mb-6">
          <h2 className="text-[16px] font-medium text-[var(--md-on-surface)] mb-5 tracking-[0.1px]">
            {editForm ? "Edit Webhook" : "Create Webhook"}
          </h2>
          <form onSubmit={editForm ? handleUpdate : handleCreate} className="space-y-5">
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-1.5 tracking-[0.4px] uppercase">
                URL
              </label>
              <input
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                required
                className={fieldClass}
                placeholder="https://example.com/webhook"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[var(--md-on-surface-variant)] mb-2 tracking-[0.4px] uppercase">
                Events
              </label>
              <div className="flex flex-wrap gap-3">
                {EVENT_OPTIONS.map((ev) => (
                  <label
                    key={ev}
                    className="flex items-center gap-2 cursor-pointer text-[14px] text-[var(--md-on-surface)]"
                  >
                    <input
                      type="checkbox"
                      checked={form.events.includes(ev)}
                      onChange={() => toggleEvent(ev)}
                      className="w-4 h-4 rounded border-[var(--md-outline)] text-[var(--md-primary)] focus:ring-[var(--md-primary)]"
                    />
                    {ev}
                  </label>
                ))}
              </div>
            </div>
            {editForm && (
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  className="w-4 h-4 rounded border-[var(--md-outline)] text-[var(--md-primary)] focus:ring-[var(--md-primary)]"
                />
                <label htmlFor="active" className="text-[14px] text-[var(--md-on-surface)]">
                  Active
                </label>
              </div>
            )}
            <button
              type="submit"
              disabled={submitting || (form.events.length === 0 && !editForm)}
              className="h-[40px] px-6 bg-[var(--md-primary)] text-white rounded-[var(--md-radius-xl)] text-[14px] font-medium tracking-[0.1px] hover:bg-[var(--md-primary-dark)] disabled:opacity-60 active:scale-[0.98] transition-all duration-200"
            >
              {submitting ? "Saving..." : editForm ? "Save Changes" : "Create"}
            </button>
          </form>
        </div>
      )}

      {testResult && (
        <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 p-4 mb-6">
          <h3 className="text-[14px] font-medium text-[var(--md-on-surface)] mb-3">Test Result</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[13px]">
            <div>
              <span className="text-[var(--md-on-surface-variant)]">Event:</span>{" "}
              <span className="text-[var(--md-on-surface)]">{testResult.event}</span>
            </div>
            <div>
              <span className="text-[var(--md-on-surface-variant)]">Status:</span>{" "}
              {statusBadge(testResult.status_code)}
            </div>
            <div>
              <span className="text-[var(--md-on-surface-variant)]">Duration:</span>{" "}
              <span className="text-[var(--md-on-surface)]">
                {testResult.duration_ms != null ? `${testResult.duration_ms}ms` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[var(--md-on-surface-variant)]">Time:</span>{" "}
              <span className="text-[var(--md-on-surface)]">{formatDate(testResult.created_at)}</span>
            </div>
          </div>
          {testResult.payload && (
            <details className="mt-3">
              <summary className="text-[12px] text-[var(--md-on-surface-variant)] cursor-pointer">
                Payload preview
              </summary>
              <pre className="mt-2 p-3 bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] text-[12px] overflow-x-auto max-h-32 overflow-y-auto">
                {testResult.payload.length > 500
                  ? testResult.payload.slice(0, 500) + "..."
                  : testResult.payload}
              </pre>
            </details>
          )}
        </div>
      )}

      <div className="bg-[var(--md-surface)] rounded-[var(--md-radius-lg)] md-elevation-1 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--md-outline-variant)]">
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                URL
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Events
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Status
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Last Triggered
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Last Status
              </th>
              <th className="text-left px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Failures
              </th>
              <th className="text-right px-6 py-3.5 text-[12px] font-medium text-[var(--md-on-surface-variant)] tracking-[0.4px] uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="inline-flex items-center gap-3 text-[var(--md-on-surface-variant)]">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </div>
                </td>
              </tr>
            ) : webhooks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="text-[var(--md-on-surface-variant)]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mx-auto mb-3 opacity-30">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                    <p className="text-[14px]">No webhooks yet</p>
                  </div>
                </td>
              </tr>
            ) : (
              webhooks.flatMap((w) => [
                <tr
                    key={w.id}
                    className="border-b border-[var(--md-outline-variant)] last:border-b-0 hover:bg-[var(--md-surface-dim)] transition-colors duration-150"
                  >
                    <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface)] font-mono" title={w.url}>
                      {truncateUrl(w.url)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {w.events.map((ev) => (
                          <span
                            key={ev}
                            className="inline-flex px-2.5 py-0.5 rounded-[var(--md-radius-sm)] text-[11px] font-medium bg-[var(--md-surface-container)] text-[var(--md-on-surface-variant)]"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        role="switch"
                        aria-checked={w.active}
                        onClick={() => handleToggleActive(w)}
                        disabled={actionId === w.id}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                          w.active ? "bg-[var(--md-primary)]" : "bg-[var(--md-outline-variant)]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                            w.active ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface-variant)]">
                      {formatDate(w.last_triggered_at)}
                    </td>
                    <td className="px-6 py-4">{statusBadge(w.last_status)}</td>
                    <td className="px-6 py-4 text-[14px] text-[var(--md-on-surface)]">
                      {w.failure_count}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handleEdit(w)}
                          className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-primary)] bg-[var(--md-primary-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setExpandedLogsId(expandedLogsId === w.id ? null : w.id)}
                          className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-on-surface-variant)] bg-[var(--md-surface-container)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200"
                        >
                          Logs
                        </button>
                        <button
                          onClick={() => handleTest(w.id)}
                          disabled={testLoading || actionId === w.id}
                          className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-warning)] bg-[var(--md-warning-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200 disabled:opacity-50"
                        >
                          Test
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          disabled={actionId === w.id}
                          className="h-[26px] px-3 text-[12px] font-medium text-[var(--md-error)] bg-[var(--md-error-light)] rounded-[var(--md-radius-sm)] hover:opacity-80 transition-all duration-200 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>,
                ...(expandedLogsId === w.id
                  ? [
                    <tr key={`${w.id}-logs`} className="bg-[var(--md-surface-dim)]">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="rounded-[var(--md-radius-lg)] bg-[var(--md-surface)] md-elevation-1 p-4">
                          <h4 className="text-[14px] font-medium text-[var(--md-on-surface)] mb-3">
                            Recent Deliveries
                          </h4>
                          {logsLoading ? (
                            <div className="flex items-center gap-2 text-[var(--md-on-surface-variant)] py-4">
                              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Loading logs...
                            </div>
                          ) : logs.length === 0 ? (
                            <p className="text-[14px] text-[var(--md-on-surface-variant)] py-4">
                              No deliveries yet
                            </p>
                          ) : (
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                              {logs.map((log) => (
                                <div
                                  key={log.id}
                                  className="p-3 rounded-[var(--md-radius-sm)] bg-[var(--md-surface-container)] border border-[var(--md-outline-variant)]"
                                >
                                  <div className="flex flex-wrap items-center gap-3 text-[13px] mb-2">
                                    <span className="font-medium text-[var(--md-on-surface)]">{log.event}</span>
                                    {statusBadge(log.status_code)}
                                    {log.duration_ms != null && (
                                      <span className="text-[var(--md-on-surface-variant)]">
                                        {log.duration_ms}ms
                                      </span>
                                    )}
                                    <span className="text-[var(--md-on-surface-variant)]">
                                      {formatDate(log.created_at)}
                                    </span>
                                  </div>
                                  {log.payload && (
                                    <details>
                                      <summary className="text-[12px] text-[var(--md-on-surface-variant)] cursor-pointer">
                                        Payload preview
                                      </summary>
                                      <pre className="mt-2 p-2 bg-[var(--md-surface-dim)] rounded-[var(--md-radius-sm)] text-[11px] overflow-x-auto max-h-24 overflow-y-auto">
                                        {log.payload.length > 300 ? log.payload.slice(0, 300) + "..." : log.payload}
                                      </pre>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>,
                  ]
                  : []),
              ])
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
