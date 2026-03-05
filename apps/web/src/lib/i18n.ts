import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "../locales/en.json";
import ru from "../locales/ru.json";
import uz from "../locales/uz.json";

// the translations
const resources = {
  en: { ...en },
  ru: { ...ru },
  uz: { ...uz },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    supportedLngs: ["en", "ru", "uz"],
    
    // We only want localStorage and cookie, not path/htmlTag so we don't mess up URLs
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      caches: ['localStorage', 'cookie'],
      lookupCookie: 'i18next',
      lookupLocalStorage: 'i18nextLng',
    },

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;
