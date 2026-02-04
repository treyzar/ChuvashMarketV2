import { API_ENDPOINTS } from "../constants";
import { apiClient } from "./client";

export const fetchProducts = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const query = search ? `?${search}` : "";
  return apiClient(`${API_ENDPOINTS.PRODUCTS}${query}`);
};

export const fetchProductById = (id) => {
  return apiClient(`${API_ENDPOINTS.PRODUCTS}${id}/`);
};

export const fetchCategories = () => {
  return apiClient("/api/categories/");
};

export const createProduct = (data) => {
  return apiClient(API_ENDPOINTS.PRODUCTS, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

export const updateProduct = (id, data) => {
  return apiClient(`${API_ENDPOINTS.PRODUCTS}${id}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
};

export const deleteProduct = (id) => {
  return apiClient(`${API_ENDPOINTS.PRODUCTS}${id}/`, {
    method: "DELETE",
  });
};
