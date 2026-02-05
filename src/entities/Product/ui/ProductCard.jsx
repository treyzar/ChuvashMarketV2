import { useNavigate } from "react-router-dom";
import { formatPrice } from "../../../shared/lib";
import { ROUTES } from "../../../shared/constants";
import styles from "./ProductCard.module.css";

export const ProductCard = ({ product, footer }) => {
  const navigate = useNavigate();

  if (!product) return null;

  const firstImage = product.images?.[0];
  const imageSrc =
    firstImage?.image_url || firstImage?.image || firstImage?.url || null;

  const handleCardClick = (e) => {
    // Не переходим, если клик был по кнопке или её дочерним элементам
    if (e.target.closest('button')) {
      return;
    }
    navigate(`${ROUTES.PRODUCTS}/${product.id}`);
  };

  return (
    <article className={styles.card} onClick={handleCardClick} style={{ cursor: 'pointer' }}>
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
