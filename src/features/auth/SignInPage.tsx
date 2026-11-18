/* ==========================================================================
   SIGN-IN SCREEN  (/sign-in)
   Mock: type any @wascal.org address. The "Demo personas" list lets you
   try the app as different roles. Remove that block when real Microsoft
   sign-in is wired up (see src/auth/AuthContext.tsx).
   ========================================================================== */
import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, MicrosoftOutlookLogo } from '@phosphor-icons/react';
import { useAuth, ALLOWED_DOMAIN } from '@/auth/AuthContext';
import { people } from '@/mocks/people';
import { Avatar, Button, Field, TextInput } from '@/ui';
import { usePrefs } from '@/settings/PrefsContext';
import s from './SignInPage.module.css';

const DEMO = ['u-ama', 'u-ibrahim', 'u-fatou', 'u-kwame', 'u-kossi'];

export function SignInPage() {
  const { t } = useTranslation();
  const { user, signIn, switchTo } = useAuth();
  const { prefs, setPrefs } = usePrefs();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: string } | null)?.from ?? '/my-work';

  if (user) return <Navigate to={from} replace />;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const res = signIn(email);
    if (!res.ok) setError(t(res.reason === 'domain' ? 'auth.errDomain' : 'auth.errFormat'));
    else navigate(from, { replace: true });
  };

  return (
    <div className={s.page}>
      <section className={s.story}>
        {/* WASCAL observation station in the field (same photo as the website) */}
        <img className={s.photo} src="/images/station.jpg" alt="" />
        <div className={s.shade} />
        <div className={s.storyInner}>
          <div className={s.eyebrow}>WASCAL · Project Tracker</div>
          <h1 className={s.headline}>{t('auth.headline')}</h1>
          <p className={s.sub}>{t('auth.sub')}</p>

          {/* What the app does, at a glance */}
          <ol className={s.ticker} aria-hidden>
            <li><b className={s.tLate}>{t('due.lateShort', { count: 9 })}</b><span>NIGERIA4H2 · {t('auth.tick3')}</span></li>
            <li><b>{t('due.tomorrowShort')}</b><span>WISE-2026 · {t('auth.tick1')}</span></li>
            <li><b>{t('due.inShort', { count: 7 })}</b><span>iGST-WA · {t('auth.tick2')}</span></li>
          </ol>
          <p className={s.countries}>Bénin · Burkina Faso · Cabo Verde · Côte d’Ivoire · The Gambia · Ghana · Guinea · Mali · Niger · Nigeria · Senegal · Sierra Leone · Togo</p>
        </div>
      </section>

      <section className={s.formSide}>
        <div className={s.langs}>
          {(['en', 'fr'] as const).map((l) => (
            <button key={l} className={prefs.language === l ? s.langOn : undefined} onClick={() => setPrefs({ language: l })}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>

        <form className={s.form} onSubmit={submit} noValidate>
          <img className={s.logo} src="/wascal-logo.png" alt="WASCAL: West African Science Service Centre on Climate Change and Adapted Land Use" width={420} height={255} />
          <h2 className={s.formTitle}>{t('auth.title')}</h2>
          <p className="muted">{t('auth.hint', { domain: ALLOWED_DOMAIN })}</p>

          <Field label={t('auth.email')} error={error}>
            <TextInput
              type="email"
              autoComplete="email"
              placeholder={`firstname.lastname${ALLOWED_DOMAIN}`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError(null);
              }}
              autoFocus
            />
          </Field>

          <Button type="submit" variant="primary" block icon={<MicrosoftOutlookLogo size={18} weight="fill" />}>
            {t('auth.continue')}
          </Button>
          <p className={s.fine}>{t('auth.fine')}</p>
        </form>

        <div className={s.demo}>
          <div className="eyebrow">{t('auth.demo')}</div>
          <ul>
            {DEMO.map((id) => {
              const p = people.find((x) => x.id === id)!;
              return (
                <li key={id}>
                  <button onClick={() => { switchTo(id); navigate(from, { replace: true }); }}>
                    <Avatar person={p} size={30} />
                    <span className={s.who}>
                      <b>{p.name}</b>
                      <small>{t(`roles.${p.role}`)} · {p.unit}</small>
                    </span>
                    <ArrowRight size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
}
