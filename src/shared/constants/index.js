// Application constants
// Константы приложения

export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/account/profile",
  ORDERS: "/account/orders",
  FAVORITES: "/account/favorites",
  SELLER_DASHBOARD: "/seller",
  SELLER_PRODUCTS: "/seller/products",
  SELLER_ORDERS: "/seller/orders",
  ADMIN_DASHBOARD: "/admin",
  NOT_FOUND: "*",
};

export const API_ENDPOINTS = {
  PRODUCTS: "/api/products/",
  CART: "/api/cart/",
  PROFILE: "/api/users/profile/",
  ORDERS: "/api/orders/",
  SELLER_PRODUCTS: "/api/sellers/products/",
  SELLER_ORDERS: "/api/sellers/orders/",
  CURRENT_USER: "/api/auth/user/",
};
