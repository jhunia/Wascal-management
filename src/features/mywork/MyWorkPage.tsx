/* ==========================================================================
   MY WORK  (/my-work): each person's home screen.
   Leads with action, not numbers:
     Banner : greeting + "N things need you this week" + a small summary row
     Left   : 1. Needs your attention (overdue + due this week)
              2. Coming up (next 30 days + later)
     Right  : my projects + latest updates on them
   "Mine" = items I own; "My projects" = everything in projects I'm on.
   ========================================================================== */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from '@phosphor-icons/react';
import { useAuth } from '@/auth/AuthContext';
import { useDeadlines, useLookup, useProjects, useUpdates } from '@/api/hooks';
import { daysUntil, formatShort } from '@/lib/dates';
import { isItemOpen } from '@/lib/health';
import { Avatar, Card, EmptyState, PageHeader, Segmented, SkeletonRows } from '@/ui';
import { DeadlineLedger, bucketOf, type Bucket } from '@/features/shared/DeadlineLedger';
import { ProjectCard } from '@/features/shared/ProjectCard';
import { cx } from '@/lib/cx';
import l from '@/features/shared/layout.module.css';
import s from './MyWorkPage.module.css';

type Scope = 'mine' | 'projects';

function greeting(t: (k: string) => string) {
  const h = new Date().getHours();
  return t(h < 12 ? 'mywork.morning' : h < 17 ? 'mywork.afternoon' : 'mywork.evening');
}

export function MyWorkPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { person } = useLookup();
  const { data: deadlines, isLoading } = useDeadlines();
  const { data: projects } = useProjects();
  const { data: updates } = useUpdates();
  const [scope, setScope] = useState<Scope>('mine');

  const myProjects = useMemo(
    () => (projects ?? []).filter((p) => p.leadId === user!.id || p.teamIds.includes(user!.id)),
    [projects, user],
  );
  const myProjectIds = new Set(myProjects.map((p) => p.id));

  const items = useMemo(() => {
    const all = deadlines ?? [];
    const ids = new Set(myProjects.map((p) => p.id));
    return scope === 'mine' ? all.filter((i) => i.ownerId === user!.id) : all.filter((i) => ids.has(i.projectId));
  }, [deadlines, scope, user, myProjects]);

  const open = items.filter((i) => isItemOpen(i.status));
  const count = (b: Bucket) => open.filter((i) => bucketOf(i) === b).length;
  const urgent = count('overdue') + count('week');
  const reportsDue = open.filter((i) => i.kind === 'report' && daysUntil(i.due) <= 30).length;
  const firstName = user!.name.replace(/^(Dr\.?|Prof\.?)\s+/i, '').split(' ')[0];

  const summary = [
    { key: 'overdue', label: t('bucket.overdue'), n: count('overdue'), tone: 'risk' },
    { key: 'week', label: t('bucket.week'), n: count('week'), tone: 'ochre' },
    { key: 'month', label: t('bucket.month'), n: count('month'), tone: 'plain' },
    { key: 'reports', label: t('mywork.reportsDue30'), n: reportsDue, tone: 'plain' },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t('nav.myWork')}
        title={`${greeting(t)}, ${firstName}`}
        lede={urgent ? t('mywork.ledeUrgent', { count: urgent }) : t('mywork.ledeClear')}
        actions={
          <Segmented<Scope>
            label={t('mywork.scope')}
            value={scope}
            onChange={setScope}
            options={[
              { value: 'mine', label: t('mywork.mine') },
              { value: 'projects', label: t('mywork.myProjects') },
            ]}
          />
        }
      >
        <ul className={s.summary}>
          {summary.map((x) => (
            <li key={x.key} className={cx(s.sum, x.n > 0 && s[`sum_${x.tone}`])}>
              <b>{x.n}</b>
              <span>{x.label}</span>
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className={l.split}>
        <div className={l.stack}>
          <Card title={t('mywork.attention')} meta={urgent ? String(urgent) : undefined} flush>
            {isLoading ? (
              <SkeletonRows rows={4} />
            ) : urgent ? (
              <DeadlineLedger items={open} groups={['overdue', 'week']} />
            ) : (
              <EmptyState icon={<CheckCircle size={40} weight="duotone" />} title={t('mywork.nothingUrgent')}>
                {t('mywork.nothingUrgentHint')}
              </EmptyState>
            )}
          </Card>

          <Card title={t('mywork.comingUp')} meta={String(count('month') + count('later'))} flush>
            {isLoading ? (
              <SkeletonRows rows={5} />
            ) : (
              <DeadlineLedger items={open} groups={['month', 'later']} emptyText={t('mywork.allClear')} />
            )}
          </Card>
        </div>

        <div className={l.stack}>
          <Card title={t('mywork.myProjects')} meta={String(myProjects.length)}>
            <div className={s.projects}>
              {myProjects.slice(0, 4).map((p) => (
                <ProjectCard key={p.id} project={p} compact />
              ))}
              {myProjects.length > 4 && (
                <Link to="/projects" className={s.more}>
                  {t('mywork.seeAll', { count: myProjects.length })}
                </Link>
              )}
            </div>
          </Card>

          <Card title={t('mywork.recent')}>
            <ol className={s.feed}>
              {(updates ?? [])
                .filter((u) => myProjectIds.has(u.projectId))
                .slice(0, 5)
                .map((u) => {
                  const p = myProjects.find((x) => x.id === u.projectId);
                  return (
                    <li key={u.id}>
                      <Avatar person={person(u.authorId)} size={30} />
                      <div>
                        <div className={s.feedHead}>
                          <b>{person(u.authorId)?.name}</b>
                          <Link to={`/projects/${u.projectId}/updates`}>{p?.code}</Link>
                          <span className="muted">{formatShort(u.date)}</span>
                        </div>
                        <p>{u.summary}</p>
                      </div>
                    </li>
                  );
                })}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
