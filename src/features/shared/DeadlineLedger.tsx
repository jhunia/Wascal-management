/* ==========================================================================
   DEADLINE LEDGER: the list of dated items, grouped into
   "Overdue / This week / Next 30 days / Later". Used by My Work, the
   calendar's agenda view and the project Deliverables tab.
   ========================================================================== */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FileText, Flag, Package, NotePencil } from '@phosphor-icons/react';
import type { DeadlineItem } from '@/types/domain';
import { daysUntil, formatShort } from '@/lib/dates';
import { isItemOpen } from '@/lib/health';
import { useLookup } from '@/api/hooks';
import { useComposer } from '@/layout/Composer';
import { Avatar, DueChip, StatusPill, Tag } from '@/ui';
import s from './DeadlineLedger.module.css';

export type Bucket = 'overdue' | 'week' | 'month' | 'later' | 'done';

export function bucketOf(item: DeadlineItem): Bucket {
  if (!isItemOpen(item.status)) return 'done';
  const d = daysUntil(item.due);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'week';
  if (d <= 30) return 'month';
  return 'later';
}

const KIND_ICON = { deliverable: Package, milestone: Flag, report: FileText };

export function DeadlineRow({ item, showProject = true }: { item: DeadlineItem; showProject?: boolean }) {
  const { t } = useTranslation();
  const { person } = useLookup();
  const { openComposer } = useComposer();
  const Icon = KIND_ICON[item.kind];
  const done = !isItemOpen(item.status);
  return (
    <li className={s.row} data-done={done || undefined}>
      <DueChip due={item.due} done={done} showDate={false} />
      <div className={s.what}>
        <Link to={`/projects/${item.projectId}/deliverables`} className={s.title}>
          <span className={s.code}>{item.code}</span> {item.title}
        </Link>
        <div className={s.meta}>
          {showProject && <Tag>{item.projectCode}</Tag>}
          <span className={s.kind}>
            <Icon size={14} weight={item.kind === 'report' ? 'fill' : 'regular'} />
            {t(`kind.${item.kind}`)}
          </span>
          <span>· {formatShort(item.due)}</span>
        </div>
      </div>
      <StatusPill status={item.status} />
      <Avatar person={person(item.ownerId)} size={28} />
      {!done && item.kind !== 'report' ? (
        <button
          className={s.act}
          onClick={() => openComposer({ projectId: item.projectId, deliverableId: item.id })}
          title={t('updates.post')}
          aria-label={t('updates.post')}
        >
          <NotePencil size={18} />
        </button>
      ) : (
        <span />
      )}
    </li>
  );
}

export function DeadlineLedger({
  items,
  showProject = true,
  groups = ['overdue', 'week', 'month', 'later'],
  emptyText,
}: {
  items: DeadlineItem[];
  showProject?: boolean;
  groups?: Bucket[];
  emptyText?: string;
}) {
  const { t } = useTranslation();
  const grouped = groups
    .map((g) => ({ g, rows: items.filter((i) => bucketOf(i) === g).sort((a, b) => a.due.localeCompare(b.due)) }))
    .filter((x) => x.rows.length);

  if (!grouped.length) return <p className={s.empty}>{emptyText ?? t('common.nothing')}</p>;

  return (
    <div className={s.ledger}>
      {grouped.map(({ g, rows }) => (
        <section key={g} className={s.group} data-bucket={g}>
          <h3 className={s.groupHead}>
            <span>{t(`bucket.${g}`)}</span>
            <span className="mono">{rows.length}</span>
          </h3>
          <ul className={s.rows}>
            {rows.map((i) => (
              <DeadlineRow key={i.id} item={i} showProject={showProject} />
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
