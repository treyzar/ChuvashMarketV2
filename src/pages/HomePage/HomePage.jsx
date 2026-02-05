import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../../entities";
import { AddToCartButton } from "../../features";
import { fetchProducts } from "../../shared/api/products";
import { Button } from "../../shared/ui";
import { ROUTES } from "../../shared/constants";
import styles from "./HomePage.module.css";

export const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetchProducts({ ordering: "-created_at", limit: 8 })
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data?.results)) {
            setProducts(data.results);
          } else if (Array.isArray(data)) {
            setProducts(data);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Ошибка при загрузке товаров:", err);
          setError("Не удалось загрузить товары. Попробуйте позже.");
          setProducts([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div>
          <h1 className={styles.heroTitle}>Онлайн‑маркетплейс ЧувашМаркет</h1>
          <p className={styles.heroSubtitle}>
            Найдите локальные товары от продавцов Чувашии: от фермерской
            продукции до авторских сувениров. Просто, быстро и безопасно.
          </p>
          <Button
            style={{ marginTop: "1rem" }}
            onClick={() => navigate(ROUTES.PRODUCTS)}
          >
            Перейти в каталог
          </Button>
        </div>
        <div className={styles.heroBanner}>
          <img src="/logo.png" alt="ЧувашМаркет" />
        </div>
      </section>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Новые товары</h2>
        </div>

        <div className={styles.grid}>
          {isLoading && <p>Загрузка товаров...</p>}
          {error && <p style={{ color: "red" }}>{error}</p>}
          {!isLoading && products.length === 0 && !error && (
            <p>Товары не найдены. Попробуйте позже.</p>
          )}
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              footer={<AddToCartButton product={product} />}
            />
          ))}
        </div>
      </section>
    </main>
  );
};
