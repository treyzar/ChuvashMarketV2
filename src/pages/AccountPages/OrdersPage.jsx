import { useEffect, useState } from "react";
import { fetchOrders } from "../../shared/api/account";
import { formatPrice } from "../../shared/lib";
import styles from "./AccountPages.module.css";

const STATUS_LABELS = {
  pending: "Новый",
  paid: "Оплачен",
  shipped: "Отправлен",
  completed: "Завершён",
  canceled: "Отменён",
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetchOrders()
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Мои заказы</h1>
      <section className={styles.card}>
        {isLoading && <p className={styles.hint}>Загружаем заказы…</p>}
        {!isLoading && orders.length === 0 && (
          <p className={styles.hint}>У вас пока нет заказов.</p>
        )}
        {orders.length > 0 && (
          <ul className={styles.list}>
            {orders.map((order) => (
              <li key={order.id} className={styles.listRow}>
                <span>
                  Заказ #{order.id} от{" "}
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString("ru-RU")
                    : ""}
                </span>
                <span className={styles.badge}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
                <span>{formatPrice(order.total_price ?? 0)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

