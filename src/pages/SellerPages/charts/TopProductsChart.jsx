import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./Charts.module.css";
import { formatPrice } from "../../../shared/lib";

/**
 * График топ товаров по продажам
 * @param {Array} data - Данные вида [{id: 1, name: "Товар 1", quantity: 10, revenue: 5000}, ...]
 */
export const TopProductsChart = ({ data = [] }) => {
  const chartData = data.slice(0, 8).map((product) => ({
    name: product.name?.substring(0, 15) || "Товар",
    fullName: product.name,
    quantity: product.quantity || 0,
    revenue: product.revenue || 0,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { fullName, revenue, quantity } = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{fullName}</p>
          <p className={styles.tooltipValue}>Доход: {formatPrice(revenue)}</p>
          <p className={styles.tooltipOrders}>Продано: {quantity} шт.</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Топ товаров по продажам</h3>
        <p className={styles.chartSubtitle}>Лучшие товары по выручке</p>
      </div>

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
            angle={-45}
            textAnchor="end"
            height={80}
            stroke="#6b7280"
            style={{ fontSize: "11px" }}
            tick={{ fill: "#6b7280" }}
          />
          <YAxis
            yAxisId="left"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#6b7280" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#6b7280" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="square"
            formatter={(value) => {
              const labels = { revenue: "Доход", quantity: "Продано шт." };
              return labels[value] || value;
            }}
          />
          <Bar
            yAxisId="left"
            dataKey="revenue"
            fill="#3a5981"
            radius={[8, 8, 0, 0]}
            name="revenue"
          />
          <Bar
            yAxisId="right"
            dataKey="quantity"
            fill="#7fa0c3"
            radius={[8, 8, 0, 0]}
            name="quantity"
          />
        </BarChart>
      </ResponsiveContainer>

      {chartData.length === 0 && (
        <div className={styles.emptyChart}>
          <p>Нет данных о продажах</p>
        </div>
      )}
    </div>
  );
};
