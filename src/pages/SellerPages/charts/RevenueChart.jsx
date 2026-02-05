import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import styles from "./Charts.module.css";
import { formatPrice } from "../../../shared/lib";

/**
 * График дохода за последние 30 дней
 * @param {Array} data - Данные вида [{date: "2025-02-01", revenue: 1000, orders: 5}, ...]
 */
export const RevenueChart = ({ data = [] }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: new Date(item.date).toLocaleDateString("ru-RU", {
      month: "short",
      day: "numeric",
    }),
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { date, revenue, orders } = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{date}</p>
          <p className={styles.tooltipValue}>Доход: {formatPrice(revenue)}</p>
          <p className={styles.tooltipOrders}>Заказов: {orders}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Доход за последние 30 дней</h3>
        <p className={styles.chartSubtitle}>Динамика ежедневного дохода</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={formattedData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3a5981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3a5981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="date"
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
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3a5981"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className={styles.chartStats}>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>Средний доход в день:</span>
          <span className={styles.chartStatValue}>
            {formatPrice(
              formattedData.reduce((s, d) => s + (d.revenue || 0), 0) /
                Math.max(1, formattedData.length),
            )}
          </span>
        </div>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>Всего за период:</span>
          <span className={styles.chartStatValue}>
            {formatPrice(
              formattedData.reduce((s, d) => s + (d.revenue || 0), 0),
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
