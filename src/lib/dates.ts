/* ==========================================================================
   DATE HELPERS: every "due in 7 days" / "3 days late" calculation lives here.
   Uses date-fns (https://date-fns.org). Deadlines are whole days (no times).
   ========================================================================== */
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { enGB, fr } from 'date-fns/locale';
import i18n from '@/i18n';
import type { ISODate } from '@/types/domain';

/** Today at midnight. All "days left" maths starts from here. */
export function today(): Date {
  return startOfDay(new Date());
}

/** Date → "2026-12-01" */
export function toISO(date: Date): ISODate {
  return format(date, 'yyyy-MM-dd');
}

/** Today shifted by N days, as an ISO string. Mock data uses this so deadlines always look "live". */
export function fromToday(days: number): ISODate {
  return toISO(addDays(today(), days));
}

/** Days from today until the date. Negative = in the past (overdue). */
export function daysUntil(date: ISODate): number {
  return differenceInCalendarDays(parseISO(date), today());
}

function locale() {
  return i18n.language?.startsWith('fr') ? fr : enGB;
}

/** "12 Dec 2026" */
export function formatDate(date: ISODate): string {
  return format(parseISO(date), 'd MMM yyyy', { locale: locale() });
}

/** "12 Dec" (no year), for compact lists */
export function formatShort(date: ISODate): string {
  return format(parseISO(date), 'd MMM', { locale: locale() });
}

/** "Mon 12" */
export function formatDay(date: Date): string {
  return format(date, 'EEE d', { locale: locale() });
}

/** "December 2026" */
export function formatMonth(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: locale() });
}

/** Human countdown: "Today", "Tomorrow", "In 5 days", "3 days late" (translated). */
export function relativeDue(date: ISODate): string {
  const d = daysUntil(date);
  if (d === 0) return i18n.t('due.today');
  if (d === 1) return i18n.t('due.tomorrow');
  if (d > 1) return i18n.t('due.inDays', { count: d });
  return i18n.t('due.late', { count: Math.abs(d) });
}

/** Urgency bucket used for colours on the DueChip. */
export type Urgency = 'overdue' | 'urgent' | 'soon' | 'later' | 'done';

export function urgencyOf(due: ISODate, done = false): Urgency {
  if (done) return 'done';
  const d = daysUntil(due);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'urgent';
  if (d <= 30) return 'soon';
  return 'later';
}

export { parseISO, addDays };
