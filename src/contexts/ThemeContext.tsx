import React, { createContext, useContext, useEffect } from 'react';
import { useMangaStore, AppTheme } from '@/store/useMangaStore';

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useMangaStore();

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remover classes de tema existentes
    root.classList.remove('theme-dark-organic', 'theme-paper-light');
    
    // Adicionar a classe do tema atual
    root.classList.add(`theme-${theme}`);
    
    // Atualizar o style color-scheme do navegador
    root.style.colorScheme = theme === 'paper-light' ? 'light' : 'dark';
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
