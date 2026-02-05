import { formatPrice } from "../../../shared/lib";
import styles from "./ProductCard.module.css";

export const ProductCard = ({ product, footer }) => {
  if (!product) return null;

  const firstImage = product.images?.[0];
  const imageSrc =
    firstImage?.image_url || firstImage?.image || firstImage?.url || null;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {imageSrc ? <img src={imageSrc} alt={product.name} /> : null}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{product.name}</h3>
        {product.seller_name && (
          <div className={styles.meta}>Продавец: {product.seller_name}</div>
        )}
      </div>
      <div className={styles.footer}>
        <div className={styles.price}>{formatPrice(product.price ?? 0)}</div>
        {footer ? <div className={styles.actions}>{footer}</div> : null}
      </div>
    </article>
  );
};
