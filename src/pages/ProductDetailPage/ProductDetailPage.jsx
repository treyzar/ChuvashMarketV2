import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById } from "../../shared/api/products";
import { AddToCartButton } from "../../features";
import { formatPrice } from "../../shared/lib";
import styles from "./ProductDetailPage.module.css";
import {
  User,
  Check,
  Camera,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
} from "lucide-react";

const FALLBACK_PRODUCT = {
  name: "Товар ЧувашМаркет",
  description:
    "Пример описания товара. Здесь будет кратко рассказано о свойствах и преимуществах продукта.",
  price: 500,
  seller_name: "Продавец ЧувашМаркет",
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) {
      setProduct(FALLBACK_PRODUCT);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchProductById(id)
      .then((data) => {
        if (data?.id) {
          setProduct(data);
        } else {
          setProduct(FALLBACK_PRODUCT);
        }
      })
      .catch(() => {
        setProduct(FALLBACK_PRODUCT);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!product) return null;

  const images = product.images || [];
  const hasImages = images.length > 0;
  const currentImage = hasImages ? images[currentImageIndex] : null;
  const mainImage =
    currentImage?.image_url || currentImage?.image || currentImage?.url || null;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <main className={styles.detailPage}>
      <button className={styles.backButton} onClick={() => navigate(-1)}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <ArrowLeft size={16} /> Назад
        </span>
      </button>

      <div className={styles.container}>
        {/* Галерея товара */}
        <div className={styles.gallery}>
          <div className={styles.mainImage}>
            {mainImage ? (
              <img src={mainImage} alt={product.name} />
            ) : (
              <div className={styles.placeholder}>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Camera size={18} /> Нет изображения
                </span>
              </div>
            )}
          </div>

          {/* Навигация по изображениям */}
          {hasImages && images.length > 1 && (
            <>
              <button
                className={styles.navButton + " " + styles.prevButton}
                onClick={handlePrevImage}
                aria-label="предыдущая"
              >
                <ArrowLeft size={16} />
              </button>
              <button
                className={styles.navButton + " " + styles.nextButton}
                onClick={handleNextImage}
                aria-label="следующая"
              >
                <ArrowRight size={16} />
              </button>
              <div className={styles.imageCounter}>
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Миниатюры */}
          {hasImages && images.length > 1 && (
            <div className={styles.thumbnails}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  className={
                    styles.thumbnail +
                    (idx === currentImageIndex ? " " + styles.active : "")
                  }
                  onClick={() => setCurrentImageIndex(idx)}
                >
                  <img
                    src={img.image_url || img.image || img.url}
                    alt={`товар ${idx + 1}`}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация о товаре */}
        <div className={styles.details}>
          <h1 className={styles.title}>{product.name}</h1>

          {/* Продавец */}
          {product.seller_name && (
            <div className={styles.sellerInfo}>
              <div className={styles.sellerBadge}>
                <User size={16} style={{ marginRight: 8 }} />{" "}
                {product.seller_name}
              </div>
            </div>
          )}

          {/* Цена */}
          <div className={styles.priceSection}>
            <div className={styles.price}>
              {formatPrice(product.price ?? 0)}
            </div>
            <div className={styles.availability}>
              <span className={styles.inStock}>
                <Check size={14} style={{ marginRight: 6 }} /> В наличии
              </span>
            </div>
          </div>

          {/* Описание */}
          <div className={styles.descriptionSection}>
            <h2 className={styles.sectionTitle}>Описание</h2>
            <p className={styles.description}>
              {product.description || FALLBACK_PRODUCT.description}
            </p>
          </div>

          {/* Количество и добавление в корзину */}
          <div className={styles.purchaseSection}>
            <div className={styles.quantityControl}>
              <label htmlFor="quantity">Количество:</label>
              <div className={styles.quantityInput}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={styles.quantityBtn}
                  aria-label="уменьшить"
                >
                  <Minus size={14} />
                </button>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  min="1"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className={styles.quantityBtn}
                  aria-label="увеличить"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <AddToCartButton product={product} className={styles.cartButton} />
          </div>

          {/* Особенности товара */}
          <div className={styles.features}>
            <h2 className={styles.sectionTitle}>Особенности</h2>
            <ul className={styles.featuresList}>
              <li>
                <Check size={14} style={{ marginRight: 8 }} /> Оригинальный
                товар
              </li>
              <li>
                <Check size={14} style={{ marginRight: 8 }} /> Доставка по
                Чувашии
              </li>
              <li>
                <Check size={14} style={{ marginRight: 8 }} /> Возврат в течение
                14 дней
              </li>
              <li>
                <Check size={14} style={{ marginRight: 8 }} /> Гарантия качества
              </li>
            </ul>
          </div>

          {isLoading && (
            <div className={styles.loading}>Загружаем информацию…</div>
          )}
        </div>
      </div>

      {/* Рекомендованные товары (плейсхолдер) */}
      <section className={styles.recommended}>
        <h2>Похожие товары</h2>
        <div className={styles.recommendedList}>
          <p className={styles.emptyState}>Похожих товаров пока нет</p>
        </div>
      </section>
    </main>
  );
};
