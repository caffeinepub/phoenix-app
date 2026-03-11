import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark";
type DarkNameColor = "white" | "maroon";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  darkNameColor: DarkNameColor;
  setDarkNameColor: (c: DarkNameColor) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const DARK_COLOR_KEY = "phonex_dark_name_color";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [darkNameColor, setDarkNameColorState] = useState<DarkNameColor>(
    () =>
      (localStorage.getItem(DARK_COLOR_KEY) as DarkNameColor | null) ?? "white",
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setDarkNameColor = (c: DarkNameColor) => {
    setDarkNameColorState(c);
    localStorage.setItem(DARK_COLOR_KEY, c);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        isDark: theme === "dark",
        darkNameColor,
        setDarkNameColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
