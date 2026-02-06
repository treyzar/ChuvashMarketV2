import { createContext, useContext, useState, useEffect } from "react";
import { fetchFavorites, toggleFavorite } from "../api/favorites";
import { useAuth } from "./AuthContext";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);

  const loadFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setIsLoading(true);
    try {
      const data = await fetchFavorites();
      const items = Array.isArray(data) ? data : data?.results || [];
      setFavorites(items);
      setFavoriteIds(new Set(items.map((fav) => fav.product?.id).filter(Boolean)));
    } catch (error) {
      console.error("Ошибка загрузки избранного:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const toggleFavoriteItem = async (productId) => {
    if (!isAuthenticated) {
      return false;
    }

    try {
      const response = await toggleFavorite(productId);
      await loadFavorites();
      return response?.is_favorite ?? false;
    } catch (error) {
      console.error("Ошибка переключения избранного:", error);
      return false;
    }
  };

  const isFavorite = (productId) => {
    return favoriteIds.has(productId);
  };

  const value = {
    favorites,
    favoriteIds,
    isLoading,
    toggleFavoriteItem,
    isFavorite,
    refreshFavorites: loadFavorites,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};
