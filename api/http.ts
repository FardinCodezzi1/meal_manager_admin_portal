import { clearSession, getToken } from "@/lib/authStorage.util";
import { ApiError } from "@/api/types/api-response";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "") ||
  "https://meal-manager-api.onrender.com/api";

let handlingUnauthorized = false;

function handleUnauthorized() {
  if (typeof window === "undefined" || handlingUnauthorized) return;
  handlingUnauthorized = true;
  clearSession();
  const path = window.location.pathname;
  if (path !== "/login" && path !== "/register") {
    window.location.href = "/login";
  } else {
    handlingUnauthorized = false;
  }
}

export async function http<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const url = `${API_BASE_URL}${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    handleUnauthorized();
    throw new ApiError("Session expired or unauthorized. Please log in again.", 401);
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message =
      (errorBody as { error?: string; message?: string }).error ||
      (errorBody as { error?: string; message?: string }).message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorBody);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
