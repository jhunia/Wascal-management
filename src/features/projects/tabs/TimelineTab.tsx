/* PROJECT → TIMELINE: the Gantt chart (see ../Gantt.tsx). */
import { useTranslation } from 'react-i18next';
import type { Project } from '@/types/domain';
import { Card } from '@/ui';
import { Gantt } from '../Gantt';
import s from './tabs.module.css';

export function TimelineTab({ project }: { project: Project }) {
  const { t } = useTranslation();
  return (
    <Card title={t('project.tab.timeline')} meta={t('project.timelineMeta')} flush>
      <Gantt project={project} />
      <p className={s.legend}>{t('project.timelineLegend')}</p>
    </Card>
  );
}
