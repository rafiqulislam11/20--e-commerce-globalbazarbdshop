import React, { createContext, useContext, useState, useEffect } from 'react';
import bnDict from '../locales/bn.json';
import enDict from '../locales/en.json';

type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  setLang: (l: Language) => void;
  t: (path: string, fallback?: string) => string;
  formatPrice: (amount?: number | null) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('globalbazar_lang') as Language;
    return saved === 'en' ? 'en' : 'bn'; // Default primary is Bangla
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('globalbazar_lang', newLang);
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path: string, fallback = ''): string => {
    const dict = lang === 'bn' ? bnDict : enDict;
    const parts = path.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return fallback || path;
      }
    }

    return typeof current === 'string' ? current : fallback || path;
  };

  const formatPrice = (amount?: number | null): string => {
    if (amount === undefined || amount === null) return '৳0';
    const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
    return `৳${formatted}`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
