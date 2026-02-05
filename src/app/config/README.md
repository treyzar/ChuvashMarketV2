# ⚙️ Config

Конфигурация приложения.

## Назначение

Файлы в этой папке содержат конфигурацию приложения, которая может отличаться в зависимости от окружения.

## Примеры файлов конфигурации

```js
// config/routes.js
export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CART: "/cart",
};

// config/api.js
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL,
  TIMEOUT: 30000,
};

// config/theme.js
export const THEME_CONFIG = {
  PRIMARY_COLOR: "#ff6b35",
  SECONDARY_COLOR: "#f7931e",
};
```

## Экспорт

```js
// config/index.js
export * from "./routes";
export * from "./api";
export * from "./theme";
```
