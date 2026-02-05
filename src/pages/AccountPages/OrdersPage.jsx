import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchOrders } from "../../shared/api/account";
import { formatPrice } from "../../shared/lib";
import styles from "./AccountPages.module.css";
import { Tag } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { Button } from "../../shared/ui";
import { ITEMS_PER_PAGE } from "../../shared/constants";

const STATUS_LABELS = {
  pending: "Новый",
  paid: "Оплачен",
  shipped: "Отправлен",
  completed: "Завершён",
  canceled: "Отменён",
};

export const OrdersPage = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  if (!isAuthenticated) {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Мои заказы</h1>
        <section className={styles.card}>
          <p className={styles.hint}>
            Чтобы просматривать заказы, пожалуйста, войдите в аккаунт.
          </p>
        </section>
      </main>
    );
  }

  useEffect(() => {
    setIsLoading(true);
    fetchOrders({ page, page_size: ITEMS_PER_PAGE })
      .then((data) => {
        if (data && typeof data === "object" && Array.isArray(data.results)) {
          setOrders(data.results);
          setTotalCount(Number(data.count) || 0);
        } else if (Array.isArray(data)) {
          setOrders(data);
          setTotalCount(data.length || 0);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

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
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const imageSrc =
                firstItem?.product_image ||
                firstItem?.product?.images?.[0]?.image_url ||
                firstItem?.product?.images?.[0]?.image ||
                null;

              return (
                <li key={order.id} className={styles.listRow}>
                  <div className={styles.orderPreview}>
                    <div className={styles.orderPreviewImage}>
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={firstItem?.product?.name ?? ""}
                        />
                      ) : null}
                    </div>
                    <div className={styles.orderPreviewInfo}>
                      <div>
                        <strong>Заказ #{order.id}</strong>
                      </div>
                      <div className={styles.orderMeta}>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              "ru-RU",
                            )
                          : ""}
                        {" · "}
                        <span className={styles.badge}>
                          <Tag size={14} style={{ marginRight: 6 }} />
                          {STATUS_LABELS[order.status] ?? order.status}
                        </span>
                      </div>
                      {firstItem?.product?.name && (
                        <div className={styles.orderItemName}>
                          {firstItem.product.name} × {firstItem.quantity}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.orderTotal}>
                    {formatPrice(order.total_price ?? 0)}
                  </div>
                  <div className={styles.orderActions}>
                    <Link to={`/account/orders/${order.id}`}>Подробнее</Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {orders.length > 0 && (
          <div className={styles.pagination}>
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() =>
                setSearchParams((p) => {
                  const np = new URLSearchParams(p);
                  np.set("page", String(page - 1));
                  return np;
                })
              }
            >
              Назад
            </Button>
            {totalCount > 0 ? (
              (() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(totalCount / ITEMS_PER_PAGE),
                );
                if (totalPages <= 10) {
                  return (
                    <div className={styles.pageNumbers}>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const p = idx + 1;
                        return (
                          <Button
                            key={p}
                            variant={p === page ? "secondary" : "ghost"}
                            onClick={() =>
                              setSearchParams((pr) => {
                                const np = new URLSearchParams(pr);
                                np.set("page", String(p));
                                return np;
                              })
                            }
                          >
                            {p}
                          </Button>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <span className={styles.pageIndicator}>
                    Страница {page} из {totalPages}
                  </span>
                );
              })()
            ) : (
              <span className={styles.pageIndicator}>Страница {page}</span>
            )}
            <Button
              variant="secondary"
              disabled={
                totalCount > 0 && page >= Math.ceil(totalCount / ITEMS_PER_PAGE)
              }
              onClick={() =>
                setSearchParams((p) => {
                  const np = new URLSearchParams(p);
                  np.set("page", String(page + 1));
                  return np;
                })
              }
            >
              Вперёд
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};
