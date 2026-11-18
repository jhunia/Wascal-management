/* ==========================================================================
   PROJECT DETAIL  (/projects/:projectId/:tab?)
   Header with the project's vital signs, then tabs:
     overview · timeline · deliverables · updates · reports · team
   Each tab's content is in ./tabs/. The tab is part of the URL so it can
   be linked/bookmarked (e.g. /projects/p-pv2h/timeline).
   ========================================================================== */
import { Link, NavLink, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, NotePencil, FilePdf } from '@phosphor-icons/react';
import { useLookup, useProject } from '@/api/hooks';
import { formatDate } from '@/lib/dates';
import { projectHealth } from '@/lib/health';
import { useComposer } from '@/layout/Composer';
import { Avatar, Button, ButtonLink, EmptyState, HealthBadge, PageHeader, Skeleton, Tag } from '@/ui';
import { OverviewTab } from './tabs/OverviewTab';
import { TimelineTab } from './tabs/TimelineTab';
import { DeliverablesTab } from './tabs/DeliverablesTab';
import { UpdatesTab } from './tabs/UpdatesTab';
import { ReportsTab } from './tabs/ReportsTab';
import { TeamTab } from './tabs/TeamTab';
import { cx } from '@/lib/cx';
import s from './ProjectDetailPage.module.css';

const TABS = ['overview', 'timeline', 'deliverables', 'updates', 'reports', 'team'] as const;
type TabKey = (typeof TABS)[number];

export function ProjectDetailPage() {
  const { t } = useTranslation();
  const { projectId = '', tab = 'overview' } = useParams();
  const { data: p, isLoading } = useProject(projectId);
  const { person, funder, programme } = useLookup();
  const { openComposer } = useComposer();

  if (isLoading) {
    return (
      <div className={s.loading}>
        <Skeleton h={14} w={120} />
        <Skeleton h={36} w="60%" />
        <Skeleton h={200} r={10} />
      </div>
    );
  }
  if (!p) {
    return (
      <EmptyState title={t('project.notFound')}>
        <Link to="/projects">{t('project.back')}</Link>
      </EmptyState>
    );
  }

  const active: TabKey = (TABS as readonly string[]).includes(tab) ? (tab as TabKey) : 'overview';
  const lead = person(p.leadId);

  return (
    <>
      <PageHeader
        above={
          <>
            <Link to="/projects" className={s.back}>
              <ArrowLeft size={14} /> {t('nav.projects')}
            </Link>
            <div className={s.headTop}>
              <span className={s.code}>{p.code}</span>
              <HealthBadge health={projectHealth(p)} />
              <span className={cx(s.status, s[p.status])}>{t(`projectStatus.${p.status}`)}</span>
            </div>
          </>
        }
        title={p.title}
        lede={p.summary}
        actions={
          <>
            <ButtonLink to={`/reports?project=${p.id}`} icon={<FilePdf size={18} />}>
              {t('project.statusReport')}
            </ButtonLink>
            <Button variant="accent" icon={<NotePencil size={18} weight="bold" />} onClick={() => openComposer({ projectId: p.id })}>
              {t('updates.post')}
            </Button>
          </>
        }
      >
        <dl className={s.facts}>
          <div>
            <dt>{t('project.lead')}</dt>
            <dd className={s.lead}>
              <Avatar person={lead} size={22} /> {lead?.name}
            </dd>
          </div>
          <div>
            <dt>{t('project.programme')}</dt>
            <dd>{programme(p.programmeId)?.short}</dd>
          </div>
          <div>
            <dt>{t('project.funders')}</dt>
            <dd className={s.tags}>
              {p.funderIds.map((f) => (
                <Tag key={f} title={funder(f)?.name}>{funder(f)?.short}</Tag>
              ))}
            </dd>
          </div>
          <div>
            <dt>{t('project.dates')}</dt>
            <dd className="mono">
              {formatDate(p.start)} → {formatDate(p.end)}
            </dd>
          </div>
          <div>
            <dt>{t('project.countries')}</dt>
            <dd className={s.tags}>
              {p.countries.map((c) => (
                <Tag key={c}>{c}</Tag>
              ))}
            </dd>
          </div>
        </dl>
      </PageHeader>

      <nav className={s.tabs} aria-label={t('project.sections')}>
        {TABS.map((k) => (
          <NavLink key={k} to={`/projects/${p.id}/${k}`} className={cx(s.tab, active === k && s.tabOn)} replace>
            {t(`project.tab.${k}`)}
            {k === 'deliverables' && <span className="mono">{p.deliverables.length}</span>}
            {k === 'reports' && p.reports.length > 0 && <span className="mono">{p.reports.length}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={s.body}>
        {active === 'overview' && <OverviewTab project={p} />}
        {active === 'timeline' && <TimelineTab project={p} />}
        {active === 'deliverables' && <DeliverablesTab project={p} />}
        {active === 'updates' && <UpdatesTab project={p} />}
        {active === 'reports' && <ReportsTab project={p} />}
        {active === 'team' && <TeamTab project={p} />}
      </div>
    </>
  );
}
