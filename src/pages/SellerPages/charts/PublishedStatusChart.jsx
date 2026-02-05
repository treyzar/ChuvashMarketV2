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

/**
 * График распределения товаров по статусам публикации
 * @param {Array} data - Данные вида [{status: "Опубликованы", count: 8}, ...]
 */
export const PublishedStatusChart = ({ data = [] }) => {
  const colors = {
    Опубликованы: "#10b981",
    Черновики: "#f59e0b",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { status, count } = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{status}</p>
          <p className={styles.tooltipValue}>{count} товаров</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Статус товаров</h3>
        <p className={styles.chartSubtitle}>Распределение товаров в каталоге</p>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e5e7eb"
            vertical={false}
          />
          <XAxis
            dataKey="status"
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#6b7280" }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: "12px" }}
            tick={{ fill: "#6b7280" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Товаров">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[entry.status] || "#3a5981"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className={styles.chartStats}>
        {data.map((item) => (
          <div key={item.status} className={styles.chartStat}>
            <span className={styles.chartStatLabel}>{item.status}:</span>
            <span className={styles.chartStatValue}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
