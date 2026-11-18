/* PROJECT → UPDATES: the project's progress diary, newest first. */
import { useTranslation } from 'react-i18next';
import { NotePencil } from '@phosphor-icons/react';
import type { Project } from '@/types/domain';
import { formatDate } from '@/lib/dates';
import { useLookup, useUpdates } from '@/api/hooks';
import { useComposer } from '@/layout/Composer';
import { Avatar, Button, Card, EmptyState, SkeletonRows } from '@/ui';
import s from './tabs.module.css';

export function UpdatesTab({ project: p }: { project: Project }) {
  const { t } = useTranslation();
  const { person } = useLookup();
  const { data: updates, isLoading } = useUpdates(p.id);
  const { openComposer } = useComposer();

  return (
    <Card
      title={t('project.tab.updates')}
      meta={String(updates?.length ?? '')}
      actions={
        <Button size="sm" variant="primary" icon={<NotePencil size={15} weight="bold" />} onClick={() => openComposer({ projectId: p.id })}>
          {t('updates.post')}
        </Button>
      }
    >
      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : !updates?.length ? (
        <EmptyState title={t('updates.none')}>{t('updates.noneHint')}</EmptyState>
      ) : (
        <ol className={s.diary}>
          {updates.map((u) => {
            const d = u.deliverableId ? p.deliverables.find((x) => x.id === u.deliverableId) : undefined;
            return (
              <li key={u.id}>
                <span className={`mono ${s.diaryDate}`}>{formatDate(u.date)}</span>
                <div className={s.diaryCard}>
                  <div className={s.feedHead}>
                    <Avatar person={person(u.authorId)} size={24} />
                    <b>{person(u.authorId)?.name}</b>
                    {d && (
                      <span className={s.diaryTag}>
                        <span className="mono">{d.code}</span> → {u.newProgress}%
                      </span>
                    )}
                  </div>
                  <p>{u.summary}</p>
                  {u.blockers && (
                    <p className={s.blocker}>
                      <b>{t('updates.blockers')}:</b> {u.blockers}
                    </p>
                  )}
                  {u.nextSteps && (
                    <p className={s.next}>
                      <b>{t('updates.nextSteps')}:</b> {u.nextSteps}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
