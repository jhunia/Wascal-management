/* ==========================================================================
   PROJECTS  (/projects): searchable, filterable grid of all projects.
   Filters: free-text search · status · programme · "only mine".
   ========================================================================== */
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MagnifyingGlass, FolderSimpleDashed } from '@phosphor-icons/react';
import type { ProjectStatus } from '@/types/domain';
import { useAuth } from '@/auth/AuthContext';
import { useLookup, useProjects } from '@/api/hooks';
import { EmptyState, FilterSelect, PageHeader, Segmented, Skeleton, TextInput } from '@/ui';
import { ProjectCard } from '@/features/shared/ProjectCard';
import l from '@/features/shared/layout.module.css';
import s from './ProjectsPage.module.css';

type StatusFilter = 'all' | ProjectStatus;

export function ProjectsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: projects, isLoading } = useProjects();
  const { programmes } = useLookup();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [prog, setProg] = useState('all');
  const [mine, setMine] = useState<'all' | 'mine'>('all');

  const all = projects ?? [];
  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all
      .filter((p) => status === 'all' || p.status === status)
      .filter((p) => prog === 'all' || p.programmeId === prog)
      .filter((p) => mine === 'all' || p.leadId === user!.id || p.teamIds.includes(user!.id))
      .filter(
        (p) =>
          !needle ||
          p.code.toLowerCase().includes(needle) ||
          p.title.toLowerCase().includes(needle) ||
          p.partners.some((x) => x.toLowerCase().includes(needle)),
      );
  }, [all, q, status, prog, mine, user]);

  const countBy = (st: StatusFilter) => (st === 'all' ? all.length : all.filter((p) => p.status === st).length);

  return (
    <>
      <PageHeader eyebrow={t('nav.projects')} title={t('projects.title')} lede={t('projects.lede')} />

      <div className={l.filters}>
        <label className={l.search}>
          <MagnifyingGlass size={16} />
          <span className="visually-hidden">{t('common.search')}</span>
          <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('projects.searchPh')} type="search" />
        </label>
        <FilterSelect label={t('filters.programme')} value={prog} onChange={setProg}>
          <option value="all">{t('filters.allProgrammes')}</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </FilterSelect>
        <Segmented
          label={t('projects.who')}
          value={mine}
          onChange={setMine}
          options={[
            { value: 'all', label: t('projects.everyone') },
            { value: 'mine', label: t('projects.onlyMine') },
          ]}
        />
      </div>

      <div className={s.statusRow}>
        <Segmented<StatusFilter>
          label={t('projects.status')}
          value={status}
          onChange={setStatus}
          options={(['all', 'active', 'planned', 'closing', 'closed'] as StatusFilter[]).map((st) => ({
            value: st,
            label: t(`projectStatus.${st}`),
            count: countBy(st),
          }))}
        />
      </div>

      {isLoading ? (
        <div className={s.grid}>
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} h={190} r={10} />
          ))}
        </div>
      ) : list.length ? (
        <div className={s.grid}>
          {list.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <EmptyState icon={<FolderSimpleDashed size={40} />} title={t('projects.none')}>
          {t('projects.noneHint')}
        </EmptyState>
      )}
    </>
  );
}
