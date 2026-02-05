import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import styles from "./Charts.module.css";
import { formatPrice } from "../../../shared/lib";

/**
 * График дохода по статусам заказов
 * @param {Object} data - Доход по статусам {pending: 1000, paid: 5000, ...}
 */
export const OrderStatusRevenueChart = ({ data = {} }) => {
  const statusLabels = {
    pending: { label: "Новый", color: "#6b7280" },
    paid: { label: "Оплачен", color: "#f59e0b" },
    shipped: { label: "Отправлен", color: "#3b82f6" },
    completed: { label: "Завершен", color: "#10b981" },
    canceled: { label: "Отменен", color: "#ef4444" },
  };

  const chartData = Object.entries(data)
    .filter(([_, value]) => value > 0)
    .map(([status, revenue]) => ({
      name: statusLabels[status]?.label || status,
      status,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { name, revenue } = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{name}</p>
          <p className={styles.tooltipValue}>Доход: {formatPrice(revenue)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Доход по статусам заказов</h3>
        <p className={styles.chartSubtitle}>Выручка в зависимости от статуса</p>
      </div>

      {chartData.length > 0 ? (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tick={{ fill: "#6b7280" }}
              />
              <YAxis
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                tick={{ fill: "#6b7280" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} name="Доход">
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={statusLabels[entry.status]?.color || "#3a5981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className={styles.chartStats}>
            {chartData.slice(0, 3).map((item) => (
              <div key={item.status} className={styles.chartStat}>
                <span className={styles.chartStatLabel}>{item.name}:</span>
                <span className={styles.chartStatValue}>
                  {formatPrice(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyChart}>
          <p>Нет данных о доходе</p>
        </div>
      )}
    </div>
  );
};
