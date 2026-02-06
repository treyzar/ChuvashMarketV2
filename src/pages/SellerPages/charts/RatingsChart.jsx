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
import { Star, Sparkles, AlertTriangle } from "lucide-react";
import styles from "./Charts.module.css";

/**
 * График рейтинга товаров
 * @param {Array} bestProducts - Лучшие товары [{name: "...", rating: 4.5}, ...]
 * @param {Array} worstProducts - Худшие товары
 */
export const RatingsChart = ({ bestProducts = [], worstProducts = [] }) => {
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.[0]) {
      const { name, rating } = payload[0].payload;
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{name}</p>
          <p className={styles.tooltipValue}>
            Рейтинг: {rating.toFixed(1)} <Star size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </p>
        </div>
      );
    }
    return null;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    return (
      <div style={{ display: "flex", gap: "2px" }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={i} size={14} fill="currentColor" />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartHeader}>
        <h3 className={styles.chartTitle}>Рейтинг товаров</h3>
        <p className={styles.chartSubtitle}>
          Лучшие и худшие товары по отзывам
        </p>
      </div>

      <div className={styles.ratingsContainer}>
        {/* Лучшие товары */}
        <div className={styles.ratingsSection}>
          <h4 className={styles.ratingsSectionTitle}>
            <Sparkles size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }} />
            Лучшие товары ({bestProducts.length})
          </h4>
          {bestProducts.length > 0 ? (
            <div className={styles.ratingsList}>
              {bestProducts.map((product, index) => (
                <div key={index} className={styles.ratingItem}>
                  <div className={styles.ratingLeft}>
                    <span className={styles.ratingBadge}>#{index + 1}</span>
                    <span className={styles.ratingName}>{product.name}</span>
                  </div>
                  <div className={styles.ratingRight}>
                    <div className={styles.ratingStars}>
                      {renderStars(product.rating)}
                    </div>
                    <span className={styles.ratingValue}>
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyRatings}>Нет отзывов</p>
          )}
        </div>

        {/* Худшие товары */}
        <div className={styles.ratingsSection}>
          <h4 className={styles.ratingsSectionTitle}>
            <AlertTriangle size={18} style={{ display: "inline", verticalAlign: "middle", marginRight: "0.5rem" }} />
            Товары для улучшения ({worstProducts.length})
          </h4>
          {worstProducts.length > 0 ? (
            <div className={styles.ratingsList}>
              {worstProducts.map((product, index) => (
                <div key={index} className={styles.ratingItem}>
                  <div className={styles.ratingLeft}>
                    <span
                      className={styles.ratingBadge}
                      style={{ background: "#f59e0b" }}
                    >
                      #{index + 1}
                    </span>
                    <span className={styles.ratingName}>{product.name}</span>
                  </div>
                  <div className={styles.ratingRight}>
                    <div className={styles.ratingStars}>
                      {renderStars(product.rating)}
                    </div>
                    <span
                      className={styles.ratingValue}
                      style={{ color: "#f59e0b" }}
                    >
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyRatings}>Нет отзывов</p>
          )}
        </div>
      </div>
    </div>
  );
};
