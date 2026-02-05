import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductCard } from "../../entities";
import { AddToCartButton } from "../../features";
import { fetchProducts } from "../../shared/api/products";
import { Button } from "../../shared/ui";
import { ROUTES } from "../../shared/constants";
import styles from "./HomePage.module.css";
import { ShoppingBag, TrendingUp, Shield, Truck, ArrowRight } from "lucide-react";

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
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <ShoppingBag size={16} />
            Локальный маркетплейс
          </div>
          <h1 className={styles.heroTitle}>
            Онлайн‑маркетплейс <span className={styles.heroHighlight}>ЧувашМаркет</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Найдите локальные товары от продавцов Чувашии: от фермерской
            продукции до авторских сувениров. Просто, быстро и безопасно.
          </p>
          <div className={styles.heroActions}>
            <Button
              onClick={() => navigate(ROUTES.PRODUCTS)}
              className={styles.heroCta}
            >
              Перейти в каталог
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
        <div className={styles.heroImage}>
          <div className={styles.heroImageWrapper}>
            <img src="/logo.png" alt="ЧувашМаркет" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon} style={{ background: '#dbeafe' }}>
            <TrendingUp size={24} color="#3b82f6" />
          </div>
          <h3 className={styles.featureTitle}>Лучшие цены</h3>
          <p className={styles.featureText}>
            Прямые поставки от производителей без посредников
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon} style={{ background: '#d1fae5' }}>
            <Shield size={24} color="#10b981" />
          </div>
          <h3 className={styles.featureTitle}>Безопасность</h3>
          <p className={styles.featureText}>
            Проверенные продавцы и защита покупателей
          </p>
        </div>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon} style={{ background: '#fef3c7' }}>
            <Truck size={24} color="#f59e0b" />
          </div>
          <h3 className={styles.featureTitle}>Быстрая доставка</h3>
          <p className={styles.featureText}>
            Доставка по всей Чувашии в кратчайшие сроки
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className={styles.productsSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Новые товары</h2>
            <p className={styles.sectionSubtitle}>
              Свежие поступления от наших продавцов
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => navigate(ROUTES.PRODUCTS)}
            className={styles.sectionLink}
          >
            Смотреть все
            <ArrowRight size={16} />
          </Button>
        </div>

        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Загружаем товары…</p>
          </div>
        )}

        {error && (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}

        {!isLoading && products.length === 0 && !error && (
          <div className={styles.emptyContainer}>
            <p className={styles.emptyText}>Товары не найдены. Попробуйте позже.</p>
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className={styles.grid}>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                footer={<AddToCartButton product={product} />}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};
