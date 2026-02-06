import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { fetchOrders } from "../../shared/api/account";
import { formatPrice } from "../../shared/lib";
import styles from "./AccountPages.module.css";
import { Package, Calendar, ChevronRight, ShoppingBag } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { Button } from "../../shared/ui";
import { ITEMS_PER_PAGE } from "../../shared/constants";

const STATUS_CONFIG = {
  pending: { label: "Новый", color: "#f59e0b", bg: "#fef3c7" },
  paid: { label: "Оплачен", color: "#3b82f6", bg: "#dbeafe" },
  shipped: { label: "Отправлен", color: "#8b5cf6", bg: "#ede9fe" },
  completed: { label: "Завершён", color: "#10b981", bg: "#d1fae5" },
  canceled: { label: "Отменён", color: "#ef4444", bg: "#fee2e2" },
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
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Мои заказы</h1>
          <p className={styles.pageSubtitle}>История ваших покупок</p>
        </div>
        <section className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <ShoppingBag size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyStateTitle}>Войдите в аккаунт</h2>
          <p className={styles.emptyStateText}>
            Чтобы просматривать заказы, пожалуйста, войдите в свой аккаунт
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
  }, [page]);

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Мои заказы</h1>
        <p className={styles.pageSubtitle}>История ваших покупок</p>
      </div>

      {isLoading && (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Загружаем заказы…</p>
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <section className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Package size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyStateTitle}>У вас пока нет заказов</h2>
          <p className={styles.emptyStateText}>
            Начните делать покупки, и ваши заказы появятся здесь
          </p>
          <Button onClick={() => (window.location.href = "/products")}>
            Перейти в каталог
          </Button>
        </section>
      )}

      {!isLoading && orders.length > 0 && (
        <>
          <div className={styles.ordersList}>
            {orders.map((order) => {
              const firstItem = order.items?.[0];
              const imageSrc =
                firstItem?.product_image ||
                firstItem?.product?.images?.[0]?.image_url ||
                firstItem?.product?.images?.[0]?.image ||
                null;
              const statusConfig = STATUS_CONFIG[order.status] || {
                label: order.status,
                color: "#6b7280",
                bg: "#f3f4f6",
              };
              const itemsCount = order.items?.length || 0;

              return (
                <Link
                  key={order.id}
                  to={`/account/orders/${order.id}`}
                  className={styles.orderCard}
                >
                  <div className={styles.orderCardImage}>
                    {imageSrc ? (
                      <img src={imageSrc} alt={firstItem?.product?.name ?? ""} />
                    ) : (
                      <div className={styles.orderCardImagePlaceholder}>
                        <Package size={24} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  <div className={styles.orderCardContent}>
                    <div className={styles.orderCardHeader}>
                      <h3 className={styles.orderCardTitle}>Заказ #{order.id}</h3>
                      <span
                        className={styles.orderCardStatus}
                        style={{
                          color: statusConfig.color,
                          backgroundColor: statusConfig.bg,
                        }}
                      >
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className={styles.orderCardMeta}>
                      <span className={styles.orderCardMetaItem}>
                        <Calendar size={14} />
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "—"}
                      </span>
                      <span className={styles.orderCardMetaItem}>
                        <Package size={14} />
                        {itemsCount} {itemsCount === 1 ? "товар" : "товара"}
                      </span>
                    </div>

                    {firstItem?.product?.name && (
                      <p className={styles.orderCardDescription}>
                        {firstItem.product.name}
                        {itemsCount > 1 && ` и ещё ${itemsCount - 1}`}
                      </p>
                    )}

                    <div className={styles.orderCardFooter}>
                      <span className={styles.orderCardPrice}>
                        {formatPrice(order.total_price ?? 0)}
                      </span>
                      <span className={styles.orderCardLink}>
                        Подробнее <ChevronRight size={16} />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalCount > ITEMS_PER_PAGE && (
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
        </>
      )}
    </main>
  );
};
