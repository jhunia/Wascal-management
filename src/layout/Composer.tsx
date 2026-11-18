/* ==========================================================================
   COMPOSER CONTEXT: lets ANY screen open the "Post update" sheet:
       const { openComposer } = useComposer();
       openComposer({ projectId: 'p-pv2h', deliverableId: '…' });
   The sheet itself lives in src/features/updates/PostUpdateSheet.tsx.
   ========================================================================== */
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { PostUpdateSheet } from '@/features/updates/PostUpdateSheet';

interface Preset {
  projectId?: string;
  deliverableId?: string;
}

const Ctx = createContext<{ openComposer: (preset?: Preset) => void } | null>(null);

export function ComposerProvider({ children }: { children: ReactNode }) {
  const [preset, setPreset] = useState<Preset | null>(null);
  const openComposer = useCallback((p: Preset = {}) => setPreset(p), []);
  return (
    <Ctx.Provider value={{ openComposer }}>
      {children}
      {preset && <PostUpdateSheet preset={preset} onClose={() => setPreset(null)} />}
    </Ctx.Provider>
  );
}

export function useComposer() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useComposer must be used inside <ComposerProvider>');
  return ctx;
}
