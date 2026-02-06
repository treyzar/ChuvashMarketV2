import { API_ENDPOINTS } from "../constants";
import { apiClient } from "./client";

export const fetchFavorites = (params = {}) => {
  const search = new URLSearchParams(params).toString();
  const query = search ? `?${search}` : "";
  return apiClient(`${API_ENDPOINTS.FAVORITES}${query}`);
};

export const toggleFavorite = (productId) =>
  apiClient(`${API_ENDPOINTS.FAVORITES}toggle/`, {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });

export const addToFavorites = (productId) =>
  apiClient(API_ENDPOINTS.FAVORITES, {
    method: "POST",
    body: JSON.stringify({ product_id: productId }),
  });

export const removeFromFavorites = (favoriteId) =>
  apiClient(`${API_ENDPOINTS.FAVORITES}${favoriteId}/`, {
    method: "DELETE",
  });
