import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  GRAY: "gray",
};

const THEME_STORAGE_KEY = "app-theme";

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved && Object.values(THEMES).includes(saved) ? saved : THEMES.LIGHT;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === THEMES.LIGHT) return THEMES.DARK;
      if (prev === THEMES.DARK) return THEMES.GRAY;
      return THEMES.LIGHT;
    });
  };

  const setSpecificTheme = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    themes: THEMES,
    toggleTheme,
    setTheme: setSpecificTheme,
    isLight: theme === THEMES.LIGHT,
    isDark: theme === THEMES.DARK,
    isGray: theme === THEMES.GRAY,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
