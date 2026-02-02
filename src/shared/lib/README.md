# 🛠️ Utilities & Helpers

Утилиты, помощники и хуки, которые переиспользуются по всему приложению.

## Структура

```
lib/
├── api.js           # Конфигурация HTTP клиента
├── formatters.js    # Функции форматирования
├── validators.js    # Функции валидации
├── hooks.js         # Переиспользуемые React хуки
├── helpers.js       # Вспомогательные функции
└── index.js         # Barrel export
```

## Файлы

### api.js

Конфигурация HTTP клиента (axios, fetch и т.д.):

```js
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Интерцепторы
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  },
);
```

### formatters.js

Форматирование данных:

```js
export const formatPrice = (price) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
  }).format(price);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat("ru-RU").format(new Date(date));
};

export const truncateText = (text, length) => {
  return text.length > length ? `${text.slice(0, length)}...` : text;
};
```

### validators.js

Валидация данных:

```js
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhoneNumber = (phone) => {
  const regex = /^[+7|8]\d{10}$/;
  return regex.test(phone);
};
```

### hooks.js

Переиспользуемые React хуки:

```js
export const useLocalStorage = (key, initialValue) => {
  // Логика хука
};

export const useAsync = (asyncFunction) => {
  // Логика хука
};

export const useDebounce = (value, delay) => {
  // Логика хука
};
```

### helpers.js

Вспомогательные функции:

```js
export const debounce = (func, delay) => {
  // Логика функции
};

export const throttle = (func, delay) => {
  // Логика функции
};

export const cloneObject = (obj) => {
  // Логика функции
};
```

## Экспорт

```js
// lib/index.js
export * from "./api";
export * from "./formatters";
export * from "./validators";
export * from "./hooks";
export * from "./helpers";
```

## Использование

```js
import { formatPrice, validateEmail, useLocalStorage } from "@shared/lib";
```
