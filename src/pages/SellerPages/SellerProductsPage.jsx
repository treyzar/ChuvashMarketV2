import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ITEMS_PER_PAGE } from "../../shared/constants";
import { Button } from "../../shared/ui";
import {
  fetchSellerProducts,
  deleteSellerProduct,
} from "../../shared/api/seller";
import { formatPrice } from "../../shared/lib";
import { CheckCircle, Circle } from "lucide-react";
import styles from "./SellerPages.module.css";
import { useAuth } from "../../shared/context/AuthContext.jsx";

const AddProductModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price || !form.category) {
      setError("Заполните все обязательные поля");
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: parseInt(form.category),
        is_published: true,
      });
      onClose();
    } catch (err) {
      setError("Не удалось добавить товар");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "8px",
          maxWidth: "500px",
          width: "90%",
        }}
      >
        <h2>Добавить товар</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>
          )}

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ display: "block", marginBottom: "0.5rem" }}>
              Название *
            </span>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Название товара"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ display: "block", marginBottom: "0.5rem" }}>
              Описание
            </span>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Опишите товар"
              rows={4}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
                fontFamily: "inherit",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ display: "block", marginBottom: "0.5rem" }}>
              Цена (₽) *
            </span>
            <input
              type="number"
              value={form.price}
              onChange={handleChange("price")}
              placeholder="100"
              step="0.01"
              min="0"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </label>

          <label style={{ display: "block", marginBottom: "1rem" }}>
            <span style={{ display: "block", marginBottom: "0.5rem" }}>
              Категория *
            </span>
            <select
              value={form.category}
              onChange={handleChange("category")}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <option value="">Выберите категорию</option>
              <option value="1">Еда и напитки</option>
              <option value="2">Сувениры</option>
              <option value="3">Одежда и аксессуары</option>
              <option value="4">Дом и интерьер</option>
              <option value="5">Косметика и здоровье</option>
            </select>
          </label>

          <div style={{ display: "flex", gap: "1rem" }}>
            <Button type="submit" disabled={isLoading} style={{ flex: 1 }}>
              {isLoading ? "Добавляю..." : "Добавить"}
            </Button>
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              style={{ flex: 1 }}
            >
              Отмена
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page") || "1");

  if (!isAuthenticated || user?.role !== "seller") {
    return (
      <main className={styles.page}>
        <h1 className={styles.title}>Мои товары</h1>
        <section className={styles.card}>
          <p className={styles.hint}>
            Доступно только для продавцов. Войдите в аккаунт или запросите
            статус продавца.
          </p>
        </section>
      </main>
    );
  }

  const loadProducts = () => {
    setIsLoading(true);
    fetchSellerProducts({ page, page_size: ITEMS_PER_PAGE })
      .then((data) => {
        if (data && typeof data === "object" && Array.isArray(data.results)) {
          setProducts(data.results);
          setTotalCount(Number(data.count) || 0);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalCount(data.length || 0);
        }
      })
      .catch((err) => console.error("Ошибка загрузки товаров:", err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDelete = async (productId) => {
    if (!window.confirm("Вы уверены?")) return;
    try {
      await deleteSellerProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      alert("Не удалось удалить товар");
    }
  };

  const handleAddProduct = async (data) => {
    try {
      const result = await fetch(
        `${window.location.origin}/api/sellers/products/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("cm_access_token")}`,
          },
          body: JSON.stringify(data),
        },
      ).then((r) => r.json());
      setProducts((prev) => [result, ...prev]);
      return result;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Мои товары</h1>
      <div className={styles.headerRow}>
        <Button onClick={() => setShowModal(true)}>Добавить товар</Button>
      </div>
      <section className={styles.card}>
        {isLoading && <p className={styles.hint}>Загружаем товары…</p>}
        {!isLoading && products.length === 0 ? (
          <p className={styles.hint}>
            Вы ещё не добавили товары. Начните с кнопки «Добавить товар».
          </p>
        ) : (
          <ul className={styles.list}>
            {products.map((product) => (
              <li key={product.id} className={styles.listRow}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: "500" }}>{product.name}</div>
                  <div style={{ fontSize: "0.9em", color: "#666" }}>
                    {product.description?.substring(0, 50)}...
                  </div>
                </div>
                <div style={{ textAlign: "right", marginRight: "1rem" }}>
                  <div>{formatPrice(product.price ?? 0)}</div>
                  <div className={styles.badge}>
                    {product.is_published ? (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <CheckCircle size={16} /> <span>Опубликован</span>
                      </span>
                    ) : (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Circle size={14} /> <span>Черновик</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Удалить
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      {products.length > 0 && (
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
          {totalCount > 0 &&
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
                            setSearchParams((pms) => {
                              const np = new URLSearchParams(pms);
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
            })()}
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
      {showModal && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onSave={handleAddProduct}
        />
      )}
    </main>
  );
};
