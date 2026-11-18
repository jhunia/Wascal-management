/* ==========================================================================
   ROUTES: every URL in the app and the screen it shows.
   To add a page: create it in src/features/<area>/, then add a line here
   and (optionally) a menu entry in src/layout/nav.ts.
   ========================================================================== */
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/layout/AppShell';
import { RequireAuth } from '@/auth/RequireAuth';
import { SignInPage } from '@/features/auth/SignInPage';
import { MyWorkPage } from '@/features/mywork/MyWorkPage';
import { DashboardPage } from '@/features/portfolio/DashboardPage';
import { ProjectsPage } from '@/features/projects/ProjectsPage';
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage';
import { CalendarPage } from '@/features/calendar/CalendarPage';
import { AlertsPage } from '@/features/alerts/AlertsPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AdminPage } from '@/features/settings/AdminPage';
import { NotFoundPage } from '@/features/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/sign-in', element: <SignInPage /> },
  {
    // Everything below needs a signed-in @wascal.org user.
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <Navigate to="/my-work" replace /> },
      { path: 'my-work', element: <MyWorkPage /> },
      { path: 'portfolio', element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectDetailPage /> },
      { path: 'projects/:projectId/:tab', element: <ProjectDetailPage /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'reports', element: <ReportsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'admin', element: <AdminPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
