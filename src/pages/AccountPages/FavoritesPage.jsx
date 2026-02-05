import { useEffect, useState } from "react";
import styles from "./AccountPages.module.css";

const STORAGE_KEY = "cm_favorites";

const loadFavorites = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

export const FavoritesPage = () => {
  const [items, setItems] = useState(() => loadFavorites());

  useEffect(() => {
    setItems(loadFavorites());
  }, []);

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Избранное</h1>
      <section className={styles.card}>
        {items.length === 0 ? (
          <p className={styles.hint}>
            Вы ещё не добавили товары в избранное. В следующих версиях кнопка
            «В избранное» появится на карточке товара.
          </p>
        ) : (
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.id} className={styles.listRow}>
                <span>{item.name}</span>
                <span>{item.price}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

