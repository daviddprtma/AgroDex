import React, { createContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { dictionary, EasyLanguageKey, EasyMode, EasyLanguage } from './dictionary';

export interface EasyLanguageContextType {
  mode: EasyMode;
  easyMode: boolean;
  language: EasyLanguage;
  toggleEasyMode: () => void;
  toggle: () => void;
  setLanguage: (lang: EasyLanguage) => void;
  translate: (key: EasyLanguageKey) => string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const EasyLanguageContext = createContext<EasyLanguageContextType | undefined>(undefined);

export const EasyLanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useTranslation();

  // Load from localStorage, default mode to normal
  const [mode, setMode] = useState<EasyMode>(() => {
    const saved = localStorage.getItem('agrodex_easy_language');
    return saved === 'true' ? 'easy' : 'normal';
  });

  // Load from localStorage or i18n language
  const [language, setLanguageState] = useState<EasyLanguage>(() => {
    const saved = localStorage.getItem('agrodex_language');
    if (saved === 'id') return 'indonesian';
    if (saved === 'en') return 'english';
    return i18n.language?.startsWith('id') ? 'indonesian' : 'english';
  });

  // Sync with localStorage when mode changes
  useEffect(() => {
    localStorage.setItem('agrodex_easy_language', String(mode === 'easy'));
  }, [mode]);

  // Sync with localStorage when language changes
  useEffect(() => {
    localStorage.setItem('agrodex_language', language === 'indonesian' ? 'id' : 'en');
  }, [language]);

  // Synchronize language state if i18n.language changes
  useEffect(() => {
    const currentI18n = i18n.language;
    if (currentI18n) {
      const isIndonesian = currentI18n.startsWith('id');
      setLanguageState(isIndonesian ? 'indonesian' : 'english');
    }
  }, [i18n.language]);

  const toggleEasyMode = useCallback(() => {
    setMode((prev) => (prev === 'easy' ? 'normal' : 'easy'));
  }, []);

  const setLanguage = useCallback((lang: EasyLanguage) => {
    setLanguageState(lang);
    const code = lang === 'indonesian' ? 'id' : 'en';
    if (i18n.language !== code) {
      i18n.changeLanguage(code);
    }
  }, [i18n]);

  const translate = useCallback((key: EasyLanguageKey): string => {
    const langDict = dictionary[language];
    const modeDict = langDict[mode];
    if (key in modeDict) {
      return modeDict[key];
    }
    if (key in langDict.normal) {
      return langDict.normal[key];
    }
    if (key in dictionary.english.normal) {
      return dictionary.english.normal[key];
    }
    return key;
  }, [language, mode]);

  const contextValue = useMemo(
    () => ({
      mode,
      easyMode: mode === 'easy',
      language,
      toggleEasyMode,
      toggle: toggleEasyMode,
      setLanguage,
      translate,
    }),
    [mode, language, toggleEasyMode, setLanguage, translate]
  );

  return (
    <EasyLanguageContext.Provider value={contextValue}>
      {children}
    </EasyLanguageContext.Provider>
  );
};

