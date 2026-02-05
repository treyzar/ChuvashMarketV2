# ⚡ Features Layer

Слой **Features** содержит пользовательские возможности приложения. Это независимые модули, добавляющие функциональность.

## Назначение

- Реализация пользовательских возможностей (фич)
- Бизнес-логика, связанная с фичей
- Работа с состоянием фичей
- API интеграция для фичей

## Структура

```
features/
├── AddToCart/
│   ├── ui/
│   │   ├── AddToCartButton.jsx
│   │   └── AddToCartButton.module.css
│   ├── model/
│   │   ├── store.js
│   │   └── useAddToCart.js
│   ├── api/
│   │   └── cartAPI.js
│   ├── types/
│   │   └── types.ts
│   ├── index.js
│   └── README.md
├── ProductSearch/
│   ├── ui/
│   ├── model/
│   └── index.js
└── README.md
```

## Правила

✅ **Разрешено:**

- Использование entities
- Использование shared
- Бизнес-логика
- API запросы
- Состояние (Redux, Zustand и т.д.)

❌ **Запрещено:**

- Импорты из pages
- Импорты из widgets
- Импорты из других features (избегать циркулярных зависимостей)
- UI компоненты напрямую в widgets/pages (только через экспорт)

## Структура внутри фичи

```
AddToCart/
├── ui/              # UI компоненты фичи
├── model/           # Состояние, хуки
├── api/             # API вызовы
├── types/           # TypeScript типы
├── lib/             # Утилиты специфичные для фичи
├── index.js         # Barrel export
└── README.md        # Документация фичи
```

## Примеры использования

```jsx
// AddToCart/ui/AddToCartButton.jsx
import { useAddToCart } from "../model";

export const AddToCartButton = ({ productId }) => {
  const { addToCart, isLoading } = useAddToCart();

  return (
    <button onClick={() => addToCart(productId)} disabled={isLoading}>
      {isLoading ? "Добавляю..." : "Добавить в корзину"}
    </button>
  );
};
```

## Экспорт

```js
// index.js
export { AddToCartButton } from "./ui/AddToCartButton";
export { useAddToCart } from "./model/useAddToCart";
```
