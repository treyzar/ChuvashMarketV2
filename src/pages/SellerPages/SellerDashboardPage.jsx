import { useEffect, useMemo, useState } from "react";
import { fetchSellerAnalytics } from "../../shared/api/seller";
import { formatPrice } from "../../shared/lib";
import styles from "./SellerPages.module.css";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import {
  StatCard,
  RevenueChart,
  TopProductsChart,
  OrdersStatusChart,
  PublishedStatusChart,
  RatingsChart,
  PriceRangesChart,
  AdvancedStatsGrid,
  OrderStatusRevenueChart,
} from "./charts";
import {
  TrendingUp,
  ShoppingCart,
  Package,
  CheckCircle,
  Star,
  Users,
} from "lucide-react";

export const SellerDashboardPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "seller") return;
    let mounted = true;
    setIsLoading(true);
    fetchSellerAnalytics()
      .then((res) => {
        if (!mounted) return;
        setData(res);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    return () => (mounted = false);
  }, [isAuthenticated, user?.role]);

  if (!isAuthenticated || user?.role !== "seller") {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Панель продавца</h1>
        <section className={styles.card}>
          <p className={styles.hint}>
            Доступно только для продавцов. Войдите в аккаунт и запросите статус
            продавца.
          </p>
        </section>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className={styles.dashboardPage}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Панель продавца</h1>
          <p className={styles.dashboardSubtitle}>
            Аналитика и метрики вашего магазина
          </p>
        </div>
        <section className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Загружаем вашу аналитику…</p>
        </section>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.dashboardPage}>
        <div className={styles.dashboardHeader}>
          <h1 className={styles.dashboardTitle}>Панель продавца</h1>
          <p className={styles.dashboardSubtitle}>
            Аналитика и метрики вашего магазина
          </p>
        </div>
        <section className={styles.emptyState}>
          <div className={styles.emptyStateIcon}></div>
          <h2 className={styles.emptyStateTitle}>Нет данных для отображения</h2>
          <p className={styles.emptyStateText}>
            Начните с добавления товаров и ждите первых заказов. Аналитика
            обновляется в реальном времени.
          </p>
        </section>
      </main>
    );
  }

  const {
    products_count,
    published_count,
    draft_count,
    orders_count,
    pending_orders,
    total_revenue,
    top_products,
    sales_last_30,
  } = data;

  const avgDailyRevenue = useMemo(() => {
    return (
      sales_last_30.reduce((s, d) => s + (d.revenue || 0), 0) /
      Math.max(1, sales_last_30.length)
    );
  }, [sales_last_30]);

  const completedOrders = orders_count - pending_orders;
  const completionRate =
    orders_count > 0
      ? ((completedOrders / orders_count) * 100).toFixed(1)
      : "0.0";

  const unitsSold = useMemo(
    () => top_products.reduce((s, p) => s + (p.quantity || 0), 0),
    [top_products],
  );
  const avgOrderValue =
    completedOrders > 0 ? total_revenue / Math.max(1, completedOrders) : 0;

  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.dashboardTitle}>Панель продавца</h1>
        <p className={styles.dashboardSubtitle}>
          Аналитика и метрики вашего магазина
        </p>
      </div>

      {/* Карточки основных метрик */}
      <section className={styles.statsGrid}>
        <StatCard
          title="Выручка (30 дней)"
          value={formatPrice(total_revenue ?? 0)}
          subtitle={`Среднее в день: ${formatPrice(avgDailyRevenue)}`}
          icon={TrendingUp}
          color="blue"
        />

        <StatCard
          title="Средний чек"
          value={formatPrice(avgOrderValue)}
          subtitle={`Завершённых: ${completedOrders} / ${orders_count}`}
          icon={ShoppingCart}
          color="green"
        />

        <StatCard
          title="Единиц продано"
          value={unitsSold}
          subtitle={`Активных товаров: ${published_count}`}
          icon={Package}
          color="orange"
        />

        <StatCard
          title="Выполнение заказов"
          value={`${completionRate}%`}
          subtitle={`Завершено: ${completedOrders} / ${orders_count}`}
          icon={CheckCircle}
          color="green"
        />
      </section>

      {/* Графики */}
      <section className={styles.chartsSection}>
        <RevenueChart data={sales_last_30} />
      </section>

      <section className={styles.chartsGrid}>
        <OrdersStatusChart
          completed={completedOrders}
          pending={pending_orders}
        />
        <TopProductsChart data={top_products} />
      </section>

      {/* Расширенная статистика */}
      <section className={styles.advancedStatsSection}>
        <h2 className={styles.sectionTitle}>Расширенная аналитика</h2>
        <AdvancedStatsGrid
          uniqueBuyers={data.unique_buyers}
          avgRating={data.avg_rating}
          reviewsCount={data.reviews_count}
          avgOrderSize={data.avg_order_size}
          totalUnitsSold={data.total_units_sold}
          avgProductPrice={data.avg_product_price}
          minProductPrice={data.min_product_price}
          maxProductPrice={data.max_product_price}
        />
      </section>

      {/* Дополнительные графики */}
      <section className={styles.chartsGrid}>
        <PublishedStatusChart data={data.published_by_status} />
        <PriceRangesChart data={data.price_ranges} />
      </section>

      <section className={styles.chartsGrid}>
        <OrderStatusRevenueChart data={data.revenue_by_status} />
        <RatingsChart
          bestProducts={data.best_products}
          worstProducts={data.worst_products}
        />
      </section>

      {/* Список лучших товаров */}
      <section className={styles.productsSection}>
        <h3 className={styles.sectionTitle}>Топ товаров по продажам</h3>
        {top_products.length === 0 ? (
          <div className={styles.emptyState}>
            <p>
              Нет данных о продажах. Добавьте товары и ждите первых заказов!
            </p>
          </div>
        ) : (
          <div className={styles.productsTable}>
            <div className={styles.tableHeader}>
              <div className={styles.tableCol} style={{ flex: "0 0 60px" }}>
                Место
              </div>
              <div className={styles.tableCol} style={{ flex: "1 1 auto" }}>
                Товар
              </div>
              <div
                className={styles.tableCol}
                style={{ flex: "0 0 100px", textAlign: "right" }}
              >
                Продано
              </div>
              <div
                className={styles.tableCol}
                style={{ flex: "0 0 120px", textAlign: "right" }}
              >
                Выручка
              </div>
            </div>
            {top_products.map((p, idx) => (
              <div key={p.id} className={styles.tableRow}>
                <div className={styles.tableCol} style={{ flex: "0 0 60px" }}>
                  <span className={styles.rankBadge}>#{idx + 1}</span>
                </div>
                <div className={styles.tableCol} style={{ flex: "1 1 auto" }}>
                  <span className={styles.productName}>{p.name}</span>
                </div>
                <div
                  className={styles.tableCol}
                  style={{ flex: "0 0 100px", textAlign: "right" }}
                >
                  <span className={styles.tableValue}>{p.quantity} шт.</span>
                </div>
                <div
                  className={styles.tableCol}
                  style={{ flex: "0 0 120px", textAlign: "right" }}
                >
                  <span
                    className={styles.tableValue}
                    style={{ color: "#10b981", fontWeight: "600" }}
                  >
                    {formatPrice(p.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default SellerDashboardPage;
