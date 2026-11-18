/* ==========================================================================
   SMALL BITS
   - Avatar / AvatarStack : initials circle for a person
   - ProgressBar          : thin bar with % (optional "time elapsed" marker)
   - Segmented            : pill switch for filters ("All · Mine · Overdue")
   ========================================================================== */
import type { ReactNode } from 'react';
import type { Person } from '@/types/domain';
import { cx, initials } from '@/lib/cx';
import s from './Bits.module.css';

// Avatars are one calm brand colour (blue tint + deep-blue initials), like the website's chips.
export function Avatar({ person, size = 28 }: { person?: Person; size?: number }) {
  if (!person) return <span className={s.avatar} style={{ width: size, height: size }} />;
  return (
    <span
      className={s.avatar}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      title={person.name}
    >
      {initials(person.name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4 }: { people: (Person | undefined)[]; max?: number }) {
  const shown = people.filter(Boolean).slice(0, max) as Person[];
  const extra = people.length - shown.length;
  return (
    <span className={s.stack}>
      {shown.map((p) => (
        <Avatar key={p.id} person={p} size={26} />
      ))}
      {extra > 0 && <span className={s.more}>+{extra}</span>}
    </span>
  );
}

export function ProgressBar({
  value,
  marker,
  tone = 'brand',
  label,
}: {
  value: number;
  /** optional second marker, e.g. % of time elapsed */
  marker?: number;
  tone?: 'brand' | 'ok' | 'warn' | 'risk';
  label?: ReactNode;
}) {
  return (
    <div className={s.progressWrap}>
      <div className={cx(s.progress, s[`p_${tone}`])} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${Math.min(100, value)}%` }} />
        {marker !== undefined && <i style={{ left: `${Math.min(100, marker)}%` }} />}
      </div>
      {label !== undefined ? label : <span className={cx('mono', s.pct)}>{value}%</span>}
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; count?: number }[];
  label: string;
}) {
  return (
    <div className={s.segmented} role="tablist" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          className={cx(s.seg, value === o.value && s.segOn)}
          onClick={() => onChange(o.value)}
        >
          {o.label}
          {o.count !== undefined && <span className={s.count}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}
