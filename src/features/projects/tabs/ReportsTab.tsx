/* PROJECT → REPORTS: what the funder expects and when (technical, financial, final). */
import { useTranslation } from 'react-i18next';
import { FileText } from '@phosphor-icons/react';
import type { Project } from '@/types/domain';
import { isItemOpen } from '@/lib/health';
import { relativeDue } from '@/lib/dates';
import { useLookup } from '@/api/hooks';
import { Avatar, ButtonLink, Card, DueChip, EmptyState, StatusPill } from '@/ui';
import s from './tabs.module.css';

export function ReportsTab({ project: p }: { project: Project }) {
  const { t } = useTranslation();
  const { person, funder } = useLookup();
  const reports = [...p.reports].sort((a, b) => a.due.localeCompare(b.due));

  return (
    <Card
      title={t('project.funderReports')}
      meta={p.funderIds.map((f) => funder(f)?.short).join(' · ')}
      actions={
        <ButtonLink size="sm" to={`/reports?project=${p.id}`}>
          {t('project.statusReport')}
        </ButtonLink>
      }
      flush
    >
      {!reports.length ? (
        <EmptyState icon={<FileText size={36} />} title={t('project.noReports')} />
      ) : (
        <ul className={s.reports}>
          {reports.map((r) => (
            <li key={r.id}>
              <DueChip due={r.due} done={!isItemOpen(r.status)} />
              <div className={s.rMain}>
                <b>{r.title}</b>
                <small>
                  {t(`reportKind.${r.kind}`)} · {relativeDue(r.due)}
                </small>
              </div>
              <StatusPill status={r.status} />
              <Avatar person={person(r.ownerId)} size={26} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
