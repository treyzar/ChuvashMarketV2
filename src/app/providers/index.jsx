// Providers configuration
// Здесь подключаются глобальные провайдеры приложения

import { AuthProvider } from "../../shared/context/AuthContext.jsx";
import { CartProvider } from "../../shared/context/CartContext.jsx";
import { FavoritesProvider } from "../../shared/context/FavoritesContext.jsx";
import { ThemeProvider } from "../../shared/context/ThemeContext.jsx";

export const withProviders = (Component) => {
  return (props) => (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Component {...props} />
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

