import { Users, Star, Package, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import styles from "./Charts.module.css";

/**
 * Сетка расширенной статистики продавца
 */
export const AdvancedStatsGrid = ({
  uniqueBuyers = 0,
  avgRating = 0,
  reviewsCount = 0,
  avgOrderSize = 0,
  totalUnitsSold = 0,
  avgProductPrice = 0,
  minProductPrice = 0,
  maxProductPrice = 0,
}) => {
  return (
    <div className={styles.advancedStatsGrid}>
      <div className={styles.advancedStatItem}>
        <div className={styles.advancedStatIcon}>
          <Users size={24} />
        </div>
        <div className={styles.advancedStatContent}>
          <p className={styles.advancedStatLabel}>Уникальные покупатели</p>
          <p className={styles.advancedStatValue}>{uniqueBuyers}</p>
          <p className={styles.advancedStatHint}>За все время</p>
        </div>
      </div>

      <div className={styles.advancedStatItem}>
        <div className={styles.advancedStatIcon}>
          <Star size={24} />
        </div>
        <div className={styles.advancedStatContent}>
          <p className={styles.advancedStatLabel}>Средний рейтинг</p>
          <p className={styles.advancedStatValue}>{avgRating.toFixed(1)}</p>
          <p className={styles.advancedStatHint}>{reviewsCount} отзывов</p>
        </div>
      </div>

      <div className={styles.advancedStatItem}>
        <div className={styles.advancedStatIcon}>
          <Package size={24} />
        </div>
        <div className={styles.advancedStatContent}>
          <p className={styles.advancedStatLabel}>Средний размер заказа</p>
          <p className={styles.advancedStatValue}>{avgOrderSize.toFixed(1)}</p>
          <p className={styles.advancedStatHint}>Единиц товара</p>
        </div>
      </div>

      <div className={styles.advancedStatItem}>
        <div className={styles.advancedStatIcon}>
          <BarChart3 size={24} />
        </div>
        <div className={styles.advancedStatContent}>
          <p className={styles.advancedStatLabel}>Общий объем продаж</p>
          <p className={styles.advancedStatValue}>{totalUnitsSold}</p>
          <p className={styles.advancedStatHint}>Единиц товара</p>
        </div>
      </div>

      <div className={styles.advancedStatItem}>
        <div className={styles.advancedStatIcon}>
          <DollarSign size={24} />
        </div>
        <div className={styles.advancedStatContent}>
          <p className={styles.advancedStatLabel}>Средняя цена товара</p>
          <p className={styles.advancedStatValue}>
            {avgProductPrice.toFixed(0)} ₽
          </p>
          <p className={styles.advancedStatHint}>В вашем каталоге</p>
        </div>
      </div>

      <div className={styles.advancedStatItem}>
        <div className={styles.advancedStatIcon}>
          <TrendingUp size={24} />
        </div>
        <div className={styles.advancedStatContent}>
          <p className={styles.advancedStatLabel}>Диапазон цен</p>
          <p className={styles.advancedStatValue}>
            {minProductPrice.toFixed(0)} - {maxProductPrice.toFixed(0)} ₽
          </p>
          <p className={styles.advancedStatHint}>От минимума к максимуму</p>
        </div>
      </div>
    </div>
  );
};
