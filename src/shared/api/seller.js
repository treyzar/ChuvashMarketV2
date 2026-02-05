import { API_ENDPOINTS } from "../constants";
import { apiClient } from "./client";

export const fetchSellerProducts = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const query = search ? `?${search}` : "";
  return apiClient(`${API_ENDPOINTS.SELLER_PRODUCTS}${query}`);
};

export const fetchSellerOrders = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const query = search ? `?${search}` : "";
  return apiClient(`${API_ENDPOINTS.SELLER_ORDERS}${query}`);
};

export const createSellerProduct = (data) =>
  apiClient(API_ENDPOINTS.SELLER_PRODUCTS, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateSellerProduct = (id, data) =>
  apiClient(`${API_ENDPOINTS.SELLER_PRODUCTS}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const deleteSellerProduct = (id) =>
  apiClient(`${API_ENDPOINTS.SELLER_PRODUCTS}${id}/`, {
    method: "DELETE",
  });

export const fetchSellerAnalytics = () =>
  apiClient(API_ENDPOINTS.SELLER_ANALYTICS);
