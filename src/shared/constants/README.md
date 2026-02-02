# 📌 Constants

Константы приложения.

## Структура

```
constants/
├── routes.js       # Маршруты приложения
├── config.js       # Конфигурация
├── api.js         # API endpoints
└── index.js        # Barrel export
```

## Файлы

### routes.js

Маршруты приложения:

```js
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
  ORDER_SUCCESS: "/order-success",
  PROFILE: "/profile",
  PROFILE_ORDERS: "/profile/orders",
  NOT_FOUND: "*",
};
```

### config.js

Конфигурация приложения:

```js
export const APP_CONFIG = {
  APP_NAME: "ChuvashMarket",
  API_URL: import.meta.env.VITE_API_URL,
  API_TIMEOUT: 30000,
  ITEMS_PER_PAGE: 12,
  CACHE_TIME: 5 * 60 * 1000, // 5 минут
};

export const THEME = {
  PRIMARY: "#ff6b35",
  SECONDARY: "#f7931e",
  DANGER: "#e74c3c",
  SUCCESS: "#27ae60",
};
```

### api.js

API endpoints:

```js
export const API_ENDPOINTS = {
  // Products
  GET_PRODUCTS: "/products",
  GET_PRODUCT: "/products/:id",
  SEARCH_PRODUCTS: "/products/search",

  // Cart
  GET_CART: "/cart",
  ADD_TO_CART: "/cart/add",
  REMOVE_FROM_CART: "/cart/remove",

  // Orders
  GET_ORDERS: "/orders",
  CREATE_ORDER: "/orders",

  // User
  GET_USER: "/user",
  UPDATE_USER: "/user",
};
```

## Экспорт

```js
// constants/index.js
export { ROUTES } from "./routes";
export { APP_CONFIG, THEME } from "./config";
export { API_ENDPOINTS } from "./api";
```

## Использование

```js
import { ROUTES, APP_CONFIG } from "@shared/constants";

// Маршрутизация
navigate(ROUTES.PRODUCTS);

// Конфигурация
const apiUrl = APP_CONFIG.API_URL;
```
