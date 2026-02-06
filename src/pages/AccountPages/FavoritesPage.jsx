import { Heart, Package, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useFavorites } from "../../shared/context/FavoritesContext";
import { useCart } from "../../shared/context/CartContext";
import { ProductCard } from "../../entities/Product";
import { AddToCartButton } from "../../features";
import { Button } from "../../shared/ui";
import styles from "./AccountPages.module.css";

export const FavoritesPage = () => {
  const { favorites, isLoading } = useFavorites();
  const { addToCart } = useCart();
  const [isAddingAll, setIsAddingAll] = useState(false);

  const handleAddAllToCart = async () => {
    if (favorites.length === 0) return;

    setIsAddingAll(true);
    try {
      for (const favorite of favorites) {
        if (favorite.product) {
          await addToCart(favorite.product, 1);
        }
      }
      alert(`Добавлено ${favorites.length} товаров в корзину!`);
    } catch (error) {
      console.error("Ошибка добавления в корзину:", error);
      alert("Не удалось добавить все товары в корзину");
    } finally {
      setIsAddingAll(false);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Загружаем избранное…</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            <Heart size={28} strokeWidth={2} /> Избранное
          </h1>
          <p className={styles.pageSubtitle}>
            {favorites.length > 0
              ? `У вас ${favorites.length} ${favorites.length === 1 ? "товар" : "товара"} в избранном`
              : "Здесь будут товары, которые вы добавите в избранное"}
          </p>
        </div>
        {favorites.length > 0 && (
          <Button 
            onClick={handleAddAllToCart} 
            disabled={isAddingAll}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <ShoppingCart size={18} />
            {isAddingAll ? "Добавляем..." : "Добавить всё в корзину"}
          </Button>
        )}
      </div>

      {favorites.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>
            <Package size={48} strokeWidth={1.5} />
          </div>
          <h2 className={styles.emptyStateTitle}>Избранное пусто</h2>
          <p className={styles.emptyStateText}>
            Добавляйте товары в избранное, чтобы не потерять их
          </p>
          <Button onClick={() => (window.location.href = "/products")}>
            Перейти в каталог
          </Button>
        </section>
      ) : (
        <div className={styles.favoritesGrid}>
          {favorites.map((favorite) => (
            <ProductCard 
              key={favorite.id} 
              product={favorite.product}
              footer={<AddToCartButton product={favorite.product} />}
            />
          ))}
        </div>
      )}
    </main>
  );
};
