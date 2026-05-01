import { createContext, useContext, useState, useEffect } from 'react';
import { translate } from '../services/i18n';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    // Default to English. User must explicitly choose Arabic via Settings.
    const saved = localStorage.getItem('gza_lang');
    // Only respect saved value if it's a valid choice
    return (saved === 'ar' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    // Update direction and class for RTL support
    if (language === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
      document.body.classList.add('rtl-mode');
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = 'en';
      document.body.classList.remove('rtl-mode');
    }
    
    localStorage.setItem('gza_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  const t = (key, params) => translate(key, language, params);

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
