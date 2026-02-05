import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById } from "../../shared/api/account";
import { formatPrice } from "../../shared/lib";
import { ROUTES } from "../../shared/constants";
import { Button } from "../../shared/ui";
import styles from "./AccountPages.module.css";

const STATUS_LABELS = {
  pending: "Новый",
  paid: "Оплачен",
  shipped: "Отправлен",
  completed: "Завершён",
  canceled: "Отменён",
};

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    setError("");
    fetchOrderById(id)
      .then((data) => {
        setOrder(data);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
        if (err.status === 404) {
          setError("Заказ не найден.");
        } else if (err.status === 401) {
          setError("Для просмотра заказов необходимо войти в систему.");
        } else {
          setError("Не удалось загрузить данные заказа. Попробуйте позже.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  const goBack = () => {
    navigate(ROUTES.ORDERS);
  };

  const title =
    order && order.id
      ? `Заказ #${order.id}`
      : "Детали заказа";

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{title}</h1>
      <section className={styles.card}>
        {isLoading && <p className={styles.hint}>Загружаем данные заказа…</p>}
        {error && !isLoading && <p className={styles.hint}>{error}</p>}

        {!isLoading && !error && order && (
          <>
            <p className={styles.hint}>
              Дата оформления:{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleString("ru-RU")
                : "—"}
              {" · "}
              Статус:{" "}
              <span className={styles.badge}>
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </p>

            <h2 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>
              Состав заказа
            </h2>
            {order.items?.length ? (
              <ul className={styles.list}>
                {order.items.map((item) => {
                  const firstImage =
                    item.product_image ||
                    item.product?.images?.[0]?.image_url ||
                    item.product?.images?.[0]?.image ||
                    null;

                  return (
                    <li key={item.id} className={styles.listRow}>
                      <div className={styles.orderPreview}>
                        <div className={styles.orderPreviewImage}>
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={item.product?.name ?? "Товар"}
                            />
                          ) : null}
                        </div>
                        <div className={styles.orderPreviewInfo}>
                          <div className={styles.orderItemName}>
                            {item.product?.name ?? "Товар"} × {item.quantity}
                          </div>
                          <div className={styles.orderMeta}>
                            {formatPrice(item.price ?? 0)} / шт. ·{" "}
                            {formatPrice(item.subtotal ?? 0)} всего
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className={styles.hint}>В заказе нет позиций.</p>
            )}

            <p
              style={{
                marginTop: "0.75rem",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>Итого:</span>
              <span>{formatPrice(order.total_price ?? 0)}</span>
            </p>
          </>
        )}

        <div style={{ marginTop: "1rem" }}>
          <Button variant="secondary" onClick={goBack}>
            К списку заказов
          </Button>
        </div>
      </section>
    </main>
  );
};

