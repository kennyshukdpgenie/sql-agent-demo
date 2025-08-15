import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import language files
import en from './locales/en.json';
import zh from './locales/zh.json';

// Initialize i18next
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      zh: {
        translation: zh,
      },
    },
    lng: localStorage.getItem('language') || 'zh', // default language set to Chinese
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n; 