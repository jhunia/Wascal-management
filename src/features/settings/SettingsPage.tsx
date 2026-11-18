/* ==========================================================================
   SETTINGS  (/settings): language, appearance, notification preferences.
   Plus a "Prototype tools" box (switch persona, reset demo data) that
   should be removed once the real backend + sign-in are live.
   ========================================================================== */
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/auth/AuthContext';
import { usePrefs, type Prefs } from '@/settings/PrefsContext';
import { resetDemo } from '@/api/db';
import { people } from '@/mocks/people';
import { Avatar, Button, Card, PageHeader, Segmented, Select } from '@/ui';
import l from '@/features/shared/layout.module.css';
import s from './SettingsPage.module.css';

const LEAD_OPTIONS = [60, 30, 14, 7, 3, 1];

export function SettingsPage() {
  const { t } = useTranslation();
  const { prefs, setPrefs } = usePrefs();
  const { user, switchTo } = useAuth();
  const qc = useQueryClient();

  const toggleChannel = (k: keyof Prefs['channels']) => setPrefs({ channels: { ...prefs.channels, [k]: !prefs.channels[k] } });
  const toggleLead = (d: number) =>
    setPrefs({
      leadTimes: prefs.leadTimes.includes(d) ? prefs.leadTimes.filter((x) => x !== d) : [...prefs.leadTimes, d].sort((a, b) => b - a),
    });

  return (
    <>
      <PageHeader eyebrow={t('nav.settings')} title={t('settings.title')} />

      <div className={l.split}>
        <div className={l.stack}>
          <Card title={t('settings.profile')}>
            <div className={s.profile}>
              <Avatar person={user!} size={52} />
              <div>
                <b>{user!.name}</b>
                <p className="muted">{user!.title}</p>
                <p className="mono muted">{user!.email}</p>
              </div>
            </div>
            <p className={s.note}>{t('settings.profileNote')}</p>
          </Card>

          <Card title={t('settings.notifications')}>
            <h3 className={s.h3}>{t('settings.channels')}</h3>
            <div className={s.toggles}>
              {(['inApp', 'email', 'push'] as const).map((k) => (
                <Toggle key={k} label={t(`settings.ch.${k}`)} hint={t(`settings.chHint.${k}`)} on={prefs.channels[k]} onChange={() => toggleChannel(k)} />
              ))}
            </div>

            <h3 className={s.h3}>{t('settings.leadTimes')}</h3>
            <p className={s.hint}>{t('settings.leadHint')}</p>
            <div className={s.chips}>
              {LEAD_OPTIONS.map((d) => (
                <button key={d} className={prefs.leadTimes.includes(d) ? s.chipOn : s.chip} onClick={() => toggleLead(d)} aria-pressed={prefs.leadTimes.includes(d)}>
                  <span className="mono">D-{d}</span>
                </button>
              ))}
            </div>

            <h3 className={s.h3}>{t('settings.other')}</h3>
            <div className={s.toggles}>
              <Toggle label={t('settings.digest')} hint={t('settings.digestHint')} on={prefs.weeklyDigest} onChange={() => setPrefs({ weeklyDigest: !prefs.weeklyDigest })} />
              <Toggle label={t('settings.quiet')} hint={t('settings.quietHint')} on={prefs.quietHours} onChange={() => setPrefs({ quietHours: !prefs.quietHours })} />
            </div>
          </Card>
        </div>

        <div className={l.stack}>
          <Card title={t('settings.language')}>
            <Segmented
              label={t('settings.language')}
              value={prefs.language}
              onChange={(v) => setPrefs({ language: v })}
              options={[
                { value: 'en', label: 'English' },
                { value: 'fr', label: 'Français' },
              ]}
            />
          </Card>
          <Card title={t('settings.appearance')}>
            <Segmented
              label={t('settings.appearance')}
              value={prefs.theme}
              onChange={(v) => setPrefs({ theme: v })}
              options={[
                { value: 'system', label: t('settings.system') },
                { value: 'light', label: t('settings.light') },
                { value: 'dark', label: t('settings.dark') },
              ]}
            />
          </Card>

          <Card title={t('settings.proto')} className={s.proto}>
            <p className={s.hint}>{t('settings.protoHint')}</p>
            <label className={s.h3} htmlFor="persona">{t('settings.persona')}</label>
            <Select id="persona" value={user!.id} onChange={(e) => switchTo(e.target.value)}>
              {people.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {t(`roles.${p.role}`)}</option>
              ))}
            </Select>
            <div className={s.reset}>
              <Button
                variant="secondary"
                onClick={() => {
                  if (confirm(t('settings.resetConfirm'))) {
                    resetDemo();
                    qc.clear();
                    location.reload();
                  }
                }}
              >
                {t('settings.reset')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function Toggle({ label, hint, on, onChange }: { label: string; hint?: string; on: boolean; onChange: () => void }) {
  return (
    <label className={s.toggle}>
      <span>
        <b>{label}</b>
        {hint && <small>{hint}</small>}
      </span>
      <input type="checkbox" role="switch" checked={on} onChange={onChange} />
      <i aria-hidden />
    </label>
  );
}
