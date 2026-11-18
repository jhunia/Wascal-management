/* ==========================================================================
   DEADLINES CALENDAR  (/calendar): every deadline across all projects.
   Laptop: month grid. Phone: agenda list (the grid is too small).
   Toggle "Only mine" to see just your items.
   ========================================================================== */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { useAuth } from '@/auth/AuthContext';
import { useDeadlines } from '@/api/hooks';
import { formatMonth, parseISO, toISO, today, urgencyOf } from '@/lib/dates';
import { isItemOpen } from '@/lib/health';
import { Button, Card, PageHeader, Segmented, SkeletonRows } from '@/ui';
import { DeadlineLedger } from '@/features/shared/DeadlineLedger';
import { cx } from '@/lib/cx';
import l from '@/features/shared/layout.module.css';
import s from './CalendarPage.module.css';

export function CalendarPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data, isLoading } = useDeadlines();
  const [cursor, setCursor] = useState(() => startOfMonth(today()));
  const [who, setWho] = useState<'all' | 'mine'>('all');

  const items = useMemo(() => (data ?? []).filter((i) => who === 'all' || i.ownerId === user!.id), [data, who, user]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }),
  });
  const byDay = useMemo(() => {
    const map = new Map<string, typeof items>();
    for (const i of items) map.set(i.due, [...(map.get(i.due) ?? []), i]);
    return map;
  }, [items]);
  const monthItems = items.filter((i) => isSameMonth(parseISO(i.due), cursor));
  const weekdays = days.slice(0, 7).map((d) => d.toLocaleDateString(t('locale'), { weekday: 'short' }));

  return (
    <>
      <PageHeader eyebrow={t('nav.calendar')} title={t('calendar.title')} lede={t('calendar.lede')} />

      <div className={l.filters}>
        <div className={s.nav}>
          <Button size="sm" icon={<CaretLeft size={16} weight="bold" />} onClick={() => setCursor((c) => addMonths(c, -1))} aria-label={t('calendar.prev')} />
          <h2 className={s.month}>{formatMonth(cursor)}</h2>
          <Button size="sm" icon={<CaretRight size={16} weight="bold" />} onClick={() => setCursor((c) => addMonths(c, 1))} aria-label={t('calendar.next')} />
          <Button size="sm" variant="ghost" onClick={() => setCursor(startOfMonth(today()))}>
            {t('calendar.today')}
          </Button>
        </div>
        <span className={l.grow} />
        <Segmented
          label={t('projects.who')}
          value={who}
          onChange={setWho}
          options={[
            { value: 'all', label: t('projects.everyone') },
            { value: 'mine', label: t('projects.onlyMine') },
          ]}
        />
      </div>

      {/* Month grid (laptop) */}
      <div className={s.grid}>
        {weekdays.map((w) => (
          <div key={w} className={s.wd}>{w}</div>
        ))}
        {days.map((d) => {
          const iso = toISO(d);
          const list = byDay.get(iso) ?? [];
          return (
            <div key={iso} className={cx(s.day, !isSameMonth(d, cursor) && s.out, isToday(d) && s.today)}>
              <span className={`mono ${s.num}`}>{d.getDate()}</span>
              <div className={s.chips}>
                {list.slice(0, 3).map((i) => (
                  <Link
                    key={i.id}
                    to={`/projects/${i.projectId}/deliverables`}
                    className={cx(s.chip, s[`u_${urgencyOf(i.due, !isItemOpen(i.status))}`], s[i.kind])}
                    title={`${i.projectCode} · ${i.code} ${i.title}`}
                  >
                    <b className="mono">{i.projectCode}</b> {i.title}
                  </Link>
                ))}
                {list.length > 3 && <span className={s.moreN}>+{list.length - 3}</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agenda (phone) */}
      <Card title={formatMonth(cursor)} meta={String(monthItems.length)} flush className={s.agenda}>
        {isLoading ? (
          <SkeletonRows rows={5} />
        ) : (
          <DeadlineLedger items={monthItems} groups={['overdue', 'week', 'month', 'later', 'done']} emptyText={t('calendar.empty')} />
        )}
      </Card>
    </>
  );
}
