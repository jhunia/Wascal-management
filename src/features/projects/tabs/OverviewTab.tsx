/* PROJECT → OVERVIEW: vital numbers, what's next, latest news, work packages. */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Project } from '@/types/domain';
import { budgetSpentPct, deadlinesOf, isItemOpen, overdueCount, projectProgress, timeElapsedPct } from '@/lib/health';
import { money } from '@/lib/cx';
import { formatShort } from '@/lib/dates';
import { useLookup, useUpdates } from '@/api/hooks';
import { Avatar, Card, ProgressBar, Stat } from '@/ui';
import { DeadlineLedger } from '@/features/shared/DeadlineLedger';
import l from '@/features/shared/layout.module.css';
import s from './tabs.module.css';

export function OverviewTab({ project: p }: { project: Project }) {
  const { t } = useTranslation();
  const { person } = useLookup();
  const { data: updates } = useUpdates(p.id);
  const progress = projectProgress(p);
  const elapsed = timeElapsedPct(p);
  const spent = budgetSpentPct(p);
  const late = overdueCount(p);
  const open = deadlinesOf(p).filter((i) => isItemOpen(i.status));

  return (
    <>
      <div className={l.stats}>
        <Stat label={t('project.progress')} value={`${progress}%`} tone="neutral" hint={t('project.avgDeliverables')} />
        <Stat label={t('project.timeElapsed')} value={`${elapsed}%`} tone="ochre" hint={t('project.ofDuration')} />
        <Stat
          label={t('project.budgetSpent')}
          value={`${spent}%`}
          tone={spent - elapsed > 15 ? 'warn' : 'ok'}
          hint={`${money(p.spentEUR)} / ${money(p.budgetEUR)}`}
        />
        <Stat label={t('bucket.overdue')} value={late} tone={late ? 'risk' : 'ok'} hint={t('project.openItems', { count: open.length })} />
      </div>

      <div className={l.split}>
        <div className={l.stack}>
          <Card
            title={t('project.whatsNext')}
            actions={<Link to={`/projects/${p.id}/deliverables`} className={s.link}>{t('common.seeAll')}</Link>}
            flush
          >
            <DeadlineLedger items={open} showProject={false} groups={['overdue', 'week', 'month']} emptyText={t('project.nothingSoon')} />
          </Card>

          <Card title={t('project.workPackages')} flush>
            <ul className={s.wps}>
              {p.workPackages.map((wp) => {
                const ds = p.deliverables.filter((d) => d.workPackageId === wp.id);
                const pr = ds.length ? Math.round(ds.reduce((a, d) => a + d.progress, 0) / ds.length) : 0;
                return (
                  <li key={wp.id}>
                    <span className={`mono ${s.wpCode}`}>{wp.code}</span>
                    <div className={s.wpMain}>
                      <b>{wp.title}</b>
                      <small className="mono">
                        {formatShort(wp.start)} → {formatShort(wp.end)} · {t('project.nDeliverables', { count: ds.length })}
                      </small>
                    </div>
                    <div className={s.wpBar}>
                      <ProgressBar value={pr} />
                    </div>
                    <Avatar person={person(wp.leadId)} size={26} />
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <Card
          title={t('project.latest')}
          actions={<Link to={`/projects/${p.id}/updates`} className={s.link}>{t('common.seeAll')}</Link>}
        >
          <ol className={s.feed}>
            {(updates ?? []).slice(0, 3).map((u) => (
              <li key={u.id}>
                <div className={s.feedHead}>
                  <Avatar person={person(u.authorId)} size={24} />
                  <b>{person(u.authorId)?.name}</b>
                  <span className="mono muted">{formatShort(u.date)}</span>
                </div>
                <p>{u.summary}</p>
                {u.blockers && <p className={s.blocker}>⚠ {u.blockers}</p>}
              </li>
            ))}
            {!updates?.length && <p className="muted">{t('updates.none')}</p>}
          </ol>
        </Card>
      </div>
    </>
  );
}
