import { Sun, Moon, Palette } from "lucide-react";
import { useTheme } from "../../../shared/context/ThemeContext";
import styles from "./ThemeToggle.module.css";

export const ThemeToggle = () => {
  const { theme, themes, toggleTheme } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case themes.LIGHT:
        return <Sun size={20} />;
      case themes.DARK:
        return <Moon size={20} />;
      case themes.GRAY:
        return <Palette size={20} />;
      default:
        return <Sun size={20} />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case themes.LIGHT:
        return "Светлая";
      case themes.DARK:
        return "Тёмная";
      case themes.GRAY:
        return "Серая";
      default:
        return "Светлая";
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={styles.button}
      title={`Текущая тема: ${getLabel()}. Нажмите для смены`}
      aria-label="Переключить тему"
    >
      {getIcon()}
      <span className={styles.label}>{getLabel()}</span>
    </button>
  );
};
