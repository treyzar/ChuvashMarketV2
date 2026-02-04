import { useEffect, useState } from "react";
import { fetchSellerOrders, fetchSellerProducts } from "../../shared/api/seller";
import { formatPrice } from "../../shared/lib";
import styles from "./SellerPages.module.css";

export const SellerDashboardPage = () => {
  const [metrics, setMetrics] = useState({
    productsCount: 0,
    publishedCount: 0,
    draftCount: 0,
    ordersCount: 0,
    pendingOrders: 0,
    revenue: 0,
    lastOrderDate: null,
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([fetchSellerProducts(), fetchSellerOrders()])
      .then(([products, orders]) => {
        if (!isMounted) return;
        const productsArray = Array.isArray(products) ? products : products?.results ?? [];
        const ordersArray = Array.isArray(orders) ? orders : orders?.results ?? [];

        const productsCount = productsArray.length;
        const publishedCount = productsArray.filter((p) => p.is_published).length;
        const draftCount = productsCount - publishedCount;

        const ordersCount = ordersArray.length;
        const pendingOrders = ordersArray.filter((o) => o.status === "pending").length;
        const revenue = ordersArray.reduce(
          (sum, o) => sum + Number(o.total_price ?? 0),
          0,
        );
        const lastOrder = ordersArray
          .slice()
          .sort(
            (a, b) =>
              new Date(b.created_at || 0).getTime() -
              new Date(a.created_at || 0).getTime(),
          )[0];

        setMetrics({
          productsCount,
          publishedCount,
          draftCount,
          ordersCount,
          pendingOrders,
          revenue,
          lastOrderDate: lastOrder?.created_at ?? null,
        });
      })
      .catch(() => {})
      .finally(() => {
        isMounted = false;
      });
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Панель продавца</h1>
      <section className={styles.grid}>
        <article className={styles.card}>
          <span className={styles.metricLabel}>Всего товаров</span>
          <span className={styles.metricValue}>{metrics.productsCount}</span>
        </article>
        <article className={styles.card}>
          <span className={styles.metricLabel}>Опубликованы</span>
          <span className={styles.metricValue}>{metrics.publishedCount}</span>
        </article>
        <article className={styles.card}>
          <span className={styles.metricLabel}>Черновики</span>
          <span className={styles.metricValue}>{metrics.draftCount}</span>
        </article>
        <article className={styles.card}>
          <span className={styles.metricLabel}>Всего заказов</span>
          <span className={styles.metricValue}>{metrics.ordersCount}</span>
        </article>
        <article className={styles.card}>
          <span className={styles.metricLabel}>Новые заказы</span>
          <span className={styles.metricValue}>{metrics.pendingOrders}</span>
        </article>
        <article className={styles.card}>
          <span className={styles.metricLabel}>Выручка</span>
          <span className={styles.metricValue}>
            {formatPrice(metrics.revenue ?? 0)}
          </span>
        </article>
        {metrics.lastOrderDate && (
          <article className={styles.card}>
            <span className={styles.metricLabel}>Последний заказ</span>
            <span className={styles.metricValue}>
              {new Date(metrics.lastOrderDate).toLocaleDateString("ru-RU")}
            </span>
          </article>
        )}
      </section>
    </main>
  );
};

