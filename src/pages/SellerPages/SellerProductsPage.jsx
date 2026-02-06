import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ITEMS_PER_PAGE } from "../../shared/constants";
import { Button } from "../../shared/ui";
import {
  fetchSellerProducts,
  deleteSellerProduct,
  createSellerProduct,
  updateSellerProduct,
} from "../../shared/api/seller";
import { formatPrice } from "../../shared/lib";
import { CheckCircle, Circle, Upload, X, Image as ImageIcon, Edit2 } from "lucide-react";
import styles from "./SellerPages.module.css";
import { useAuth } from "../../shared/context/AuthContext.jsx";

const ProductModal = ({ onClose, onSave, product = null }) => {
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || "",
    is_published: product?.is_published ?? true,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState(product?.images || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (event) => {
    const value = field === "is_published" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length + images.length + existingImages.length > 5) {
      setError("Максимум 5 изображений");
      return;
    }
    setImages((prev) => [...prev, ...files]);
    setError("");
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.price) {
      setError("Заполните все обязательные поля");
      return;
    }

    setIsLoading(true);
    try {
      const productData = {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        is_published: form.is_published,
      };

      let savedProduct;
      if (product) {
        savedProduct = await updateSellerProduct(product.id, productData);
      } else {
        savedProduct = await createSellerProduct(productData);
      }

      // Загружаем изображения
      if (images.length > 0) {
        const token = localStorage.getItem("cm_access_token");
        for (const image of images) {
          const formData = new FormData();
          formData.append("product", savedProduct.id);
          formData.append("image", image);

          await fetch(`${window.location.origin}/api/images/`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          });
        }
      }

      await onSave();
      onClose();
    } catch (err) {
      setError(product ? "Не удалось обновить товар" : "Не удалось добавить товар");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {product ? "Редактировать товар" : "Добавить товар"}
          </h2>
          <button className={styles.modalClose} onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {error && <div className={styles.modalError}>{error}</div>}

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Название <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={handleChange("name")}
              placeholder="Название товара"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>Описание</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              placeholder="Опишите товар подробно"
              rows={4}
              className={styles.formTextarea}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Цена (₽) <span className={styles.required}>*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={handleChange("price")}
              placeholder="1000"
              step="0.01"
              min="0"
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formCheckbox}>
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={handleChange("is_published")}
              />
              <span>Опубликовать товар</span>
            </label>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formLabel}>
              Изображения (до 5 шт.)
            </label>
            
            {existingImages.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {existingImages.map((img, idx) => (
                  <div key={idx} className={styles.imagePreview}>
                    <img src={img.image_url} alt="" />
                    <div className={styles.imageLabel}>Загружено</div>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <div className={styles.imagePreviewGrid}>
                {images.map((file, idx) => (
                  <div key={idx} className={styles.imagePreview}>
                    <img src={URL.createObjectURL(file)} alt="" />
                    <button
                      type="button"
                      className={styles.imageRemove}
                      onClick={() => removeImage(idx)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length + existingImages.length < 5 && (
              <label className={styles.fileUpload}>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
                <Upload size={20} />
                <span>Выбрать изображения</span>
              </label>
            )}
          </div>

          <div className={styles.modalFooter}>
            <Button type="button" variant="secondary" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Сохраняю..." : product ? "Сохранить" : "Добавить"}
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
  const [editingProduct, setEditingProduct] = useState(null);
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
    if (!window.confirm("Вы уверены, что хотите удалить этот товар?")) return;
    try {
      await deleteSellerProduct(productId);
      loadProducts();
    } catch (err) {
      console.error("Ошибка удаления товара:", err);
      alert("Не удалось удалить товар");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSave = async () => {
    await loadProducts();
  };

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Мои товары</h1>
          <p className={styles.pageSubtitle}>Управление вашими товарами</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Upload size={16} />
          Добавить товар
        </Button>
      </div>

      <section className={styles.card}>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Загружаем товары…</p>
          </div>
        )}
        
        {!isLoading && products.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <ImageIcon size={32} />
            </div>
            <h3 className={styles.emptyStateTitle}>Нет товаров</h3>
            <p className={styles.emptyStateText}>
              Вы ещё не добавили товары. Начните с кнопки «Добавить товар».
            </p>
            <Button onClick={() => setShowModal(true)}>
              <Upload size={16} />
              Добавить первый товар
            </Button>
          </div>
        ) : (
          !isLoading && (
            <div className={styles.productsGrid}>
              {products.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0].image_url} alt={product.name} />
                    ) : (
                      <div className={styles.productImagePlaceholder}>
                        <ImageIcon size={32} />
                      </div>
                    )}
                    <div className={styles.productStatus}>
                      {product.is_published ? (
                        <span className={styles.statusPublished}>
                          <CheckCircle size={14} /> Опубликован
                        </span>
                      ) : (
                        <span className={styles.statusDraft}>
                          <Circle size={14} /> Черновик
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.productInfo}>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productDescription}>
                      {product.description?.substring(0, 80)}
                      {product.description?.length > 80 ? "..." : ""}
                    </p>
                    <div className={styles.productPrice}>
                      {formatPrice(product.price ?? 0)}
                    </div>
                  </div>
                  <div className={styles.productActions}>
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(product)}
                      fullWidth
                    >
                      <Edit2 size={16} />
                      Редактировать
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(product.id)}
                      fullWidth
                      className={styles.deleteButton}
                    >
                      <X size={16} />
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )
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
        <ProductModal
          onClose={handleCloseModal}
          onSave={handleSave}
          product={editingProduct}
        />
      )}
    </main>
  );
};
