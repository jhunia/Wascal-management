/* PROJECT → TEAM: WASCAL staff on the project, partner institutions, countries. */
import { useTranslation } from 'react-i18next';
import type { Project } from '@/types/domain';
import { useLookup } from '@/api/hooks';
import { countries } from '@/mocks/reference';
import { usePrefs } from '@/settings/PrefsContext';
import { Avatar, Card, Tag } from '@/ui';
import l from '@/features/shared/layout.module.css';
import s from './tabs.module.css';

export function TeamTab({ project: p }: { project: Project }) {
  const { t } = useTranslation();
  const { person } = useLookup();
  const { prefs } = usePrefs();

  return (
    <div className={l.split}>
      <Card title={t('project.team')} meta={String(p.teamIds.length)} flush>
        <ul className={s.team}>
          {p.teamIds.map((id) => {
            const m = person(id);
            if (!m) return null;
            const owned = p.deliverables.filter((d) => d.ownerId === id).length;
            return (
              <li key={id}>
                <Avatar person={m} size={36} />
                <div className={s.rMain}>
                  <b>
                    {m.name} {id === p.leadId && <span className={s.leadTag}>{t('project.lead')}</span>}
                  </b>
                  <small>{m.title}</small>
                </div>
                <span className="mono muted">{t('project.owns', { count: owned })}</span>
                <a href={`mailto:${m.email}`} className={s.mail}>
                  {m.email}
                </a>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className={l.stack}>
        <Card title={t('project.partners')}>
          {p.partners.length ? (
            <ul className={s.partners}>
              {p.partners.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          ) : (
            <p className="muted">—</p>
          )}
        </Card>
        <Card title={t('project.countries')}>
          <div className={s.countryList}>
            {p.countries.map((c) => (
              <span key={c}>
                <Tag>{c}</Tag> {countries[c][prefs.language]}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
