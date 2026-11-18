/* ==========================================================================
   PROJECT HEALTH RULES: how a project becomes green / amber / red.
   This is business logic, so tweak the thresholds here; every badge,
   dashboard and filter uses these functions.
   (When the backend exists, it should run the SAME rules; keep them in sync.)
   ========================================================================== */
import type { DeadlineItem, Health, Project } from '@/types/domain';
import { daysUntil } from './dates';

const isOpen = (s: string) => s !== 'done' && s !== 'submitted';

/** How many open deliverables/reports are past their due date. */
export function overdueCount(p: Project): number {
  const items = [...p.deliverables, ...p.reports];
  return items.filter((i) => isOpen(i.status) && daysUntil(i.due) < 0).length;
}

/** Open items due within the next `days` days. */
export function dueWithin(p: Project, days: number): number {
  const items = [...p.deliverables, ...p.reports];
  return items.filter((i) => {
    const d = daysUntil(i.due);
    return isOpen(i.status) && d >= 0 && d <= days;
  }).length;
}

/**
 * The rule:
 *  - planned and not started yet     → not_started
 *  - any funder REPORT overdue, or 3+ items overdue, or anything blocked and overdue  → off_track (red)
 *  - 1–2 items overdue, or budget burn > time elapsed + 15 pts → at_risk (amber)
 *  - otherwise                       → on_track (green)
 */
export function projectHealth(p: Project): Health {
  if (p.status === 'planned' || daysUntil(p.start) > 0) return 'not_started';
  if (p.status === 'closed') return 'on_track';

  const overdue = overdueCount(p);
  const reportLate = p.reports.some((r) => isOpen(r.status) && daysUntil(r.due) < 0);
  const blockedLate = p.deliverables.some((d) => d.status === 'blocked' && daysUntil(d.due) < 0);
  if (reportLate || overdue >= 3 || blockedLate) return 'off_track';

  if (overdue > 0) return 'at_risk';
  if (burnGap(p) > 15) return 'at_risk';
  return 'on_track';
}

/** % of project duration already elapsed (0–100). */
export function timeElapsedPct(p: Project): number {
  const total = daysUntil(p.end) - daysUntil(p.start);
  const gone = -daysUntil(p.start);
  if (total <= 0) return 100;
  return Math.max(0, Math.min(100, Math.round((gone / total) * 100)));
}

/** % of budget spent (0–100+). */
export function budgetSpentPct(p: Project): number {
  if (!p.budgetEUR) return 0;
  return Math.round((p.spentEUR / p.budgetEUR) * 100);
}

/** Positive = spending faster than time passes. */
export function burnGap(p: Project): number {
  return budgetSpentPct(p) - timeElapsedPct(p);
}

/** Average progress of all deliverables (0–100). */
export function projectProgress(p: Project): number {
  if (!p.deliverables.length) return 0;
  return Math.round(p.deliverables.reduce((s, d) => s + d.progress, 0) / p.deliverables.length);
}

/** Flattens a project's deliverables + reports into dated items. */
export function deadlinesOf(p: Project): DeadlineItem[] {
  const fromDeliverables: DeadlineItem[] = p.deliverables.map((d) => ({
    id: d.id,
    kind: d.isMilestone ? 'milestone' : 'deliverable',
    code: d.code,
    title: d.title,
    due: d.due,
    status: d.status,
    ownerId: d.ownerId,
    projectId: p.id,
    projectCode: p.code,
  }));
  const fromReports: DeadlineItem[] = p.reports.map((r) => ({
    id: r.id,
    kind: 'report',
    code: r.kind === 'financial' ? 'FIN' : r.kind === 'final' ? 'FINAL' : 'TECH',
    title: r.title,
    due: r.due,
    status: r.status,
    ownerId: r.ownerId,
    projectId: p.id,
    projectCode: p.code,
  }));
  return [...fromDeliverables, ...fromReports];
}

export function isItemOpen(status: string): boolean {
  return isOpen(status);
}
