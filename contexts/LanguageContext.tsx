
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, options?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translationsCache: Partial<Record<Language, any>> = {};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('eixo-language', 'pt-BR');
  const [translations, setTranslations] = useState<any>(translationsCache[language] || {});

  useEffect(() => {
    const fetchTranslations = async () => {
      if (translationsCache[language]) {
        setTranslations(translationsCache[language]);
        return;
      }
      try {
        const response = await fetch(`/locales/${language}.json`);
        const data = await response.json();
        translationsCache[language] = data;
        setTranslations(data);
      } catch (error) {
        console.error(`Could not load translations for ${language}`, error);
      }
    };
    fetchTranslations();
  }, [language]);

  const t = useCallback((key: string, options?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let result = translations;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        return key; // Return the key if translation is not found
      }
    }
    
    if (typeof result === 'string' && options) {
        return Object.entries(options).reduce((str, [key, value]) => {
            return str.replace(`{${key}}`, String(value));
        }, result);
    }

    return result || key;
  }, [translations]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
