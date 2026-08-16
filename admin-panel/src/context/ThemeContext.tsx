import { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export const ThemeContext = createContext<{
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggledarkLight: () => void;
  togglesystem: () => void;
}>({
  theme: 'system' as ThemeMode,
  setTheme: () => {},
  toggledarkLight: () => {},
  togglesystem: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeInternal] = useState<ThemeMode>('system');

  useEffect(() => {
    const storedTheme = localStorage.getItem('sc_theme');
    if (storedTheme) {
      setThemeInternal(storedTheme as ThemeMode);
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const matchTheme = () => {
      if (storedTheme) {
        setThemeInternal(storedTheme as ThemeMode);
        return;
      }
      setThemeInternal(prefersDark ? 'dark' : 'light');
    };

    matchTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (storedTheme === null) {
        setThemeInternal(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener?.('change', handleChange);
    return () => mediaQuery.removeEventListener?.('change', handleChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeInternal(mode);
  };

const _toggleDarkLight = () => {
  if (theme === 'dark') {
    setTheme('light');
  } else {
    setTheme('dark');
  }
};

const _toggleSystem = () => {
  setTheme('system');
};

return (
  <ThemeContext.Provider value={{ theme, setTheme, toggledarkLight: _toggleDarkLight, togglesystem: _toggleSystem }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);