import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./Charts.module.css";

/**
 * График распределения товаров по ценовым диапазонам
 * @param {Object} data - {бюджет: 5, средний: 15, премиум: 8, люкс: 2}
 */
export const PriceRangesChart = ({ data = {} }) => {
  const chartData = [
    { name: "Бюджет (< 1K)", value: data.бюджет || 0, fill: "#3a5981" },
    { name: "Средний (1K-5K)", value: data.средний || 0, fill: "#5a7ca8" },
    { name: "Премиум (5K-20K)", value: data.премиум || 0, fill: "#7fa0c3" },
    { name: "Люкс (> 20K)", value: data.люкс || 0, fill: "#10b981" },
  ].filter((item) => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { name, value } = payload[0];
      const percent = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{name}</p>
          <p className={styles.tooltipValue}>
            {value} товаров ({percent}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Распределение цен</h3>
        <p className={styles.chartSubtitle}>Товары по ценовым диапазонам</p>
      </div>

      {chartData.length > 0 ? (
        <>
          <div className={styles.pieChartWrapper}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartStats}>
            {chartData.map((item) => (
              <div key={item.name} className={styles.chartStat}>
                <span className={styles.chartStatLabel}>{item.name}:</span>
                <span className={styles.chartStatValue}>{item.value}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyChart}>
          <p>Нет товаров</p>
        </div>
      )}
    </div>
  );
};
