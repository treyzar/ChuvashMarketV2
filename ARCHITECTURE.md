# FSD Architecture - Quick Start Guide

## Структура папок

```
src/
├── app/          # 🏛️ Инициализация (App.jsx, providers, config)
├── pages/        # 📄 Страницы (HomePage, ProductPage, ...)
├── widgets/      # 🎨 Компоненты-блоки (Header, ProductCard, ...)
├── features/     # ⚡ Фичи (AddToCart, Search, Filter, ...)
├── entities/     # 🏢 Сущности (Product, User, Cart, ...)
├── shared/       # 🎁 Переиспользуемый код
│   ├── ui/       # Button, Input, Modal, ...
│   ├── lib/      # Утилиты, хуки, helpers
│   ├── types/    # TypeScript типы
│   └── constants/ # Маршруты, конфиг, endpoints
└── README.md     # Документация архитектуры
```

## Правило импортов

```
✅ Pages может импортировать из: Widgets, Features, Entities, Shared
❌ Pages не может импортировать из: других Pages

✅ Widgets может импортировать из: Features, Entities, Shared
❌ Widgets не может импортировать из: Pages, других Widgets

✅ Features может импортировать из: Entities, Shared
❌ Features не может импортировать из: Pages, Widgets, других Features

✅ Entities может импортировать из: Shared
❌ Entities не может импортировать из: Pages, Widgets, Features

✅ Shared может импортировать только из себя
❌ Shared не может импортировать ничего другого
```

## Что в каждом слое?

**App**: Инициализация приложения, глобальные провайдеры
**Pages**: Полные страницы приложения
**Widgets**: Большие компоненты, комбинирующие features и entities
**Features**: Пользовательские возможности (AddToCart, Search, etc)
**Entities**: Бизнес-объекты (Product, User, Order, etc)
**Shared**: Общие компоненты, утилиты, константы

## Настройка import alias

Добавить в `vite.config.js`:

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@app": path.resolve(__dirname, "./src/app"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@widgets": path.resolve(__dirname, "./src/widgets"),
      "@features": path.resolve(__dirname, "./src/features"),
      "@entities": path.resolve(__dirname, "./src/entities"),
      "@shared": path.resolve(__dirname, "./src/shared"),
    },
  },
});
```

И в `jsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@app/*": ["src/app/*"],
      "@pages/*": ["src/pages/*"],
      "@widgets/*": ["src/widgets/*"],
      "@features/*": ["src/features/*"],
      "@entities/*": ["src/entities/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

## Структура внутри слоя

Каждый модуль (feature, entity, widget) обычно содержит:

```
ModuleName/
├── ui/          # UI компоненты
├── model/       # Состояние, типы, хуки
├── api/         # API запросы
├── lib/         # Утилиты
├── types/       # TypeScript типы
├── index.js     # Barrel export (главный экспорт)
└── README.md    # Документация
```

## Barrel export (index.js)

```js
// features/AddToCart/index.js
export { AddToCartButton } from './ui/AddToCartButton'
export { useAddToCart } from './model/useAddToCart'
export type { AddToCartProps } from './model/types'
```

Так можно импортировать просто:

```js
import { AddToCartButton, useAddToCart } from "@features/AddToCart";
```

Вместо:

```js
import { AddToCartButton } from "@features/AddToCart/ui/AddToCartButton";
import { useAddToCart } from "@features/AddToCart/model/useAddToCart";
```

## Полезные ссылки

- [Feature-Sliced Design](https://feature-sliced.design/)
- [Документация на русском](https://feature-sliced.design/ru/)
