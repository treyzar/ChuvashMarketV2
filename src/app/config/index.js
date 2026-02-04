// App configuration
// Конфигурация приложения (routes, api endpoints, etc)

export const APP_CONFIG = {
  // Бэкенд Django (DRF) по умолчанию крутится на 8000 порту
  // Можно переопределить через VITE_API_URL в .env
  API_URL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
};
