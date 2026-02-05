import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchOrderById } from "../../shared/api/account";
import { formatPrice } from "../../shared/lib";
import { ROUTES } from "../../shared/constants";
import { Button } from "../../shared/ui";
import styles from "./AccountPages.module.css";
import { ArrowLeft, Package, Calendar, MapPin, Phone, User } from "lucide-react";

const STATUS_CONFIG = {
  pending: { label: "Новый", color: "#f59e0b", bg: "#fef3c7" },
  paid: { label: "Оплачен", color: "#3b82f6", bg: "#dbeafe" },
  shipped: { label: "Отправлен", color: "#8b5cf6", bg: "#ede9fe" },
  completed: { label: "Завершён", color: "#10b981", bg: "#d1fae5" },
  canceled: { label: "Отменён", color: "#ef4444", bg: "#fee2e2" },
};

const DELIVERY_LABELS = {
  pickup: "Самовывоз",
  courier: "Курьер",
  post: "Почта России",
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

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Загружаем данные заказа…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Package size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyStateTitle}>Ошибка</h2>
          <p className={styles.emptyStateText}>{error}</p>
          <Button onClick={goBack}>Вернуться к заказам</Button>
        </section>
      </main>
    );
  }

  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status] || {
    label: order.status,
    color: "#6b7280",
    bg: "#f3f4f6",
  };

  return (
    <main className={styles.page}>
      <button className={styles.backButton} onClick={goBack}>
        <ArrowLeft size={16} /> Назад к заказам
      </button>

      <div className={styles.orderDetailHeader}>
        <div>
          <h1 className={styles.pageTitle}>Заказ #{order.id}</h1>
          <p className={styles.orderDetailDate}>
            <Calendar size={16} />
            {order.created_at
              ? new Date(order.created_at).toLocaleString("ru-RU", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—"}
          </p>
        </div>
        <span
          className={styles.orderDetailStatus}
          style={{
            color: statusConfig.color,
            backgroundColor: statusConfig.bg,
          }}
        >
          {statusConfig.label}
        </span>
      </div>

      <div className={styles.orderDetailGrid}>
        {/* Информация о доставке */}
        <section className={styles.orderDetailCard}>
          <h2 className={styles.orderDetailCardTitle}>Информация о доставке</h2>
          <div className={styles.orderDetailInfo}>
            <div className={styles.orderDetailInfoItem}>
              <User size={18} />
              <div>
                <div className={styles.orderDetailInfoLabel}>Получатель</div>
                <div className={styles.orderDetailInfoValue}>
                  {order.contact_name || "—"}
                </div>
              </div>
            </div>
            <div className={styles.orderDetailInfoItem}>
              <Phone size={18} />
              <div>
                <div className={styles.orderDetailInfoLabel}>Телефон</div>
                <div className={styles.orderDetailInfoValue}>
                  {order.contact_phone || "—"}
                </div>
              </div>
            </div>
            <div className={styles.orderDetailInfoItem}>
              <MapPin size={18} />
              <div>
                <div className={styles.orderDetailInfoLabel}>Адрес доставки</div>
                <div className={styles.orderDetailInfoValue}>
                  {order.delivery_address || "—"}
                </div>
              </div>
            </div>
            <div className={styles.orderDetailInfoItem}>
              <Package size={18} />
              <div>
                <div className={styles.orderDetailInfoLabel}>Способ доставки</div>
                <div className={styles.orderDetailInfoValue}>
                  {DELIVERY_LABELS[order.delivery_method] || order.delivery_method || "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Состав заказа */}
        <section className={styles.orderDetailCard}>
          <h2 className={styles.orderDetailCardTitle}>Состав заказа</h2>
          {order.items?.length ? (
            <div className={styles.orderDetailItems}>
              {order.items.map((item) => {
                const firstImage =
                  item.product_image ||
                  item.product?.images?.[0]?.image_url ||
                  item.product?.images?.[0]?.image ||
                  null;

                return (
                  <div key={item.id} className={styles.orderDetailItem}>
                    <div className={styles.orderDetailItemImage}>
                      {firstImage ? (
                        <img src={firstImage} alt={item.product?.name ?? "Товар"} />
                      ) : (
                        <div className={styles.orderDetailItemImagePlaceholder}>
                          <Package size={20} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <div className={styles.orderDetailItemInfo}>
                      <div className={styles.orderDetailItemName}>
                        {item.product?.name ?? "Товар"}
                      </div>
                      <div className={styles.orderDetailItemMeta}>
                        {formatPrice(item.price ?? 0)} × {item.quantity} шт.
                      </div>
                    </div>
                    <div className={styles.orderDetailItemPrice}>
                      {formatPrice(item.subtotal ?? 0)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={styles.emptyStateText}>В заказе нет позиций.</p>
          )}

          <div className={styles.orderDetailTotal}>
            <span>Итого:</span>
            <span className={styles.orderDetailTotalPrice}>
              {formatPrice(order.total_price ?? 0)}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
};

