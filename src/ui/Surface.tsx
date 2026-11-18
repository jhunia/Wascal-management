/* ==========================================================================
   SURFACES: building blocks for page layout.
   - PageHeader : deep-blue banner at the top of each screen (same style as
                  the page banners on the WASCAL website)
   - Card       : white panel with optional title row + actions
   - Stat       : a compact number tile ("3 · Overdue")
   - EmptyState : friendly "nothing here" message
   - Skeleton   : grey shimmering placeholder while data loads
   - Tag        : small neutral label (country codes, funder names)
   ========================================================================== */
import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import s from './Surface.module.css';

export function PageHeader({
  eyebrow,
  above,
  title,
  lede,
  actions,
  children,
}: {
  /** small ochre uppercase label above the title */
  eyebrow?: ReactNode;
  /** anything to show above the title instead of an eyebrow (e.g. back link + badges) */
  above?: ReactNode;
  title: ReactNode;
  lede?: ReactNode;
  actions?: ReactNode;
  /** extra content at the bottom of the banner (facts, summary chips…) */
  children?: ReactNode;
}) {
  return (
    <header className={s.banner}>
      <div className={s.bannerMain}>
        <div className={s.bannerText}>
          {above}
          {eyebrow && <div className={s.bannerEyebrow}>{eyebrow}</div>}
          <h1 className={s.pageTitle}>{title}</h1>
          {lede && <p className={s.lede}>{lede}</p>}
        </div>
        {actions && <div className={s.actions}>{actions}</div>}
      </div>
      {children && <div className={s.bannerExtra}>{children}</div>}
    </header>
  );
}

export function Card({
  title,
  meta,
  actions,
  children,
  flush,
  className,
}: {
  title?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  /** no inner padding (for tables/lists that run edge to edge) */
  flush?: boolean;
  className?: string;
}) {
  return (
    <section className={cx(s.card, className)}>
      {(title || actions) && (
        <div className={s.cardHead}>
          <div className={s.cardTitleWrap}>
            {title && <h2 className={s.cardTitle}>{title}</h2>}
            {meta && <span className={s.cardMeta}>{meta}</span>}
          </div>
          {actions}
        </div>
      )}
      <div className={flush ? undefined : s.cardBody}>{children}</div>
    </section>
  );
}

export function Stat({
  label,
  value,
  tone = 'neutral',
  hint,
  onClick,
  active,
}: {
  label: ReactNode;
  value: ReactNode;
  tone?: 'neutral' | 'ok' | 'warn' | 'risk' | 'ochre';
  hint?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag className={cx(s.stat, s[`tone_${tone}`], onClick && s.statBtn, active && s.statActive)} onClick={onClick} aria-pressed={onClick ? !!active : undefined}>
      <span className={s.statLabel}>
        <i className={s.statDot} aria-hidden />
        {label}
      </span>
      <span className={s.statValue}>{value}</span>
      {hint && <span className={s.statHint}>{hint}</span>}
    </Tag>
  );
}

export function EmptyState({ icon, title, children }: { icon?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className={s.empty}>
      {icon && <div className={s.emptyIcon}>{icon}</div>}
      <p className={s.emptyTitle}>{title}</p>
      {children && <div className={s.emptyBody}>{children}</div>}
    </div>
  );
}

export function Skeleton({ h = 16, w = '100%', r = 6 }: { h?: number; w?: number | string; r?: number }) {
  return <span className={s.skeleton} style={{ height: h, width: w, borderRadius: r }} />;
}

export function SkeletonRows({ rows = 5 }: { rows?: number }) {
  return (
    <div className={s.skelRows}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} h={18} w={`${90 - ((i * 13) % 35)}%`} />
      ))}
    </div>
  );
}

export function Tag({ children, title }: { children: ReactNode; title?: string }) {
  return (
    <span className={s.tag} title={title}>
      {children}
    </span>
  );
}
