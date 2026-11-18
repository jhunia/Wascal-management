/* ==========================================================================
   USER PREFERENCES: theme, language and notification choices.
   Saved in the browser (localStorage) for now; later saved per user on
   the server so they follow you between laptop and phone.
   ========================================================================== */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import i18n from '@/i18n';

export interface Prefs {
  theme: 'system' | 'light' | 'dark';
  language: 'en' | 'fr';
  channels: { inApp: boolean; email: boolean; push: boolean };
  /** days before a deadline to remind */
  leadTimes: number[];
  weeklyDigest: boolean;
  quietHours: boolean;
}

const DEFAULTS: Prefs = {
  theme: 'system',
  language: 'en',
  channels: { inApp: true, email: true, push: true },
  leadTimes: [30, 14, 7, 1],
  weeklyDigest: true,
  quietHours: true,
};

const KEY = 'wascal-tracker:prefs';

function load(): Prefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  const browserFr = typeof navigator !== 'undefined' && navigator.language?.startsWith('fr');
  return { ...DEFAULTS, language: browserFr ? 'fr' : 'en' };
}

const Ctx = createContext<{ prefs: Prefs; setPrefs: (patch: Partial<Prefs>) => void } | null>(null);

export function PrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, set] = useState<Prefs>(load);

  const setPrefs = (patch: Partial<Prefs>) =>
    set((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });

  // Apply language
  useEffect(() => {
    if (i18n.language !== prefs.language) i18n.changeLanguage(prefs.language);
    document.documentElement.lang = prefs.language;
  }, [prefs.language]);

  // Apply theme (sets <html data-theme="dark|light">; tokens.css reacts to it)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const dark = prefs.theme === 'dark' || (prefs.theme === 'system' && mq.matches);
      document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [prefs.theme]);

  return <Ctx.Provider value={{ prefs, setPrefs }}>{children}</Ctx.Provider>;
}

export function usePrefs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('usePrefs must be used inside <PrefsProvider>');
  return ctx;
}
