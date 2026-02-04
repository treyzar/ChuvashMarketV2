import { useNavigate } from "react-router-dom";
import { useCart } from "../../shared/context/CartContext.jsx";
import { Button } from "../../shared/ui";
import { formatPrice } from "../../shared/lib";
import { ROUTES } from "../../shared/constants";
import styles from "./CartPage.module.css";

export const CartPage = () => {
  const { items, total, updateCartItem, removeCartItem } = useCart();
  const navigate = useNavigate();

  const updateQuantity = (id, quantity) => {
    updateCartItem(id, quantity);
  };

  const removeItem = (id) => {
    removeCartItem(id);
  };

  const goToCheckout = () => {
    if (!items.length) return;
    navigate(ROUTES.CHECKOUT);
  };

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Корзина</h1>

      {!items.length ? (
        <p className={styles.empty}>
          В корзине пока нет товаров. Добавьте что‑нибудь из каталога.
        </p>
      ) : (
        <div className={styles.layout}>
          <section className={styles.list}>
            {items.map((item) => (
              <article key={item.id} className={styles.row}>
                <div className={styles.info}>
                  <h2 className={styles.name}>{item.product.name}</h2>
                  {item.product.seller_name && (
                    <p className={styles.seller}>
                      Продавец: {item.product.seller_name}
                    </p>
                  )}
                </div>
                <div className={styles.controls}>
                  <div className={styles.counter}>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, (item.quantity ?? 1) - 1)
                      }
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity ?? 1}
                      onChange={(e) =>
                        updateQuantity(item.id, Number(e.target.value) || 1)
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.id, (item.quantity ?? 1) + 1)
                      }
                    >
                      +
                    </button>
                  </div>
                  <div className={styles.price}>
                    {formatPrice(
                      (item.product.price ?? 0) * (item.quantity ?? 0),
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeItem(item.id)}
                  >
                    Удалить
                  </button>
                </div>
              </article>
            ))}
          </section>

          <aside className={styles.sidebar}>
            <div className={styles.summary}>
              <div className={styles.summaryRow}>
                <span>Итого</span>
                <span className={styles.summaryPrice}>{formatPrice(total)}</span>
              </div>
              <Button fullWidth onClick={goToCheckout}>
                Перейти к оформлению
              </Button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
};

