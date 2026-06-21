import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { type Language, type TranslationKey, t as translate } from './i18n';

type LanguageContextType = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'sv',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('sv');

  useEffect(() => {
    AsyncStorage.getItem('language').then((stored) => {
      if (stored === 'sv' || stored === 'en') setLangState(stored);
    });
  }, []);

  function setLang(l: Language) {
    setLangState(l);
    AsyncStorage.setItem('language', l);
  }

  function t(key: TranslationKey, vars?: Record<string, string>) {
    return translate(lang, key, vars);
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
