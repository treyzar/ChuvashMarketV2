import { API_ENDPOINTS } from "../constants";
import { apiClient } from "./client";

export const fetchCart = () => apiClient(API_ENDPOINTS.CART);

export const addToCartApi = (productId, quantity = 1) =>
  apiClient(API_ENDPOINTS.CART, {
    method: "POST",
    body: JSON.stringify({ product_id: productId, quantity }),
  });

export const updateCartItemApi = (itemId, quantity) =>
  apiClient(`${API_ENDPOINTS.CART}${itemId}/`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });

export const removeCartItemApi = (itemId) =>
  apiClient(`${API_ENDPOINTS.CART}${itemId}/`, {
    method: "DELETE",
  });
