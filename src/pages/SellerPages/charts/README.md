# Компоненты графиков для панели продавца

Этот набор компонентов предоставляет красивые и информативные графики для анализа продаж и метрик продавцом.

## Компоненты

### StatCard

Карточка с основной метрикой (выручка, количество заказов и т.д.).

```jsx
import { StatCard } from "./charts";
import { TrendingUp } from "lucide-react";

<StatCard
  title="Выручка (30 дней)"
  value="50,000 ₽"
  subtitle="Среднее в день: 1,667 ₽"
  icon={TrendingUp}
  color="blue"
/>;
```

**Props:**

- `title` (string) - Заголовок карточки
- `value` (string|number) - Основное значение
- `subtitle` (string, optional) - Дополнительный текст
- `icon` (Component, optional) - Иконка из lucide-react
- `color` (string) - Цвет акцента: "blue" (по умолчанию), "green", "orange", "red"
- `trend` (string, optional) - Тренд: "up" или "down"

### RevenueChart

Интерактивный график доходов за последние 30 дней.

```jsx
import { RevenueChart } from "./charts";

const data = [
  { date: "2025-02-01", revenue: 1000, orders: 5 },
  { date: "2025-02-02", revenue: 1500, orders: 7 },
  // ...
];

<RevenueChart data={data} />;
```

**Features:**

- Линейный график с заливкой под кривой
- Интерактивная подсказка при наведении
- Автоматическое форматирование дат
- Статистика среднего дохода за период

### TopProductsChart

График лучших товаров по продажам (выручка и количество).

```jsx
import { TopProductsChart } from "./charts";

const data = [
  { id: 1, name: "Товар 1", quantity: 10, revenue: 5000 },
  { id: 2, name: "Товар 2", quantity: 8, revenue: 4000 },
  // ...
];

<TopProductsChart data={data} />;
```

**Features:**

- Столбчатый график с двумя осями (доход и количество)
- Показывает топ 8 товаров
- Интерактивные подсказки
- Легенда с обозначением метрик

### OrdersStatusChart

Круговая диаграмма распределения заказов по статусам.

```jsx
import { OrdersStatusChart } from "./charts";

<OrdersStatusChart completed={45} pending={5} />;
```

**Features:**

- Круговая диаграмма с двумя категориями (завершены/ожидают)
- Отображение процента выполнения
- Цветовая кодировка (зеленый - завершены, оранжевый - ожидают)
- Интерактивные подсказки

## Стили

Все компоненты используют CSS модули (`Charts.module.css`). Они стилизованы для:

- Приятного внешнего вида с тенями и скруглениями
- Адаптивности на мобильных устройствах
- Темной предпосылки для лучшей читаемости

## Использование в SellerDashboardPage

Компоненты графиков интегрированы в `SellerDashboardPage` и показывают реальные данные с бекенда:

```jsx
import { StatCard, RevenueChart, TopProductsChart, OrdersStatusChart } from "./charts";

export const SellerDashboardPage = () => {
  const { data } = useAnalytics();

  return (
    <main>
      {/* Карточки метрик */}
      <section className={styles.statsGrid}>
        <StatCard title="Выручка" value={data.total_revenue} ... />
        <StatCard title="Средний чек" value={data.avg_order} ... />
        <StatCard title="Продано единиц" value={data.units_sold} ... />
        <StatCard title="Выполнение" value={data.completion_rate} ... />
      </section>

      {/* Основной график доходов */}
      <section className={styles.chartsSection}>
        <RevenueChart data={data.sales_last_30} />
      </section>

      {/* Сетка графиков */}
      <section className={styles.chartsGrid}>
        <OrdersStatusChart completed={data.completed} pending={data.pending} />
        <TopProductsChart data={data.top_products} />
      </section>
    </main>
  );
};
```

## Зависимости

- `recharts` - Библиотека для отрисовки графиков
- `lucide-react` - Иконки для карточек
- React 19+

## Цвета и тема

Компоненты используют согласованную цветовую палитру:

- **Primary**: #3a5981 (синий)
- **Success**: #10b981 (зеленый)
- **Warning**: #f59e0b (оранжевый)
- **Error**: #ef4444 (красный)
- **Text**: #1f2937 (темный серый)
- **Secondary**: #6b7280 (средний серый)
- **Border**: #e5e7eb (светлый серый)

## Адаптивность

Все компоненты полностью адаптивны и хорошо выглядят на устройствах:

- Десктопные (1920px+)
- Планшеты (768px - 1024px)
- Мобильные (< 768px)
