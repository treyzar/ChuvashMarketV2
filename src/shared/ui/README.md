# 🎨 UI Components

Переиспользуемые UI компоненты для всего приложения.

## Правила структуры

Каждый компонент в отдельной папке:

```
ComponentName/
├── ComponentName.jsx
├── ComponentName.module.css
├── index.js
└── README.md (опционально)
```

## Примеры компонентов

- Button
- Input
- Select
- Modal
- Card
- Layout
- Header
- Footer
- Sidebar
- Dropdown
- Tooltip
- Pagination
- Spinner
- и т.д.

## Правила компонента

✅ **Разрешено:**

- Props для кастомизации
- CSS modules
- Простая логика
- Переиспользование других shared компонентов

❌ **Запрещено:**

- Сложная бизнес-логика
- Импорты из entities, features, widgets, pages
- Зависимость от состояния приложения

## Пример компонента

```jsx
// Button/Button.jsx
import styles from "./Button.module.css";

export const Button = ({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  ...props
}) => (
  <button
    className={`${styles.button} ${styles[variant]}`}
    onClick={onClick}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);
```

```js
// Button/index.js
export { Button } from "./Button";
```

## Экспорт из ui/index.js

```js
// shared/ui/index.js
export { Button } from "./Button";
export { Input } from "./Input";
export { Select } from "./Select";
export { Modal } from "./Modal";
export { Card } from "./Card";
```
