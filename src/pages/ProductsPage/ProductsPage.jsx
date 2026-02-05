import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProductCard } from "../../entities";
import { AddToCartButton } from "../../features";
import { fetchProducts } from "../../shared/api/products";
import { ITEMS_PER_PAGE } from "../../shared/constants";
import { Button } from "../../shared/ui";
import styles from "./ProductsPage.module.css";
import { Search, SlidersHorizontal, Package, X } from "lucide-react";

// Хук для дебаунса
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const page = Number(searchParams.get("page") || "1");
  const ordering = searchParams.get("ordering") || "-created_at";
  const search = searchParams.get("search") || "";

  // Дебаунс для поискового запроса (500мс задержка)
  const debouncedSearchInput = useDebounce(searchInput, 500);

  // Инициализация поискового поля из URL
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // Автоматический поиск при изменении debouncedSearchInput
  useEffect(() => {
    // Не обновляем URL, если значение совпадает с текущим search в URL
    if (debouncedSearchInput !== search) {
      const nextParams = new URLSearchParams(searchParams);
      if (debouncedSearchInput) {
        nextParams.set("search", debouncedSearchInput);
      } else {
        nextParams.delete("search");
      }
      nextParams.set("page", "1");
      setSearchParams(nextParams);
    }
  }, [debouncedSearchInput]);

  // Загрузка товаров
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

  const handleSearchClear = () => {
    setSearchInput("");
  };

  const handlePageChange = (nextPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("page", String(nextPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const isSearching = searchInput !== search; // Показываем индикатор поиска

  return (
    <main className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Каталог товаров</h1>
          <p className={styles.subtitle}>
            {totalCount > 0 
              ? `Найдено ${totalCount} ${totalCount === 1 ? 'товар' : totalCount < 5 ? 'товара' : 'товаров'}`
              : 'Выбирайте товары от проверенных продавцов'}
          </p>
        </div>
      </header>

      {/* Filters and Search */}
      <section className={styles.toolbar}>
        <div className={styles.searchWrapper}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Поиск товаров..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={styles.searchInput}
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleSearchClear}
              className={styles.searchClear}
              aria-label="Очистить поиск"
            >
              <X size={18} />
            </button>
          )}
          {isSearching && (
            <div className={styles.searchSpinner}>
              <div className={styles.searchSpinnerIcon}></div>
            </div>
          )}
        </div>

        <div className={styles.filters}>
          <div className={styles.filterGroup}>
            <SlidersHorizontal size={18} />
            <select
              className={styles.select}
              value={ordering}
              onChange={(e) => handleFilterChange({ ordering: e.target.value })}
            >
              <option value="-created_at">Сначала новые</option>
              <option value="created_at">Сначала старые</option>
              <option value="-price">Сначала дороже</option>
              <option value="price">Сначала дешевле</option>
            </select>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className={styles.productsSection}>
        {isLoading && (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>Загружаем товары…</p>
          </div>
        )}

        {error && !isLoading && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Package size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.emptyStateTitle}>Ошибка загрузки</h2>
            <p className={styles.emptyStateText}>{error}</p>
          </div>
        )}

        {!isLoading && !error && products.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>
              <Package size={48} strokeWidth={1.5} />
            </div>
            <h2 className={styles.emptyStateTitle}>Товары не найдены</h2>
            <p className={styles.emptyStateText}>
              {search 
                ? `По запросу "${search}" ничего не найдено. Попробуйте изменить поисковый запрос.`
                : 'К сожалению, товаров пока нет. Загляните позже!'}
            </p>
            {search && (
              <Button onClick={handleSearchClear}>
                Сбросить поиск
              </Button>
            )}
          </div>
        )}

        {!isLoading && products.length > 0 && (
          <>
            <div className={styles.grid}>
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  footer={<AddToCartButton product={product} />}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Назад
                </Button>
                
                <div className={styles.pageNumbers}>
                  {totalPages <= 7 ? (
                    // Показываем все страницы если их <= 7
                    Array.from({ length: totalPages }).map((_, idx) => {
                      const p = idx + 1;
                      return (
                        <button
                          key={p}
                          className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ''}`}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </button>
                      );
                    })
                  ) : (
                    // Показываем с многоточием если страниц > 7
                    <>
                      {page > 3 && (
                        <>
                          <button className={styles.pageButton} onClick={() => handlePageChange(1)}>1</button>
                          <span className={styles.pageEllipsis}>...</span>
                        </>
                      )}
                      
                      {Array.from({ length: 5 }).map((_, idx) => {
                        let p;
                        if (page <= 3) {
                          p = idx + 1;
                        } else if (page >= totalPages - 2) {
                          p = totalPages - 4 + idx;
                        } else {
                          p = page - 2 + idx;
                        }
                        
                        if (p < 1 || p > totalPages) return null;
                        
                        return (
                          <button
                            key={p}
                            className={`${styles.pageButton} ${p === page ? styles.pageButtonActive : ''}`}
                            onClick={() => handlePageChange(p)}
                          >
                            {p}
                          </button>
                        );
                      })}
                      
                      {page < totalPages - 2 && (
                        <>
                          <span className={styles.pageEllipsis}>...</span>
                          <button className={styles.pageButton} onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>

                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Вперёд
                </Button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
};
