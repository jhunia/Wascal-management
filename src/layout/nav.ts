/* ==========================================================================
   MENU: the items in the sidebar (laptop) and bottom tab bar (phone).
   `label` is a translation key (see src/i18n/en.json → "nav").
   `mobile: true` puts it in the phone's bottom bar (max 4 + "More").
   `roles` limits who sees it (leave out = everyone).
   ========================================================================== */
import type { Icon } from '@phosphor-icons/react';
import {
  CalendarDots,
  ChartPieSlice,
  ClipboardText,
  Bell,
  FolderSimple,
  ListChecks,
  GearSix,
  UsersThree,
} from '@phosphor-icons/react';
import type { Role } from '@/types/domain';

export interface NavItem {
  to: string;
  label: string;
  icon: Icon;
  mobile?: boolean;
  roles?: Role[];
  section: 'main' | 'footer';
}

export const NAV: NavItem[] = [
  { to: '/my-work', label: 'nav.myWork', icon: ListChecks, mobile: true, section: 'main' },
  { to: '/portfolio', label: 'nav.portfolio', icon: ChartPieSlice, mobile: true, section: 'main' },
  { to: '/projects', label: 'nav.projects', icon: FolderSimple, mobile: true, section: 'main' },
  { to: '/calendar', label: 'nav.calendar', icon: CalendarDots, mobile: true, section: 'main' },
  { to: '/alerts', label: 'nav.alerts', icon: Bell, section: 'main' },
  { to: '/reports', label: 'nav.reports', icon: ClipboardText, section: 'main' },
  { to: '/settings', label: 'nav.settings', icon: GearSix, section: 'footer' },
  { to: '/admin', label: 'nav.admin', icon: UsersThree, roles: ['admin', 'executive'], section: 'footer' },
];
