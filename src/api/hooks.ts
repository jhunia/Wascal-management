/* ==========================================================================
   DATA HOOKS: what screens actually call, e.g. `const { data } = useProjects()`.
   Built on TanStack Query, which handles loading states, caching and
   refreshing for us. Docs: https://tanstack.com/query/latest

   Each hook has a `queryKey`, the cache label. After a change (mutation)
   we "invalidate" the related keys so screens refetch fresh data.
   ========================================================================== */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './endpoints';
import { useAuth } from '@/auth/AuthContext';

export const keys = {
  people: ['people'] as const,
  funders: ['funders'] as const,
  programmes: ['programmes'] as const,
  projects: ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  deadlines: ['deadlines'] as const,
  updates: (projectId?: string) => ['updates', projectId ?? 'all'] as const,
  alerts: (userId: string) => ['alerts', userId] as const,
};

export const usePeople = () => useQuery({ queryKey: keys.people, queryFn: api.getPeople, staleTime: Infinity });
export const useFunders = () => useQuery({ queryKey: keys.funders, queryFn: api.getFunders, staleTime: Infinity });
export const useProgrammes = () => useQuery({ queryKey: keys.programmes, queryFn: api.getProgrammes, staleTime: Infinity });
export const useProjects = () => useQuery({ queryKey: keys.projects, queryFn: api.getProjects });
export const useProject = (id: string) => useQuery({ queryKey: keys.project(id), queryFn: () => api.getProject(id) });
export const useDeadlines = () => useQuery({ queryKey: keys.deadlines, queryFn: api.getDeadlines });
export const useUpdates = (projectId?: string) =>
  useQuery({ queryKey: keys.updates(projectId), queryFn: () => api.getUpdates(projectId) });

export function useAlerts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: keys.alerts(user?.id ?? 'anon'),
    queryFn: () => api.getAlerts(user!),
    enabled: !!user,
  });
}

export function usePostUpdate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.postUpdate,
    onSuccess: () => {
      // Anything that might show progress or updates needs a refresh.
      qc.invalidateQueries({ queryKey: ['updates'] });
      qc.invalidateQueries({ queryKey: keys.projects });
      qc.invalidateQueries({ queryKey: keys.deadlines });
      qc.invalidateQueries({ queryKey: ['alerts'] });
    },
  });
}

export function useMarkAlertsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.markAlertsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });
}

/** Lookup helpers built from the cached reference lists. */
export function useLookup() {
  const people = usePeople().data ?? [];
  const funders = useFunders().data ?? [];
  const programmes = useProgrammes().data ?? [];
  return {
    person: (id: string) => people.find((p) => p.id === id),
    funder: (id: string) => funders.find((f) => f.id === id),
    programme: (id: string) => programmes.find((p) => p.id === id),
    people,
    funders,
    programmes,
  };
}
