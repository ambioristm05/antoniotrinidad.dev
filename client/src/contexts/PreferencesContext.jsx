import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const PreferencesContext = createContext(null);

function getInitialPreference(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  return window.localStorage.getItem(key) ?? fallback;
}

export function PreferencesProvider({ children }) {
  const [theme, setTheme] = useState(() => getInitialPreference('theme', 'light'));
  const [language, setLanguage] = useState(() => getInitialPreference('language', 'es'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('language', language);
  }, [language]);

  const value = useMemo(
    () => ({
      theme,
      language,
      toggleTheme: () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
      setLanguage,
      toggleLanguage: () => setLanguage((current) => (current === 'es' ? 'en' : 'es')),
    }),
    [language, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences must be used inside PreferencesProvider');
  }

  return context;
}
