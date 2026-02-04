import { Button } from "../../../shared/ui";
import { useCart } from "../../../shared/context/CartContext.jsx";
import styles from "./AddToCartButton.module.css";

export const AddToCartButton = ({ product }) => {
  const { addToCart, isLoading } = useCart();

  const handleClick = () => {
    if (!product) return;
    addToCart(product, 1);
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

