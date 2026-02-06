import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchSellerOrders, updateOrderStatus } from "../../shared/api/seller";
import { Button } from "../../shared/ui";
import { formatPrice } from "../../shared/lib";
import styles from "./SellerPages.module.css";
import { Tag, ChevronDown, Check, X } from "lucide-react";
import { ITEMS_PER_PAGE } from "../../shared/constants";

const STATUS_CONFIG = {
  pending: { label: "Новый", color: "#f59e0b", bg: "#fef3c7" },
  paid: { label: "Оплачен", color: "#3b82f6", bg: "#dbeafe" },
  shipped: { label: "Отправлен", color: "#8b5cf6", bg: "#ede9fe" },
  completed: { label: "Завершён", color: "#10b981", bg: "#d1fae5" },
  canceled: { label: "Отменён", color: "#ef4444", bg: "#fee2e2" },
};

const STATUS_OPTIONS = [
  { value: "pending", label: "Новый" },
  { value: "paid", label: "Оплачен" },
  { value: "shipped", label: "Отправлен" },
  { value: "completed", label: "Завершён" },
  { value: "canceled", label: "Отменён" },
];

export const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [editingStatus, setEditingStatus] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  const loadOrders = () => {
    setIsLoading(true);
    fetchSellerOrders({ page, page_size: ITEMS_PER_PAGE })
      .then((data) => {
        if (data && typeof data === "object" && Array.isArray(data.results)) {
          setOrders(data.results);
          setTotalCount(Number(data.count) || 0);
        } else if (Array.isArray(data)) {
          setOrders(data);
          setTotalCount(data.length || 0);
        }
      })
      .catch((err) => console.error("Ошибка загрузки заказов:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleStatusEdit = (orderId, currentStatus) => {
    setEditingStatus(orderId);
    setSelectedStatus(currentStatus);
  };

  const handleStatusCancel = () => {
    setEditingStatus(null);
    setSelectedStatus("");
  };

  const handleStatusSave = async (orderId) => {
    if (!selectedStatus || isUpdating) return;

    setIsUpdating(true);
    try {
      await updateOrderStatus(orderId, selectedStatus);
      // Обновляем локальное состояние
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: selectedStatus } : order
        )
      );
      setEditingStatus(null);
      setSelectedStatus("");
    } catch (err) {
      console.error("Ошибка обновления статуса:", err);
      alert("Не удалось обновить статус заказа. Попробуйте позже.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Заказы по моим товарам</h1>
      <section className={styles.card}>
        {isLoading && <p className={styles.hint}>Загружаем заказы…</p>}
        {!isLoading && orders.length === 0 ? (
          <p className={styles.hint}>
            Пока нет заказов на ваши товары. Как только покупатели оформят
            заказы, они появятся здесь.
          </p>
        ) : (
          <ul className={styles.list}>
            {orders.map((order) => {
              const statusConfig = STATUS_CONFIG[order.status] || {
                label: order.status,
                color: "#6b7280",
                bg: "#f3f4f6",
              };
              const isEditing = editingStatus === order.id;

              return (
                <li key={order.id}>
                  <div
                    className={styles.listRow}
                    onClick={() =>
                      !isEditing &&
                      setExpandedOrder(
                        expandedOrder === order.id ? null : order.id
                      )
                    }
                    style={{ cursor: isEditing ? "default" : "pointer" }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: "500" }}>Заказ #{order.id}</div>
                      <div style={{ fontSize: "0.9em", color: "#666" }}>
                        {order.contact_name} · {order.contact_phone}
                      </div>
                      <div style={{ fontSize: "0.85em", color: "#999" }}>
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              "ru-RU"
                            )
                          : ""}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", marginRight: "1rem" }}>
                      {isEditing ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className={styles.statusSelect}
                            disabled={isUpdating}
                          >
                            {STATUS_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusSave(order.id)}
                            className={styles.statusActionBtn}
                            disabled={isUpdating}
                            title="Сохранить"
                          >
                            <Check size={16} />
                          </button>
                          <button
                            onClick={handleStatusCancel}
                            className={styles.statusActionBtn}
                            disabled={isUpdating}
                            title="Отмена"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={styles.badge}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusEdit(order.id, order.status);
                          }}
                          style={{
                            cursor: "pointer",
                            backgroundColor: statusConfig.bg,
                            color: statusConfig.color,
                          }}
                          title="Нажмите для изменения статуса"
                        >
                          <Tag size={14} style={{ marginRight: 6 }} />
                          {statusConfig.label}
                          <ChevronDown size={14} style={{ marginLeft: 6 }} />
                        </div>
                      )}
                      <div style={{ fontWeight: "600", marginTop: "0.5rem" }}>
                        {formatPrice(order.total_price ?? 0)}
                      </div>
                    </div>
                  </div>

                  {expandedOrder === order.id && !isEditing && (
                    <div
                      style={{
                        padding: "1rem",
                        background: "#f9f9f9",
                        borderTop: "1px solid #eee",
                      }}
                    >
                      <div style={{ marginBottom: "1rem" }}>
                        <strong>Информация о доставке:</strong>
                        <p style={{ margin: "0.5rem 0" }}>
                          Адрес: {order.delivery_address}
                        </p>
                        <p style={{ margin: "0.5rem 0" }}>
                          Способ: {order.delivery_method}
                        </p>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div>
                          <strong>Товары в заказе:</strong>
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              margin: "0.5rem 0",
                            }}
                          >
                            {order.items.map((item, idx) => (
                              <li
                                key={idx}
                                style={{
                                  padding: "0.5rem 0",
                                  borderBottom: "1px solid #eee",
                                  fontSize: "0.9em",
                                }}
                              >
                                <div>
                                  {item.product?.name} × {item.quantity}
                                </div>
                                <div style={{ color: "#666" }}>
                                  {formatPrice(item.price ?? 0)} за шт.
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
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
                Math.ceil(totalCount / ITEMS_PER_PAGE)
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
    </main>
  );
};
