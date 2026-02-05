import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductCard } from "../../entities";
import { AddToCartButton } from "../../features";
import { fetchProducts } from "../../shared/api/products";
import { ITEMS_PER_PAGE } from "../../shared/constants";
import { Button } from "../../shared/ui";
import styles from "./ProductsPage.module.css";

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const page = Number(searchParams.get("page") || "1");
  const ordering = searchParams.get("ordering") || "-created_at";
  const search = searchParams.get("search") || "";

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const params = {
      page,
      ordering,
      page_size: ITEMS_PER_PAGE,
    };

    if (search) params.search = search;

    fetchProducts(params)
      .then((data) => {
        if (data && typeof data === "object" && Array.isArray(data.results)) {
          setProducts(data.results);
          setTotalCount(Number(data.count) || 0);
        } else if (Array.isArray(data)) {
          setProducts(data);
          setTotalCount(data.length || 0);
        }
      })
      .catch((err) => {
        console.error("Ошибка при загрузке товаров:", err);
        setError("Не удалось загрузить товары");
        setProducts([]);
      })
      .finally(() => setIsLoading(false));
  }, [page, ordering, search]);

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
            {totalCount > 0 &&
              (() => {
                const totalPages = Math.max(
                  1,
                  Math.ceil(totalCount / ITEMS_PER_PAGE),
                );
                if (totalPages <= 10) {
                  return (
                    <div className={styles.pageNumbers}>
                      {Array.from({ length: totalPages }).map((_, idx) => {
                        const p = idx + 1;
                        return (
                          <Button
                            key={p}
                            variant={p === page ? "secondary" : "ghost"}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </Button>
                        );
                      })}
                    </div>
                  );
                }
                return (
                  <span className={styles.pageIndicator}>
                    Страница {page} из {totalPages}
                  </span>
                );
              })()}
            <Button
              variant="secondary"
              disabled={
                totalCount > 0 && page >= Math.ceil(totalCount / ITEMS_PER_PAGE)
              }
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
