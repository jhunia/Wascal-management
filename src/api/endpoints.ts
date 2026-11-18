/* ==========================================================================
   API FUNCTIONS: the ONLY way screens get or change data.
   Right now they read the fake database (db.ts) with a small delay so
   loading states are visible. When the backend exists, replace each body
   with a real call, e.g.:

       export async function getProjects() {
         return http<Project[]>('/api/projects');
       }

   Screens never import db.ts or mocks/ directly, so nothing else changes.
   ========================================================================== */
import type { Alert, DeadlineItem, Person, ProgressUpdate, Project } from '@/types/domain';
import { projectsTable, save, store, updatesTable } from './db';
import { people } from '@/mocks/people';
import { funders, programmes } from '@/mocks/reference';
import { deadlinesOf, isItemOpen, projectHealth } from '@/lib/health';
import { daysUntil, toISO, today } from '@/lib/dates';

/** Pretend network latency (ms). Set to 0 for instant. */
const LATENCY = 220;
const wait = <T,>(value: T): Promise<T> => new Promise((r) => setTimeout(() => r(structuredClone(value)), LATENCY));

// ---- reference --------------------------------------------------------
export const getPeople = () => wait(people);
export const getFunders = () => wait(funders);
export const getProgrammes = () => wait(programmes);

// ---- projects ---------------------------------------------------------
export const getProjects = () => wait(projectsTable());

export async function getProject(id: string): Promise<Project | undefined> {
  return wait(projectsTable().find((p) => p.id === id));
}

/** Every dated item across all projects. */
export async function getDeadlines(): Promise<DeadlineItem[]> {
  return wait(projectsTable().flatMap(deadlinesOf).sort((a, b) => a.due.localeCompare(b.due)));
}

// ---- updates ----------------------------------------------------------
export async function getUpdates(projectId?: string): Promise<ProgressUpdate[]> {
  const all = updatesTable()
    .filter((u) => !projectId || u.projectId === projectId)
    .sort((a, b) => b.date.localeCompare(a.date));
  return wait(all);
}

export interface NewUpdate {
  projectId: string;
  authorId: string;
  summary: string;
  blockers?: string;
  nextSteps?: string;
  deliverableId?: string;
  newProgress?: number;
}

export async function postUpdate(input: NewUpdate): Promise<ProgressUpdate> {
  const update: ProgressUpdate = { id: `up-local-${Date.now()}`, date: toISO(today()), ...input };
  store.updates.unshift(update);

  // If the update moved a deliverable's progress, remember that too.
  if (input.deliverableId && input.newProgress !== undefined) {
    const project = projectsTable().find((p) => p.id === input.projectId);
    const d = project?.deliverables.find((x) => x.id === input.deliverableId);
    if (project && d) {
      store.progress[`${project.id}/${d.code}`] = {
        progress: input.newProgress,
        status: input.newProgress >= 100 ? 'done' : input.newProgress > 0 ? 'in_progress' : d.status,
      };
    }
  }
  save();
  return wait(update);
}

// ---- alerts -----------------------------------------------------------
/*
   Alerts are DERIVED from the data, the same way the backend scheduler
   will do it each night. Rules (see docs §7):
     report due in ≤30 days  → report_due     item due in ≤7 days → due_soon
     item overdue            → overdue        overdue > 3 days    → escalation (heads/execs)
     no update in 30 days    → stale          project red         → health_changed
*/
export async function getAlerts(me: Person): Promise<Alert[]> {
  const projects = projectsTable();
  const updates = updatesTable();
  const isBoss = me.role === 'executive' || me.role === 'programme_head' || me.role === 'admin';
  const alerts: Alert[] = [];
  const push = (a: Omit<Alert, 'read'>) => alerts.push({ ...a, read: store.readAlerts.includes(a.id) });

  for (const p of projects) {
    const mine = p.leadId === me.id || p.teamIds.includes(me.id);
    for (const item of deadlinesOf(p)) {
      if (!isItemOpen(item.status)) continue;
      const d = daysUntil(item.due);
      const myItem = item.ownerId === me.id || p.leadId === me.id;
      if (item.kind === 'report' && d >= 0 && d <= 30 && (myItem || mine)) {
        push({ id: `rd-${item.id}`, kind: 'report_due', projectId: p.id, itemId: item.id, title: item.title, detail: `${p.code} · funder report`, createdAt: toISO(today()) });
      } else if (d >= 0 && d <= 7 && myItem) {
        push({ id: `ds-${item.id}`, kind: 'due_soon', projectId: p.id, itemId: item.id, title: `${item.code} ${item.title}`, detail: p.code, createdAt: toISO(today()) });
      }
      if (d < 0 && myItem) {
        push({ id: `od-${item.id}`, kind: 'overdue', projectId: p.id, itemId: item.id, title: `${item.code} ${item.title}`, detail: p.code, createdAt: item.due });
      }
      if (d < -3 && isBoss && !myItem) {
        push({ id: `es-${item.id}`, kind: 'escalation', projectId: p.id, itemId: item.id, title: `${item.code} ${item.title}`, detail: `${p.code} · ${Math.abs(d)}d`, createdAt: item.due });
      }
    }
    const last = updates.filter((u) => u.projectId === p.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    if (p.status === 'active' && (!last || daysUntil(last.date) < -30) && (mine || isBoss)) {
      push({ id: `st-${p.id}`, kind: 'stale', projectId: p.id, title: p.code, detail: last ? last.date : '', createdAt: toISO(today()) });
    }
    if (projectHealth(p) === 'off_track' && (mine || isBoss)) {
      push({ id: `hc-${p.id}`, kind: 'health_changed', projectId: p.id, title: p.code, detail: p.title, createdAt: toISO(today()) });
    }
  }
  const order = { escalation: 0, overdue: 1, health_changed: 2, report_due: 3, due_soon: 4, stale: 5, assigned: 6 };
  return wait(alerts.sort((a, b) => order[a.kind] - order[b.kind]));
}

export async function markAlertsRead(ids: string[]): Promise<void> {
  for (const id of ids) if (!store.readAlerts.includes(id)) store.readAlerts.push(id);
  save();
  return wait(undefined);
}
