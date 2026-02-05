import { Button } from "../../../shared/ui";
import { useCart } from "../../../shared/context/CartContext.jsx";
import styles from "./AddToCartButton.module.css";

export const AddToCartButton = ({ product, quantity = 1 }) => {
  const { addToCart, isLoading } = useCart();

  const handleClick = () => {
    if (!product) return;
    addToCart(product, quantity);
  };

  return (
    <Button
      className={styles.button}
      onClick={handleClick}
      disabled={!product || isLoading}
    >
      {isLoading ? "Добавляем..." : "Добавить в корзину"}
    </Button>
  );
};

