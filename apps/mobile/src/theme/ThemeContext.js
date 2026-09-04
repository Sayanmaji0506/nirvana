import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LIGHT, DARK } from './theme';

const THEME_KEY = '@nirvana_theme';

const ThemeContext = createContext({
  colors: LIGHT,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'dark') setIsDark(true);
    }).catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    AsyncStorage.setItem(THEME_KEY, next ? 'dark' : 'light').catch(() => {});
  };

  const value = useMemo(() => ({
    colors: isDark ? DARK : LIGHT,
    isDark,
    toggleTheme,
  }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
