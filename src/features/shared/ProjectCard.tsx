/* ==========================================================================
   PROJECT CARD: compact summary of one project (Projects grid, My Work).
   Shows health, code, title, programme, progress vs. time elapsed, next deadline.
   ========================================================================== */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Project } from '@/types/domain';
import { deadlinesOf, isItemOpen, overdueCount, projectHealth, projectProgress, timeElapsedPct } from '@/lib/health';
import { daysUntil } from '@/lib/dates';
import { useLookup } from '@/api/hooks';
import { AvatarStack, DueChip, HealthBadge, ProgressBar, Tag } from '@/ui';
import s from './ProjectCard.module.css';

export function nextDeadline(p: Project) {
  return deadlinesOf(p)
    .filter((i) => isItemOpen(i.status))
    .sort((a, b) => a.due.localeCompare(b.due))[0];
}

export function ProjectCard({ project: p, compact }: { project: Project; compact?: boolean }) {
  const { t } = useTranslation();
  const { programme, funder, person } = useLookup();
  const health = projectHealth(p);
  const next = nextDeadline(p);
  const late = overdueCount(p);
  const progress = projectProgress(p);
  const elapsed = timeElapsedPct(p);

  return (
    <Link to={`/projects/${p.id}`} className={s.card} data-health={health}>
      <div className={s.top}>
        <span className={`mono ${s.code}`}>{p.code}</span>
        <HealthBadge health={health} />
      </div>
      <h3 className={s.title}>{p.title}</h3>
      {!compact && (
        <div className={s.tags}>
          <span className={s.prog}>{programme(p.programmeId)?.short}</span>
          {p.funderIds.map((f) => (
            <Tag key={f}>{funder(f)?.short}</Tag>
          ))}
        </div>
      )}
      <ProgressBar
        value={progress}
        marker={p.status === 'planned' ? undefined : elapsed}
        tone={health === 'off_track' ? 'risk' : health === 'at_risk' ? 'warn' : 'brand'}
      />
      <div className={s.foot}>
        {next ? (
          <span className={s.next}>
            <DueChip due={next.due} showDate={false} />
            <span>{next.code} {next.title}</span>
          </span>
        ) : (
          <span className="muted">{t('projects.noDeadlines')}</span>
        )}
        {!compact && <AvatarStack people={p.teamIds.map(person)} max={3} />}
      </div>
      {late > 0 && daysUntil(p.start) <= 0 && <span className={s.late}>{t('projects.overdueN', { count: late })}</span>}
    </Link>
  );
}
