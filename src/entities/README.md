# 🏢 Entities Layer

Слой **Entities** содержит бизнес-сущности приложения (User, Product, Order и т.д.).

## Назначение

- Определение бизнес-сущностей
- Типы данных для сущностей
- UI компоненты сущностей (карточки, детали)
- Логика работы с сущностями
- Состояние сущностей

## Структура

```
entities/
├── Product/
│   ├── ui/
│   │   ├── ProductCard.jsx
│   │   ├── ProductDetail.jsx
│   │   └── ProductCard.module.css
│   ├── model/
│   │   ├── types.ts
│   │   ├── store.js
│   │   └── useProduct.js
│   ├── api/
│   │   └── productAPI.js
│   ├── index.js
│   └── README.md
├── User/
│   ├── ui/
│   ├── model/
│   └── index.js
├── Cart/
│   ├── model/
│   ├── api/
│   └── index.js
└── README.md
```

## Правила

✅ **Разрешено:**

- Использование shared
- Определение типов
- UI компоненты для представления сущности
- Состояние (Redux, Zustand и т.д.)
- API для работы с сущностью

❌ **Запрещено:**

- Импорты из features, pages, widgets
- Специфичная для фичи логика
- Зависимость от других entities

## Типы сущностей в ChuvashMarket

Основные сущности для маркетплейса:

- **Product** - товар
- **User** - пользователь
- **Cart** - корзина
- **Order** - заказ
- **Category** - категория товаров
- **Review** - отзыв

## Структура внутри сущности

```
Product/
├── ui/              # UI компоненты (Card, Detail, List)
├── model/           # Состояние, хуки
├── api/             # API запросы
├── types/           # TypeScript интерфейсы
├── lib/             # Утилиты
├── index.js         # Barrel export
└── README.md        # Документация
```

## Примеры использования

```jsx
// Product/ui/ProductCard.jsx
import type { Product } from '../model/types'

export const ProductCard = ({ product }: { product: Product }) => (
  <div>
    <img src={product.image} alt={product.name} />
    <h3>{product.name}</h3>
    <p>{product.price} ₽</p>
  </div>
)
```

## Типизация

```ts
// Product/model/types.ts
export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}
```

## Экспорт

```js
// index.js
export { ProductCard } from './ui/ProductCard'
export { useProduct } from './model/useProduct'
export type { Product } from './model/types'
```
