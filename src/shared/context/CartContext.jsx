import { createContext, useContext, useEffect, useState } from "react";
import {
  addToCartApi,
  fetchCart,
  removeCartItemApi,
  updateCartItemApi,
} from "../api/cart";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    fetchCart()
      .then((data) => {
        if (isMounted && data?.items) {
          setItems(data.items);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const addToCart = async (product, quantity = 1) => {
    setIsLoading(true);
    try {
      await addToCartApi(product.id, quantity);
      // Для MVP можно просто добавить локально, не дожидаясь ответа корзины
      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item,
          );
        }
        return [...prev, { id: `local-${product.id}`, product, quantity }];
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItem = async (itemId, quantity) => {
    setIsLoading(true);
    try {
      await updateCartItemApi(itemId, quantity);
      setItems((prev) =>
        prev
          .map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.max(1, quantity) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCartItem = async (itemId) => {
    setIsLoading(true);
    try {
      await removeCartItemApi(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const cartCount = items.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
  const total = items.reduce(
    (sum, item) => sum + (item.quantity ?? 0) * (item.product.price ?? 0),
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cartCount,
        total,
        isLoading,
        addToCart,
        updateCartItem,
        removeCartItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
};

