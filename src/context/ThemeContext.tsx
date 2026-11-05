import React, { createContext, useContext, useState, useEffect } from "react";

export type AppTheme = "dark" | "light";

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "korat_smartagri_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window !== "undefined" && window.localStorage) {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return stored;
      }
      // Check system preference if no stored theme
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    }
    return "dark";
  });

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light-mode");
      root.classList.remove("theme-dark-mode", "dark");
      root.style.colorScheme = "light";
    } else {
      root.classList.add("theme-dark-mode", "dark");
      root.classList.remove("theme-light-mode");
      root.style.colorScheme = "dark";
    }
  }, [theme]);

  const isDark = theme === "dark";

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
