/* ==========================================================================
   DOMAIN TYPES: what a Project, Deliverable, Update etc. look like.
   The fake API (src/api) returns these shapes, and the real backend will
   return the same shapes later. If you add a field, add it here first;
   TypeScript will then show you every place that needs updating.
   ========================================================================== */

/** ISO date string, e.g. "2026-12-01". Times are not tracked for deadlines. */
export type ISODate = string;

export type Role = 'admin' | 'executive' | 'programme_head' | 'lead' | 'member' | 'finance';

export type CountryCode =
  | 'BJ' | 'BF' | 'CV' | 'CI' | 'GM' | 'GH' | 'GN' | 'ML' | 'NE' | 'NG' | 'SN' | 'SL' | 'TG' | 'DE';

export interface Person {
  id: string;
  name: string;
  email: string; // always @wascal.org for staff
  title: string;
  unit: 'HQ Accra' | 'Competence Centre' | 'Graduate Programme' | 'Finance' | 'ICT';
  role: Role;
  country: CountryCode;
}

/** Who pays for a project. */
export interface Funder {
  id: string;
  name: string;
  short: string;
}

/**
 * Which WASCAL pillar/programme a project belongs to.
 * kind = research (WRAP/competence projects), graduate (GSP cohorts), service (CICLES), event.
 */
export interface Programme {
  id: string;
  name: string;
  short: string;
  kind: 'research' | 'graduate' | 'service' | 'event';
}

/** Lifecycle stage of a project. */
export type ProjectStatus = 'planned' | 'active' | 'closing' | 'closed';

/** Traffic-light health. Calculated from deadlines; see src/lib/health.ts. */
export type Health = 'on_track' | 'at_risk' | 'off_track' | 'not_started';

export type ItemStatus = 'not_started' | 'in_progress' | 'submitted' | 'done' | 'blocked';

export type DeliverableType =
  | 'report' | 'dataset' | 'model' | 'policy_brief' | 'publication' | 'workshop' | 'training' | 'software' | 'other';

export interface Deliverable {
  id: string;
  code: string; // e.g. "D2.3"
  title: string;
  type: DeliverableType;
  workPackageId: string;
  ownerId: string;
  due: ISODate;
  status: ItemStatus;
  progress: number; // 0..100
  isMilestone: boolean;
  completedOn?: ISODate;
}

export interface WorkPackage {
  id: string;
  code: string; // e.g. "WP2"
  title: string;
  leadId: string;
  start: ISODate;
  end: ISODate;
}

/** A report the funder expects (technical, financial, final). The most important kind of deadline. */
export interface ReportObligation {
  id: string;
  title: string;
  kind: 'technical' | 'financial' | 'final';
  due: ISODate;
  status: ItemStatus;
  ownerId: string;
}

/** A short dated progress note posted by a team member. */
export interface ProgressUpdate {
  id: string;
  projectId: string;
  authorId: string;
  date: ISODate;
  summary: string;
  blockers?: string;
  nextSteps?: string;
  deliverableId?: string;
  newProgress?: number;
}

export interface Project {
  id: string;
  code: string; // e.g. "DAS-CLIM"
  title: string;
  summary: string;
  programmeId: string;
  funderIds: string[];
  leadId: string;
  teamIds: string[];
  countries: CountryCode[];
  partners: string[];
  start: ISODate;
  end: ISODate;
  status: ProjectStatus;
  budgetEUR: number;
  spentEUR: number;
  workPackages: WorkPackage[];
  deliverables: Deliverable[];
  reports: ReportObligation[];
}

/** One item in the alerts centre. */
export interface Alert {
  id: string;
  kind: 'due_soon' | 'overdue' | 'escalation' | 'stale' | 'assigned' | 'health_changed' | 'report_due';
  projectId: string;
  itemId?: string;
  title: string;
  detail: string;
  createdAt: ISODate;
  read: boolean;
}

/** Anything with a due date, flattened across projects. Used by My Work, the calendar and the deadline strip. */
export interface DeadlineItem {
  id: string;
  kind: 'deliverable' | 'milestone' | 'report';
  code: string;
  title: string;
  due: ISODate;
  status: ItemStatus;
  ownerId: string;
  projectId: string;
  projectCode: string;
}
