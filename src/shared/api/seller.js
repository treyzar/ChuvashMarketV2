import { API_ENDPOINTS } from "../constants";
import { apiClient } from "./client";

export const fetchSellerProducts = () =>
  apiClient(API_ENDPOINTS.SELLER_PRODUCTS);

export const fetchSellerOrders = () => apiClient(API_ENDPOINTS.SELLER_ORDERS);

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
