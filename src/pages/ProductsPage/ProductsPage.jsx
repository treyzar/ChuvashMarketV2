import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductCard } from "../../entities";
import { AddToCartButton } from "../../features";
import { fetchProducts } from "../../shared/api/products";
import { Button } from "../../shared/ui";
import styles from "./ProductsPage.module.css";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page") || "1");
  const ordering = searchParams.get("ordering") || "-created_at";
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const params = {
      page,
      ordering,
      limit: 12,
    };

    if (category) params.category = category;
    if (search) params.search = search;

    fetchProducts(params)
      .then((data) => {
        if (Array.isArray(data?.results)) {
          setProducts(data.results);
        } else if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch((err) => {
        console.error("Ошибка при загрузке товаров:", err);
        setError("Не удалось загрузить товары");
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, [page, ordering, category, search]);

  const handleFilterChange = (next) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) => {
      if (!value) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    });
    nextParams.set("page", "1");
    setSearchParams(nextParams);
  };

  const handlePageChange = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
  };

  const goToProduct = (id) => {
    navigate(`/products/${id}`);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Каталог ЧувашМаркет</h1>
          <p className={styles.subtitle}>
            Выбирайте товары от проверенных продавцов Чувашии. Отфильтруйте по
            категории и цене, чтобы быстрее найти нужное.
          </p>
        </div>
      </header>

      <section className={styles.toolbar}>
        <div className={styles.filters}>
          <select
            className={styles.select}
            value={category}
            onChange={(e) =>
              handleFilterChange({ category: e.target.value || null })
            }
          >
            <option value="">Все категории</option>
            <option value="food">Еда и фермерские продукты</option>
            <option value="clothes">Одежда и аксессуары</option>
            <option value="home">Дом и интерьер</option>
            <option value="souvenirs">Сувениры и подарки</option>
          </select>

          <select
            className={styles.select}
            value={ordering}
            onChange={(e) => handleFilterChange({ ordering: e.target.value })}
          >
            <option value="created_at">Сначала новые</option>
            <option value="-price">По цене: сначала дороже</option>
            <option value="price">По цене: сначала дешевле</option>
          </select>
        </div>
      </section>

      <section>
        {isLoading && (
          <p className={styles.hint}>Загружаем товары ЧувашМаркет…</p>
        )}
        {error && (
          <p className={styles.hint} style={{ color: "red" }}>
            {error}
          </p>
        )}
        {!isLoading && !error && products.length === 0 && (
          <p className={styles.hint}>
            К сожалению, товаров по вашему запросу не найдено.
          </p>
        )}

        {products.length > 0 && (
          <div className={styles.grid}>
            {products.map((product) => (
              <div key={product.id} className={styles.cardWrapper}>
                <ProductCard
                  product={product}
                  footer={<AddToCartButton product={product} />}
                />
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => goToProduct(product.id)}
                >
                  О товаре
                </Button>
              </div>
            ))}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <div className={styles.pagination}>
            <Button
              variant="secondary"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
            >
              Назад
            </Button>
            <span className={styles.pageIndicator}>Страница {page}</span>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(page + 1)}
            >
              Вперёд
            </Button>
          </div>
        )}
      </section>
    </main>
  );
};
