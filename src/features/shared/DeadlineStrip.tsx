/* ==========================================================================
   DEADLINE STRIP: the signature "radar" on the Portfolio page.
   One lane per project, a window from 2 weeks ago to N days ahead,
   a marker on each deadline (◆ milestone, ■ funder report, ● deliverable),
   coloured by urgency. The vertical ochre line is today.
   Built with plain HTML + percentages so it stretches to any width.
   ========================================================================== */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { addDays, startOfMonth } from 'date-fns';
import type { DeadlineItem, Project } from '@/types/domain';
import { daysUntil, formatShort, today, toISO, urgencyOf } from '@/lib/dates';
import { isItemOpen, projectHealth } from '@/lib/health';
import { HealthBadge } from '@/ui';
import { cx } from '@/lib/cx';
import s from './DeadlineStrip.module.css';

const PAST = 14;

export function DeadlineStrip({ projects, items, ahead = 90 }: { projects: Project[]; items: DeadlineItem[]; ahead?: number }) {
  const { t } = useTranslation();
  const span = PAST + ahead;
  const pos = (iso: string) => ((daysUntil(iso) + PAST) / span) * 100;

  // Month boundaries inside the window, for tick marks
  const ticks: { left: number; label: string }[] = [];
  let m = startOfMonth(addDays(today(), -PAST));
  while (daysUntil(toISO(m)) <= ahead) {
    const iso = toISO(m);
    if (daysUntil(iso) >= -PAST) ticks.push({ left: pos(iso), label: formatShort(iso) });
    m = startOfMonth(addDays(m, 32));
  }

  const lanes = projects
    .map((p) => ({ p, rows: items.filter((i) => i.projectId === p.id && daysUntil(i.due) >= -PAST && daysUntil(i.due) <= ahead) }))
    .filter((l) => l.rows.length);

  return (
    <div className={s.strip}>
      <div className={s.axis}>
        <span />
        <div className={s.track}>
          {ticks.map((tk) => (
            <span key={tk.label} className={cx(s.tick, 'mono')} style={{ left: `${tk.left}%` }}>
              {tk.label}
            </span>
          ))}
          <span className={cx(s.todayLabel, 'mono')} style={{ left: `${pos(toISO(today()))}%` }}>
            {t('due.todayShort')}
          </span>
        </div>
      </div>

      {lanes.map(({ p, rows }) => (
        <div key={p.id} className={s.lane}>
          <Link to={`/projects/${p.id}`} className={s.laneLabel}>
            <span className={s.hb}>
              <HealthBadge health={projectHealth(p)} compact />
            </span>
            <span className="mono">{p.code}</span>
          </Link>
          <div className={s.track}>
            {ticks.map((tk) => (
              <i key={tk.label} className={s.grid} style={{ left: `${tk.left}%` }} />
            ))}
            <i className={s.today} style={{ left: `${pos(toISO(today()))}%` }} />
            {rows.map((r) => {
              const u = urgencyOf(r.due, !isItemOpen(r.status));
              return (
                <Link
                  key={r.id}
                  to={`/projects/${p.id}/deliverables`}
                  className={cx(s.mark, s[r.kind], s[`u_${u}`])}
                  style={{ left: `${pos(r.due)}%` }}
                  title={`${r.code} ${r.title} · ${formatShort(r.due)}`}
                >
                  <span className="visually-hidden">{`${r.code} ${r.title}`}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      <div className={s.legend}>
        <span><i className={cx(s.mark, s.deliverable, s.u_later, s.static)} /> {t('kind.deliverable')}</span>
        <span><i className={cx(s.mark, s.milestone, s.u_later, s.static)} /> {t('kind.milestone')}</span>
        <span><i className={cx(s.mark, s.report, s.u_later, s.static)} /> {t('kind.report')}</span>
        <span className={s.sep} />
        <span><i className={cx(s.swatch, s.u_overdue)} /> {t('bucket.overdue')}</span>
        <span><i className={cx(s.swatch, s.u_urgent)} /> {t('bucket.week')}</span>
        <span><i className={cx(s.swatch, s.u_soon)} /> {t('bucket.month')}</span>
        <span><i className={cx(s.swatch, s.u_done)} /> {t('bucket.done')}</span>
      </div>
    </div>
  );
}
