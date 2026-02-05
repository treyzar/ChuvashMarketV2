import { API_ENDPOINTS } from "../constants";
import { apiClient } from "./client";

export const fetchProfile = () => apiClient(API_ENDPOINTS.PROFILE);

export const updateProfile = (payload) =>
  apiClient(API_ENDPOINTS.PROFILE, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

export const fetchOrders = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const query = search ? `?${search}` : "";
  return apiClient(`${API_ENDPOINTS.ORDERS}${query}`);
};

export const fetchOrderById = (id) =>
  apiClient(`${API_ENDPOINTS.ORDERS}${id}/`);

export const createOrder = (data) =>
  apiClient(API_ENDPOINTS.ORDERS, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const fetchReviews = (productId) =>
  apiClient(`/api/reviews/?product=${productId}`);

export const createReview = (data) =>
  apiClient("/api/reviews/", {
    method: "POST",
    body: JSON.stringify(data),
  });
