import { APP_CONFIG } from "../../app/config";

const baseUrl = APP_CONFIG.API_URL?.replace(/\/+$/, "") ?? "";

const getAccessToken = () => {
  try {
    return localStorage.getItem("cm_access_token");
  } catch {
    return null;
  }
};

export const apiClient = async (path, options = {}) => {
  const url = `${baseUrl}${path}`;

  const token = getAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error("API request failed");
    error.status = response.status;
    error.data = errorBody;
    throw error;
  }

  if (response.status === 204) return null;
  return response.json();
};

