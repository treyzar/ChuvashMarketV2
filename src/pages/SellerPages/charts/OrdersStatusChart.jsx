import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import styles from "./Charts.module.css";

/**
 * График статуса заказов
 * @param {number} completed - Количество завершенных заказов
 * @param {number} pending - Количество ожидающих заказов
 */
export const OrdersStatusChart = ({ completed = 0, pending = 0 }) => {
  const data = [
    { name: "Завершены", value: completed, fill: "#10b981" },
    { name: "Ожидают", value: pending, fill: "#f59e0b" },
  ];

  const total = completed + pending;
  const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : 0;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { name, value } = payload[0];
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{name}</p>
          <p className={styles.tooltipValue}>
            {value} заказов ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Статус заказов</h3>
        <p className={styles.chartSubtitle}>Распределение по статусам</p>
      </div>

      <div className={styles.pieChartWrapper}>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartStats}>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>Всего заказов:</span>
          <span className={styles.chartStatValue}>{total}</span>
        </div>
        <div className={styles.chartStat}>
          <span className={styles.chartStatLabel}>Процент выполнения:</span>
          <span className={`${styles.chartStatValue} ${styles.positive}`}>
            {completionRate}%
          </span>
        </div>
      </div>
    </div>
  );
};
