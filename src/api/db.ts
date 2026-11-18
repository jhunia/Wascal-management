/* ==========================================================================
   FAKE DATABASE (in the browser).
   Holds the mock data in memory and saves YOUR changes (posted updates,
   read alerts, settings) in localStorage so they survive a page refresh.

   ⚠️ This whole file disappears when the real backend arrives.
   Reset demo data: Settings → "Reset demo data", or clear site data.
   ========================================================================== */
import type { ProgressUpdate, Project } from '@/types/domain';
import { buildProjects } from '@/mocks/projects';
import { seedUpdates } from '@/mocks/updates';

const KEY = 'wascal-tracker:db:v1';

interface Persisted {
  updates: ProgressUpdate[]; // updates posted in the browser
  readAlerts: string[]; // ids of alerts marked as read
  progress: Record<string, { progress: number; status: string }>; // deliverable changes
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Persisted;
  } catch {
    /* private mode / blocked storage: just start fresh */
  }
  return { updates: [], readAlerts: [], progress: {} };
}

export const store = load();

export function save(): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function resetDemo(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** All projects, with the browser-side deliverable changes applied on top. */
export function projectsTable(): Project[] {
  return buildProjects().map((p) => ({
    ...p,
    deliverables: p.deliverables.map((d) => {
      const patch = store.progress[`${p.id}/${d.code}`];
      return patch ? { ...d, progress: patch.progress, status: patch.status as typeof d.status } : d;
    }),
  }));
}

export function updatesTable(): ProgressUpdate[] {
  return [...store.updates, ...seedUpdates];
}
