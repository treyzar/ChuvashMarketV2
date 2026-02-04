import { formatPrice } from "../../../shared/lib";
import styles from "./ProductCard.module.css";

export const ProductCard = ({ product, footer }) => {
  if (!product) return null;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} />
        ) : null}
      </div>
      <h3 className={styles.title}>{product.name}</h3>
      <div className={styles.price}>{formatPrice(product.price ?? 0)}</div>
      {product.seller_name && (
        <div className={styles.meta}>Продавец: {product.seller_name}</div>
      )}
      {footer ? <div className={styles.actions}>{footer}</div> : null}
    </article>
  );
};

