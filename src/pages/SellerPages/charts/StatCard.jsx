import styles from "./Charts.module.css";

/**
 * Карточка с метрикой
 * @param {string} title - Заголовок метрики
 * @param {string|number} value - Основное значение
 * @param {string} [subtitle] - Дополнительный текст
 * @param {string} [icon] - Иконка (lucide-react)
 * @param {string} [trend] - Тренд (up/down)
 * @param {string} [color] - Цвет акцента (blue/green/orange/red)
 */
export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
}) => {
  const colorClass =
    {
      blue: styles.colorBlue,
      green: styles.colorGreen,
      orange: styles.colorOrange,
      red: styles.colorRed,
    }[color] || styles.colorBlue;

  return (
    <div className={`${styles.statCard} ${colorClass}`}>
      <div className={styles.statCardHeader}>
        <h3 className={styles.statCardTitle}>{title}</h3>
        {Icon && <Icon className={styles.statCardIcon} size={20} />}
      </div>

      <div className={styles.statCardContent}>
        <div className={styles.statCardValue}>{value}</div>
        {subtitle && <p className={styles.statCardSubtitle}>{subtitle}</p>}
      </div>

      {trend && (
        <div
          className={`${styles.statCardTrend} ${styles[`trend${trend.charAt(0).toUpperCase() + trend.slice(1)}`]}`}
        >
          {trend === "up" ? "↑" : "↓"} {trend}
        </div>
      )}
    </div>
  );
};
