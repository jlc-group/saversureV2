"use client";

import { api } from "./api";

interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface User {
  user_id: string;
  tenant_id: string;
  role: string;
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem("access_token");
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.exp * 1000 < Date.now()) {
      logout();
      return null;
    }
    return {
      user_id: payload.user_id,
      tenant_id: payload.tenant_id,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

const SYSTEM_TENANT_ID = "00000000-0000-0000-0000-000000000001";

export async function login(email: string, password: string): Promise<User> {
  const tokens = await api.post<TokenPair>("/api/v1/auth/login", {
    tenant_id: SYSTEM_TENANT_ID,
    email,
    password,
  });
  localStorage.setItem("access_token", tokens.access_token);
  localStorage.setItem("refresh_token", tokens.refresh_token);
  return getUser()!;
}

export function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}

export function isAuthenticated(): boolean {
  return getUser() !== null;
}
