import { useContext } from 'react';
import { EasyLanguageContext, EasyLanguageContextType } from './EasyLanguageProvider';

export function useEasyLanguage(): EasyLanguageContextType {
  const context = useContext(EasyLanguageContext);
  if (context === undefined) {
    throw new Error('useEasyLanguage must be used within an EasyLanguageProvider');
  }
  return context;
}
