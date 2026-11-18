/* ==========================================================================
   GANTT TIMELINE: one project's work packages as bars across time, with
   deliverables (●), milestones (◆) and funder reports (■) on top.
   Pure HTML/CSS with percentage positions; scrolls sideways on phones.
   ========================================================================== */
import { useTranslation } from 'react-i18next';
import { addMonths, startOfMonth, format } from 'date-fns';
import type { Project } from '@/types/domain';
import { daysUntil, formatShort, parseISO, today, toISO, urgencyOf } from '@/lib/dates';
import { isItemOpen } from '@/lib/health';
import { useLookup } from '@/api/hooks';
import { Avatar } from '@/ui';
import { cx } from '@/lib/cx';
import s from './Gantt.module.css';

export function Gantt({ project: p }: { project: Project }) {
  const { t } = useTranslation();
  const { person } = useLookup();

  // Window = project start → end, padded by ~2 weeks
  const start = daysUntil(p.start) - 14;
  const end = daysUntil(p.end) + 14;
  const span = end - start;
  const pos = (iso: string) => ((daysUntil(iso) - start) / span) * 100;
  const todayPos = pos(toISO(today()));

  // Month ticks (show every month, label every Nth so they don't collide)
  const months: { left: number; label: string; year: boolean }[] = [];
  let m = startOfMonth(parseISO(p.start));
  while (daysUntil(toISO(m)) <= end) {
    const iso = toISO(m);
    const year = m.getMonth() === 0;
    if (daysUntil(iso) >= start) months.push({ left: pos(iso), label: format(m, year ? "MMM ''yy" : 'MMM'), year });
    m = addMonths(m, 1);
  }
  const every = months.length > 18 ? 3 : months.length > 9 ? 2 : 1;

  return (
    <div className={s.scroller}>
      <div className={s.gantt}>
        {/* time axis */}
        <div className={s.row}>
          <div className={s.label} />
          <div className={s.axis}>
            {months.map((mo, i) => (
              <span key={i} className={cx(s.month, mo.year && s.year)} style={{ left: `${mo.left}%` }}>
                {i % every === 0 || mo.year ? <span className="mono">{mo.label}</span> : null}
              </span>
            ))}
          </div>
        </div>

        {/* work packages */}
        {p.workPackages.map((wp) => {
          const items = p.deliverables.filter((d) => d.workPackageId === wp.id);
          const left = pos(wp.start);
          const width = pos(wp.end) - left;
          return (
            <div key={wp.id} className={s.row}>
              <div className={s.label}>
                <span className={`mono ${s.code}`}>{wp.code}</span>
                <span className={s.wpTitle}>{wp.title}</span>
                <Avatar person={person(wp.leadId)} size={20} />
              </div>
              <div className={s.lane}>
                {months.map((mo, i) => (
                  <i key={i} className={s.grid} style={{ left: `${mo.left}%` }} />
                ))}
                <div className={s.bar} style={{ left: `${left}%`, width: `${width}%` }} title={`${wp.code}: ${formatShort(wp.start)} → ${formatShort(wp.end)}`} />
                {items.map((d) => (
                  <span
                    key={d.id}
                    className={cx(s.mark, d.isMilestone ? s.milestone : s.deliverable, s[`u_${urgencyOf(d.due, !isItemOpen(d.status))}`])}
                    style={{ left: `${pos(d.due)}%` }}
                    title={`${d.code} ${d.title} · ${formatShort(d.due)}`}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* funder reports */}
        {p.reports.length > 0 && (
          <div className={s.row}>
            <div className={s.label}>
              <span className={`mono ${s.code}`}>RPT</span>
              <span className={s.wpTitle}>{t('project.funderReports')}</span>
            </div>
            <div className={s.lane}>
              {months.map((mo, i) => (
                <i key={i} className={s.grid} style={{ left: `${mo.left}%` }} />
              ))}
              {p.reports.map((r) => (
                <span
                  key={r.id}
                  className={cx(s.mark, s.report, s[`u_${urgencyOf(r.due, !isItemOpen(r.status))}`])}
                  style={{ left: `${pos(r.due)}%` }}
                  title={`${r.title} · ${formatShort(r.due)}`}
                />
              ))}
            </div>
          </div>
        )}

        {/* today line spans all rows */}
        {todayPos >= 0 && todayPos <= 100 && (
          <div className={s.todayLayer}>
            <div className={s.label} />
            <div className={s.todayTrack}>
              <i className={s.today} style={{ left: `${todayPos}%` }}>
                <span className="mono">{t('due.todayShort')}</span>
              </i>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
