const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:30400";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    public data: Record<string, unknown>,
  ) {
    super((data.message as string) || `API Error: ${status}`);
  }
}

function getAuthHeader(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("factory_token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function handle401(res: Response): void {
  if (res.status === 401 && typeof window !== "undefined") {
    localStorage.removeItem("factory_token");
    localStorage.removeItem("factory_refresh_token");
    window.location.href = "/login";
    throw new ApiError(401, { message: "Session expired" });
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  handle401(res);

  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

async function uploadFile(endpoint: string, file: File, fieldName = "file"): Promise<{ url: string }> {
  const form = new FormData();
  form.append(fieldName, file);

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: getAuthHeader(),
    body: form,
  });

  handle401(res);

  const data = await res.json();
  if (!res.ok) throw new ApiError(res.status, data);
  return data as { url: string };
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "POST", body }),
  patch: <T>(endpoint: string, body: unknown) => request<T>(endpoint, { method: "PATCH", body }),
  upload: uploadFile,
};

export { ApiError };

export function getUser() {
  if (typeof window === "undefined") return null;
  try {
    const token = localStorage.getItem("factory_token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload as { user_id: string; tenant_id: string; role: string; factory_id?: string; exp: number };
  } catch {
    return null;
  }
}
