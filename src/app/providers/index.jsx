// Providers configuration
// Здесь подключаются глобальные провайдеры приложения

import { AuthProvider } from "../../shared/context/AuthContext.jsx";
import { CartProvider } from "../../shared/context/CartContext.jsx";

export const withProviders = (Component) => {
  return (props) => (
    <AuthProvider>
      <CartProvider>
        <Component {...props} />
      </CartProvider>
    </AuthProvider>
  );
};

