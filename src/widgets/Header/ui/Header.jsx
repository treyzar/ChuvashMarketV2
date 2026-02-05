import { NavLink } from "react-router-dom";
import { Button } from "../../../shared/ui";
import { ROUTES } from "../../../shared/constants";
import styles from "./Header.module.css";
import { ShoppingCart } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext.jsx";

const navLinkClass = ({ isActive }) =>
  [styles.navLink, isActive ? styles.navLinkActive : ""]
    .filter(Boolean)
    .join(" ");

export const Header = ({ cartCount = 0 }) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <NavLink to={ROUTES.HOME} className={styles.brand}>
          <div className={styles.logo}>
            {/* Лого. Положите предоставленное изображение, например, в public/logo.png */}
            <img src="/logo.png" alt="ЧувашМаркет" />
          </div>
          <span>ЧувашМаркет</span>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to={ROUTES.HOME} className={navLinkClass}>
            Главная
          </NavLink>
          <NavLink to={ROUTES.PRODUCTS} className={navLinkClass}>
            Каталог
          </NavLink>
          {isAuthenticated && (
            <NavLink to={ROUTES.ORDERS} className={navLinkClass}>
              Мои заказы
            </NavLink>
          )}
          {user?.role === "seller" && (
            <NavLink to={ROUTES.SELLER_DASHBOARD} className={navLinkClass}>
              Продавцам
            </NavLink>
          )}
        </nav>

        <div className={styles.right}>
          <NavLink to={ROUTES.CART} className={styles.cartButton}>
            <Button variant="secondary">
              <span
                style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
              >
                <ShoppingCart size={16} /> Корзина
              </span>
            </Button>
            {cartCount > 0 && (
              <span className={styles.cartBadge}>{cartCount}</span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <NavLink to={ROUTES.PROFILE} className={styles.authLink}>
              Кабинет
            </NavLink>
          ) : (
            <NavLink to={ROUTES.LOGIN} className={styles.authLink}>
              Войти
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
