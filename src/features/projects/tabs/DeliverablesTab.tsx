/* PROJECT → DELIVERABLES: every deliverable/milestone/report, filterable by work package. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Project } from '@/types/domain';
import { deadlinesOf } from '@/lib/health';
import { Card, FilterSelect } from '@/ui';
import { DeadlineLedger } from '@/features/shared/DeadlineLedger';

export function DeliverablesTab({ project: p }: { project: Project }) {
  const { t } = useTranslation();
  const [wp, setWp] = useState('all');
  const items = deadlinesOf(p).filter((i) => {
    if (wp === 'all') return true;
    if (wp === 'reports') return i.kind === 'report';
    return p.deliverables.find((d) => d.id === i.id)?.workPackageId === wp;
  });

  return (
    <Card
      title={t('project.tab.deliverables')}
      meta={String(items.length)}
      actions={
        <FilterSelect label={t('project.workPackages')} value={wp} onChange={setWp}>
          <option value="all">{t('project.allWps')}</option>
          {p.workPackages.map((w) => (
            <option key={w.id} value={w.id}>{w.code} · {w.title}</option>
          ))}
          <option value="reports">{t('project.funderReports')}</option>
        </FilterSelect>
      }
      flush
    >
      <DeadlineLedger items={items} showProject={false} groups={['overdue', 'week', 'month', 'later', 'done']} />
    </Card>
  );
}
