/* ==========================================================================
   TRANSLATIONS (English / French)
   Every piece of interface text has a key, e.g. t('nav.myWork').
   The words live in en.json and fr.json. Add the key to BOTH files.
   Docs: https://react.i18next.com
   ========================================================================== */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import fr from './fr.json';

/** Language saved in Settings (or the browser's language) so the first paint is already correct. */
function initialLanguage(): 'en' | 'fr' {
  try {
    const saved = JSON.parse(localStorage.getItem('wascal-tracker:prefs') ?? '{}').language;
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    /* ignore */
  }
  return navigator.language?.startsWith('fr') ? 'fr' : 'en';
}

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, fr: { translation: fr } },
  lng: initialLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export default i18n;
