/* ==========================================================================
   SIGN-IN (MOCK).
   Today: you type an email; only @wascal.org is accepted. If it matches a
   mock person you become them; otherwise you get a demo profile.

   Later: replace signIn() with Microsoft sign-in via MSAL
   (@azure/msal-react). The rest of the app only uses `useAuth()`, so
   nothing else has to change.
   ========================================================================== */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Person } from '@/types/domain';
import { people } from '@/mocks/people';

export const ALLOWED_DOMAIN = '@wascal.org';
const KEY = 'wascal-tracker:session';

interface AuthState {
  user: Person | null;
  signIn: (email: string) => { ok: true } | { ok: false; reason: 'domain' | 'format' };
  signOut: () => void;
  /** Demo only: switch persona to see the app as another role. */
  switchTo: (personId: string) => void;
}

const AuthCtx = createContext<AuthState | null>(null);

function personFor(email: string): Person {
  const match = people.find((p) => p.email.toLowerCase() === email.toLowerCase());
  if (match) return match;
  // Unknown @wascal.org address → borrow the default persona's work so the demo has data.
  const base = people[0];
  const local = email.split('@')[0];
  const name = local
    .split(/[._-]/)
    .filter(Boolean)
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
  return { ...base, name: name || base.name, email };
}

function restore(): Person | null {
  try {
    const email = localStorage.getItem(KEY);
    return email ? personFor(email) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Person | null>(restore);

  const signIn: AuthState['signIn'] = (raw) => {
    const email = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, reason: 'format' };
    if (!email.endsWith(ALLOWED_DOMAIN)) return { ok: false, reason: 'domain' };
    try {
      localStorage.setItem(KEY, email);
    } catch {
      /* ignore */
    }
    setUser(personFor(email));
    return { ok: true };
  };

  const signOut = () => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  };

  const switchTo = (personId: string) => {
    const p = people.find((x) => x.id === personId);
    if (p) signIn(p.email);
  };

  return <AuthCtx.Provider value={{ user, signIn, signOut, switchTo }}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
