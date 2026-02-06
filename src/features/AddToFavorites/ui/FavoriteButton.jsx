import { useState } from "react";
import { Heart } from "lucide-react";
import { useFavorites } from "../../../shared/context/FavoritesContext";
import { useAuth } from "../../../shared/context/AuthContext";
import styles from "./FavoriteButton.module.css";

export const FavoriteButton = ({ productId, variant = "default" }) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavoriteItem } = useFavorites();
  const [isLoading, setIsLoading] = useState(false);
  const isFav = isFavorite(productId);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      alert("Войдите в аккаунт, чтобы добавлять товары в избранное");
      return;
    }

    setIsLoading(true);
    try {
      await toggleFavoriteItem(productId);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`${styles.button} ${styles[variant]} ${isFav ? styles.active : ""}`}
      title={isFav ? "Удалить из избранного" : "Добавить в избранное"}
      aria-label={isFav ? "Удалить из избранного" : "Добавить в избранное"}
    >
      <Heart
        size={variant === "large" ? 24 : 20}
        fill={isFav ? "currentColor" : "none"}
        strokeWidth={2}
      />
      {variant === "large" && (
        <span>{isFav ? "В избранном" : "В избранное"}</span>
      )}
    </button>
  );
};
