import { apiClient } from "./client";

export const login = async ({ email, password }) => {
  // В бэкенде логин по username, поэтому используем email как username
  const payload = {
    username: email,
    password,
  };

  return apiClient("/api/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const register = async ({ email, password, role = "customer" }) => {
  const payload = {
    username: email,
    email,
    password,
    role,
  };

  return apiClient("/api/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const fetchCurrentUser = () => apiClient("/api/auth/user/");

