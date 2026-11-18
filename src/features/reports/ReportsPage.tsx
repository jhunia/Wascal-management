/* ==========================================================================
   REPORTS  (/reports?project=<id>)
   Two report types, previewed as a printable "paper" page:
     • Project status report: one project, ready for a funder or the Board
     • Portfolio summary: all projects, for management meetings
   "Print / Save as PDF" uses the browser's print dialog (print styles in
   global.css hide everything except the paper). "Download CSV" exports
   the portfolio table for Excel.
   Later: the backend will generate DOCX/PDF from funder templates.
   ========================================================================== */
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DownloadSimple, Printer } from '@phosphor-icons/react';
import type { Project } from '@/types/domain';
import { useLookup, useProjects, useUpdates } from '@/api/hooks';
import { useAuth } from '@/auth/AuthContext';
import {
  budgetSpentPct,
  deadlinesOf,
  dueWithin,
  isItemOpen,
  overdueCount,
  projectHealth,
  projectProgress,
  timeElapsedPct,
} from '@/lib/health';
import { daysUntil, formatDate, toISO, today } from '@/lib/dates';
import { money } from '@/lib/cx';
import { Button, FilterSelect, HealthBadge, PageHeader, Segmented, Skeleton, StatusPill } from '@/ui';
import l from '@/features/shared/layout.module.css';
import s from './ReportsPage.module.css';

type Kind = 'project' | 'portfolio';

export function ReportsPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const { data: projects, isLoading } = useProjects();
  const kind: Kind = params.get('kind') === 'portfolio' ? 'portfolio' : 'project';
  const projectId = params.get('project') ?? projects?.[0]?.id ?? '';
  const project = projects?.find((p) => p.id === projectId);

  const set = (patch: Record<string, string>) => setParams({ kind, project: projectId, ...patch }, { replace: true });

  return (
    <>
      <PageHeader
        eyebrow={t('nav.reports')}
        title={t('reports.title')}
        lede={t('reports.lede')}
        actions={
          <>
            {kind === 'portfolio' && projects && (
              <Button icon={<DownloadSimple size={18} />} onClick={() => downloadCsv(projects)}>
                {t('reports.csv')}
              </Button>
            )}
            <Button variant="accent" icon={<Printer size={18} />} onClick={() => window.print()}>
              {t('reports.print')}
            </Button>
          </>
        }
      />

      <div className={l.filters}>
        <Segmented<Kind>
          label={t('reports.type')}
          value={kind}
          onChange={(k) => set({ kind: k })}
          options={[
            { value: 'project', label: t('reports.projectStatus') },
            { value: 'portfolio', label: t('reports.portfolio') },
          ]}
        />
        {kind === 'project' && (
          <FilterSelect label={t('updates.project')} value={projectId} onChange={(v) => set({ project: v })}>
            {(projects ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
            ))}
          </FilterSelect>
        )}
      </div>

      <div className={s.desk}>
        {isLoading ? (
          <div className={s.paper}>
            <Skeleton h={500} />
          </div>
        ) : kind === 'project' && project ? (
          <ProjectReport p={project} />
        ) : (
          <PortfolioReport projects={projects ?? []} />
        )}
      </div>
    </>
  );
}

function Letterhead({ title, subtitle }: { title: string; subtitle: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <header className={s.letterhead}>
      <div className={s.lhBrand}>
        <img src="/wascal-logo.png" alt="WASCAL" width={420} height={255} />
      </div>
      <div className={s.lhMeta}>
        <span className="mono">{formatDate(toISO(today()))}</span>
        <span>{t('reports.preparedBy', { name: user?.name })}</span>
      </div>
      <h1 className={s.docTitle}>{title}</h1>
      <p className={s.docSub}>{subtitle}</p>
    </header>
  );
}

function ProjectReport({ p }: { p: Project }) {
  const { t } = useTranslation();
  const { person, funder, programme } = useLookup();
  const { data: updates } = useUpdates(p.id);
  const items = deadlinesOf(p);
  const done = items.filter((i) => !isItemOpen(i.status));
  const late = items.filter((i) => isItemOpen(i.status) && daysUntil(i.due) < 0);
  const upcoming = items.filter((i) => isItemOpen(i.status) && daysUntil(i.due) >= 0 && daysUntil(i.due) <= 60);
  const recent = (updates ?? []).slice(0, 4);
  const blockers = (updates ?? []).filter((u) => u.blockers).slice(0, 3);

  return (
    <article className={`${s.paper} print-area`}>
      <Letterhead title={`${p.code}: ${t('reports.projectStatus')}`} subtitle={p.title} />

      <table className={s.facts}>
        <tbody>
          <tr>
            <th>{t('project.lead')}</th><td>{person(p.leadId)?.name}</td>
            <th>{t('project.programme')}</th><td>{programme(p.programmeId)?.name}</td>
          </tr>
          <tr>
            <th>{t('project.funders')}</th><td>{p.funderIds.map((f) => funder(f)?.short).join(', ')}</td>
            <th>{t('project.dates')}</th><td className="mono">{formatDate(p.start)} → {formatDate(p.end)}</td>
          </tr>
          <tr>
            <th>{t('reports.health')}</th><td><HealthBadge health={projectHealth(p)} /></td>
            <th>{t('project.countries')}</th><td>{p.countries.join(', ')}</td>
          </tr>
        </tbody>
      </table>

      <div className={s.kpis}>
        <div><b>{projectProgress(p)}%</b><span>{t('project.progress')}</span></div>
        <div><b>{timeElapsedPct(p)}%</b><span>{t('project.timeElapsed')}</span></div>
        <div><b>{budgetSpentPct(p)}%</b><span>{t('project.budgetSpent')} ({money(p.spentEUR)} / {money(p.budgetEUR)})</span></div>
        <div><b>{done.length}/{items.length}</b><span>{t('reports.itemsDone')}</span></div>
      </div>

      <h2 className={s.h2}>1. {t('reports.s.progress')}</h2>
      {recent.length ? (
        <ul className={s.prose}>
          {recent.map((u) => (
            <li key={u.id}>
              <span className="mono">{formatDate(u.date)}</span>: {u.summary} <em>({person(u.authorId)?.name})</em>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.none}>{t('updates.none')}</p>
      )}

      <h2 className={s.h2}>2. {t('reports.s.overdue')}</h2>
      <ItemTable rows={late} empty={t('reports.noneOverdue')} />

      <h2 className={s.h2}>3. {t('reports.s.upcoming')}</h2>
      <ItemTable rows={upcoming} empty={t('reports.noneUpcoming')} />

      <h2 className={s.h2}>4. {t('reports.s.risks')}</h2>
      {blockers.length ? (
        <ul className={s.prose}>
          {blockers.map((u) => (
            <li key={u.id}>{u.blockers}</li>
          ))}
        </ul>
      ) : (
        <p className={s.none}>{t('reports.noBlockers')}</p>
      )}

      <footer className={s.paperFoot}>
        <span>{t('reports.generated')}</span>
        <span className="mono">{p.code} · {toISO(today())}</span>
      </footer>
    </article>
  );
}

function ItemTable({ rows, empty }: { rows: ReturnType<typeof deadlinesOf>; empty: string }) {
  const { t } = useTranslation();
  const { person } = useLookup();
  if (!rows.length) return <p className={s.none}>{empty}</p>;
  return (
    <table className={s.items}>
      <thead>
        <tr>
          <th>{t('reports.col.item')}</th>
          <th>{t('reports.col.due')}</th>
          <th>{t('reports.col.owner')}</th>
          <th>{t('reports.col.status')}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((i) => (
          <tr key={i.id}>
            <td><span className="mono">{i.code}</span> {i.title}</td>
            <td className="mono">{formatDate(i.due)}</td>
            <td>{person(i.ownerId)?.name}</td>
            <td><StatusPill status={i.status} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PortfolioReport({ projects }: { projects: Project[] }) {
  const { t } = useTranslation();
  const { person } = useLookup();
  const live = projects.filter((p) => p.status !== 'closed');
  const count = (h: string) => live.filter((p) => projectHealth(p) === h).length;
  const totalOverdue = live.reduce((a, p) => a + overdueCount(p), 0);

  return (
    <article className={`${s.paper} print-area`}>
      <Letterhead title={t('reports.portfolio')} subtitle={t('reports.portfolioSub', { n: live.length })} />

      <div className={s.kpis}>
        <div><b>{count('on_track')}</b><span>{t('health.on_track')}</span></div>
        <div><b>{count('at_risk')}</b><span>{t('health.at_risk')}</span></div>
        <div><b>{count('off_track')}</b><span>{t('health.off_track')}</span></div>
        <div><b>{totalOverdue}</b><span>{t('reports.overdueItems')}</span></div>
      </div>

      <table className={s.items}>
        <thead>
          <tr>
            <th>{t('portfolio.col.project')}</th>
            <th>{t('portfolio.col.health')}</th>
            <th>{t('project.progress')}</th>
            <th>{t('portfolio.col.overdue')}</th>
            <th>{t('reports.due30')}</th>
            <th>{t('portfolio.col.budget')}</th>
            <th>{t('portfolio.col.lead')}</th>
          </tr>
        </thead>
        <tbody>
          {live.map((p) => (
            <tr key={p.id}>
              <td><b className="mono">{p.code}</b><br /><small>{p.title}</small></td>
              <td><HealthBadge health={projectHealth(p)} /></td>
              <td className="mono">{projectProgress(p)}%</td>
              <td className="mono">{overdueCount(p)}</td>
              <td className="mono">{dueWithin(p, 30)}</td>
              <td className="mono">{budgetSpentPct(p)}% of {money(p.budgetEUR)}</td>
              <td>{person(p.leadId)?.name}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <footer className={s.paperFoot}>
        <span>{t('reports.generated')}</span>
        <span className="mono">PORTFOLIO · {toISO(today())}</span>
      </footer>
    </article>
  );
}

/** Builds a CSV of the portfolio and triggers a download (opens in Excel). */
function downloadCsv(projects: Project[]) {
  const head = ['Code', 'Title', 'Status', 'Health', 'Progress %', 'Time elapsed %', 'Budget EUR', 'Spent EUR', 'Overdue items', 'Due in 30 days', 'Start', 'End'];
  const rows = projects.map((p) => [
    p.code, p.title, p.status, projectHealth(p), projectProgress(p), timeElapsedPct(p),
    p.budgetEUR, p.spentEUR, overdueCount(p), dueWithin(p, 30), p.start, p.end,
  ]);
  const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `wascal-portfolio-${toISO(today())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
