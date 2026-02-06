import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "../shared/constants";
import { ProtectedRoute } from "../shared/ui";
import { Header } from "../widgets";
import { HomePage } from "./HomePage";
import { ProductsPage } from "./ProductsPage/ProductsPage.jsx";
import { ProductDetailPage } from "./ProductDetailPage/ProductDetailPage.jsx";
import { CartPage } from "./CartPage/CartPage.jsx";
import { CheckoutPage } from "./CheckoutPage/CheckoutPage.jsx";
import { LoginPage } from "./AuthPages/LoginPage.jsx";
import { RegisterPage } from "./AuthPages/RegisterPage.jsx";
import { ProfilePage } from "./AccountPages/ProfilePage.jsx";
import { OrdersPage } from "./AccountPages/OrdersPage.jsx";
import { OrderDetailPage } from "./AccountPages/OrderDetailPage.jsx";
import { FavoritesPage } from "./AccountPages/FavoritesPage.jsx";
import { SellerDashboardPage } from "./SellerPages/SellerDashboardPage.jsx";
import { SellerProductsPage } from "./SellerPages/SellerProductsPage.jsx";
import { SellerOrdersPage } from "./SellerPages/SellerOrdersPage.jsx";
import { useCart } from "../shared/context/CartContext.jsx";

const Placeholder = ({ title }) => (
  <main style={{ maxWidth: 960, margin: "1.5rem auto", padding: "0 1.25rem" }}>
    <h1 style={{ marginBottom: "0.75rem" }}>{title}</h1>
    <p>Страница будет расширена в следующих итерациях MVP.</p>
  </main>
);

export const AppRoutes = () => {
  const { cartCount } = useCart();

  return (
    <BrowserRouter>
      <Header cartCount={cartCount} />
      <Routes>
        {/* Публичные маршруты */}
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.PRODUCTS} element={<ProductsPage />} />
        <Route path={ROUTES.PRODUCT_DETAIL} element={<ProductDetailPage />} />
        <Route path={ROUTES.CART} element={<CartPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Защищенные маршруты (требуется авторизация) */}
        <Route
          path={ROUTES.CHECKOUT}
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDERS}
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ORDER_DETAIL}
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.FAVORITES}
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        {/* Маршруты для продавцов */}
        <Route
          path={ROUTES.SELLER_DASHBOARD}
          element={
            <ProtectedRoute requireRole="seller">
              <SellerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SELLER_PRODUCTS}
          element={
            <ProtectedRoute requireRole="seller">
              <SellerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SELLER_ORDERS}
          element={
            <ProtectedRoute requireRole="seller">
              <SellerOrdersPage />
            </ProtectedRoute>
          }
        />

        {/* Маршруты для администраторов */}
        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute requireRole="admin">
              <Placeholder title="Административная панель" />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={<Placeholder title="Страница не найдена" />}
        />
      </Routes>
    </BrowserRouter>
  );
};
