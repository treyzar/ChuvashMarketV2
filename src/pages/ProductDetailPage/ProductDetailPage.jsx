import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchProductById } from "../../shared/api/products";
import { AddToCartButton } from "../../features";
import { formatPrice } from "../../shared/lib";
import styles from "./ProductDetailPage.module.css";

const FALLBACK_PRODUCT = {
  name: "Товар ЧувашМаркет",
  description:
    "Пример описания товара. Здесь будет кратко рассказано о свойствах и преимуществах продукта.",
  price: 500,
  seller_name: "Продавец ЧувашМаркет",
};

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(FALLBACK_PRODUCT);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    fetchProductById(id)
      .then((data) => {
        if (data?.id) {
          setProduct(data);
        }
      })
      .catch(() => {
        // fallback
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (!product) return null;

  const mainImage = product.images?.[0]?.url ?? null;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.media}>
          {mainImage ? (
            <img src={mainImage} alt={product.name} />
          ) : (
            <div className={styles.placeholder}>
              <span>Изображение появится здесь</span>
            </div>
          )}
        </div>

        <div className={styles.info}>
          <h1 className={styles.title}>{product.name}</h1>
          {product.seller_name && (
            <div className={styles.seller}>Продавец: {product.seller_name}</div>
          )}
          <div className={styles.price}>{formatPrice(product.price ?? 0)}</div>
          <p className={styles.description}>
            {product.description || FALLBACK_PRODUCT.description}
          </p>

          <div className={styles.actions}>
            <AddToCartButton product={product} />
          </div>

          {isLoading && (
            <p className={styles.hint}>Обновляем информацию о товаре…</p>
          )}
        </div>
      </div>
    </main>
  );
};

