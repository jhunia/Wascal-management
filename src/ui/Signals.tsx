/* ==========================================================================
   SIGNALS: the small coloured indicators used everywhere.
   - HealthBadge : project health as a tinted pill with a dot (compact = dot only)
   - StatusPill  : deliverable status (not started, in progress, done…)
   - DueChip     : when something is due. Loud only when it matters:
                     overdue    → red pill  "5 days late"
                     ≤ 7 days   → ochre pill "In 3 days"
                     later      → plain date "12 Dec"
                     done       → muted "✓ 12 Dec"
   ========================================================================== */
import { useTranslation } from 'react-i18next';
import type { Health, ISODate, ItemStatus } from '@/types/domain';
import { daysUntil, formatShort, relativeDue, urgencyOf } from '@/lib/dates';
import { cx } from '@/lib/cx';
import s from './Signals.module.css';

export function HealthBadge({ health, compact }: { health: Health; compact?: boolean }) {
  const { t } = useTranslation();
  const label = t(`health.${health}`);
  if (compact) {
    return (
      <span className={cx(s.healthDot, s[health])} title={label}>
        <span className="visually-hidden">{label}</span>
      </span>
    );
  }
  return (
    <span className={cx(s.health, s[health])}>
      <i aria-hidden />
      {label}
    </span>
  );
}

export function StatusPill({ status }: { status: ItemStatus }) {
  const { t } = useTranslation();
  return <span className={cx(s.pill, s[`st_${status}`])}>{t(`status.${status}`)}</span>;
}

/** When an item is due. `showDate=false` gives the short relative form only. */
export function DueChip({ due, done, showDate = true }: { due: ISODate; done?: boolean; showDate?: boolean }) {
  const { t } = useTranslation();
  const u = urgencyOf(due, done);
  const d = daysUntil(due);

  if (u === 'overdue' || u === 'urgent') {
    const text = u === 'overdue' ? t('due.lateShort', { count: Math.abs(d) }) : d === 0 ? t('due.todayShort') : d === 1 ? t('due.tomorrowShort') : t('due.inShort', { count: d });
    return (
      <span className={cx(s.due, s[`u_${u}`])} title={`${relativeDue(due)} · ${formatShort(due)}`}>
        {text}
        {showDate && <small>{formatShort(due)}</small>}
      </span>
    );
  }
  return (
    <span className={cx(s.dueQuiet, done && s.dueDone)} title={relativeDue(due)}>
      {done && '✓ '}
      {formatShort(due)}
    </span>
  );
}
