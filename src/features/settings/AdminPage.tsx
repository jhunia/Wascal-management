/* ==========================================================================
   ADMIN  (/admin): users & roles, and the alert rules in force.
   Visible to the admin and executive roles (see src/layout/nav.ts).
   Prototype: read-only. Later: edit roles, funders, programmes, templates.
   ========================================================================== */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass } from '@phosphor-icons/react';
import type { Role } from '@/types/domain';
import { usePeople } from '@/api/hooks';
import { Avatar, Card, PageHeader, SkeletonRows, Tag, TextInput } from '@/ui';
import l from '@/features/shared/layout.module.css';
import s from './AdminPage.module.css';

const RULES = [
  { when: 'D-30 · D-14 · D-7', what: 'report_due' },
  { when: 'D-7 · D-1', what: 'due_soon' },
  { when: '+0d', what: 'overdue' },
  { when: '+3d', what: 'escalate_head' },
  { when: '+7d', what: 'escalate_exec' },
  { when: '30d', what: 'stale' },
  { when: 'Mon 08:00', what: 'digest' },
];

export function AdminPage() {
  const { t } = useTranslation();
  const { data: people, isLoading } = usePeople();
  const [q, setQ] = useState('');
  const list = (people ?? []).filter((p) => !q || `${p.name} ${p.email} ${p.unit}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader eyebrow={t('nav.admin')} title={t('admin.title')} lede={t('admin.lede')} />
      <div className={l.split}>
        <Card title={t('admin.users')} meta={String(list.length)} flush>
          <div className={s.search}>
            <label className={l.search}>
              <MagnifyingGlass size={16} />
              <span className="visually-hidden">{t('common.search')}</span>
              <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('admin.searchPh')} type="search" />
            </label>
          </div>
          {isLoading ? (
            <SkeletonRows rows={6} />
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>{t('admin.col.person')}</th>
                    <th>{t('admin.col.unit')}</th>
                    <th>{t('admin.col.country')}</th>
                    <th>{t('admin.col.role')}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className={s.person}>
                          <Avatar person={p} size={30} />
                          <span>
                            <b>{p.name}</b>
                            <small className="mono">{p.email}</small>
                          </span>
                        </div>
                      </td>
                      <td>{p.unit}</td>
                      <td><Tag>{p.country}</Tag></td>
                      <td><span className={s[`role_${p.role as Role}`]}>{t(`roles.${p.role}`)}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className={l.stack}>
          <Card title={t('admin.rules')}>
            <ul className={s.rules}>
              {RULES.map((r) => (
                <li key={r.what}>
                  <span className="mono">{r.when}</span>
                  <span>{t(`admin.rule.${r.what}`)}</span>
                </li>
              ))}
            </ul>
          </Card>
          <Card title={t('admin.sso')}>
            <p className={s.sso}>{t('admin.ssoText')}</p>
          </Card>
        </div>
      </div>
    </>
  );
}
