import { NavLink } from "react-router-dom";
import { Button } from "../../../shared/ui";
import { ROUTES } from "../../../shared/constants";
import styles from "./Header.module.css";
import { ShoppingCart, LogOut, Home, Package, ShoppingBag, BarChart3, User, LogIn as LoginIcon, Heart } from "lucide-react";
import { useAuth } from "../../../shared/context/AuthContext.jsx";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = ({ isActive }) =>
  [styles.navLink, isActive ? styles.navLinkActive : ""]
    .filter(Boolean)
    .join(" ");

export const Header = ({ cartCount = 0 }) => {
  const { isAuthenticated, user, clearTokens } = useAuth();

  const handleLogout = () => {
    if (window.confirm("Вы уверены, что хотите выйти из аккаунта?")) {
      clearTokens();
    }
  };

  return (
    <header className={styles.root}>
      <div className={styles.inner}>
        <NavLink to={ROUTES.HOME} className={styles.brand}>
          <div className={styles.logo}>
            <img src="/logo.png" alt="ЧувашМаркет" />
          </div>
          <div className={styles.brandText}>
            <span className={styles.brandName}>ЧувашМаркет</span>
            <span className={styles.brandTagline}>Лучшие товары</span>
          </div>
        </NavLink>

        <nav className={styles.nav}>
          <NavLink to={ROUTES.HOME} className={navLinkClass}>
            <Home size={16} />
            <span>Главная</span>
          </NavLink>
          <NavLink to={ROUTES.PRODUCTS} className={navLinkClass}>
            <Package size={16} />
            <span>Каталог</span>
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to={ROUTES.FAVORITES} className={navLinkClass}>
                <Heart size={16} />
                <span>Избранное</span>
              </NavLink>
              <NavLink to={ROUTES.ORDERS} className={navLinkClass}>
                <ShoppingBag size={16} />
                <span>Мои заказы</span>
              </NavLink>
            </>
          )}
          {user?.role === "seller" && (
            <NavLink to={ROUTES.SELLER_DASHBOARD} className={navLinkClass}>
              <BarChart3 size={16} />
              <span>Продавцам</span>
            </NavLink>
          )}
        </nav>

        <div className={styles.right}>
          <ThemeToggle />
          
          <NavLink to={ROUTES.CART} className={styles.cartButton}>
            <div className={styles.cartButtonInner}>
              <ShoppingCart size={18} />
              <span className={styles.cartText}>Корзина</span>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </div>
          </NavLink>

          {isAuthenticated ? (
            <div className={styles.userMenu}>
              <NavLink to={ROUTES.PROFILE} className={styles.profileButton}>
                <User size={18} />
                <span className={styles.profileText}>
                  {user?.first_name || user?.username || "Профиль"}
                </span>
              </NavLink>
              <button 
                onClick={handleLogout}
                className={styles.logoutButton}
                title="Выйти из аккаунта"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <NavLink to={ROUTES.LOGIN} className={styles.loginButton}>
              <LoginIcon size={18} />
              <span>Войти</span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
