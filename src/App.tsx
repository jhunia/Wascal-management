/* ==========================================================================
   APP: wraps everything in the "providers" (shared services):
     QueryClientProvider → data fetching/caching (TanStack Query)
     PrefsProvider       → theme, language, notification settings
     AuthProvider        → who is signed in
     RouterProvider      → which screen to show for the URL (see routes.tsx)
   ========================================================================== */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/auth/AuthContext';
import { PrefsProvider } from '@/settings/PrefsContext';
import { router } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PrefsProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </PrefsProvider>
    </QueryClientProvider>
  );
}
