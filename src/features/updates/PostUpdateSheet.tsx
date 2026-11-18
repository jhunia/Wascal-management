/* ==========================================================================
   POST UPDATE SHEET: the quick progress form (works one-handed on a phone).
   Opened from anywhere with useComposer().openComposer({...}).
   Fields: project · (optional) deliverable + new % · summary · blockers · next steps
   ========================================================================== */
import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle } from '@phosphor-icons/react';
import { useAuth } from '@/auth/AuthContext';
import { usePostUpdate, useProjects } from '@/api/hooks';
import { Button, Field, Select, Sheet, TextArea } from '@/ui';
import s from './PostUpdateSheet.module.css';

export function PostUpdateSheet({
  preset,
  onClose,
}: {
  preset: { projectId?: string; deliverableId?: string };
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: projects } = useProjects();
  const post = usePostUpdate();

  // Default project: the preset, else the first project I'm on
  const mine = (projects ?? []).filter((p) => p.teamIds.includes(user!.id) || p.leadId === user!.id);
  const [projectId, setProjectId] = useState(preset.projectId ?? '');
  const pid = projectId || mine[0]?.id || projects?.[0]?.id || '';
  const project = projects?.find((p) => p.id === pid);

  const [deliverableId, setDeliverableId] = useState(preset.deliverableId ?? '');
  const deliverable = project?.deliverables.find((d) => d.id === deliverableId);
  const [progress, setProgress] = useState<number | null>(null);
  const pct = progress ?? deliverable?.progress ?? 0;

  const [summary, setSummary] = useState('');
  const [blockers, setBlockers] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e?: FormEvent) => {
    e?.preventDefault();
    if (summary.trim().length < 10) {
      setError(t('updates.errShort'));
      return;
    }
    await post.mutateAsync({
      projectId: pid,
      authorId: user!.id,
      summary: summary.trim(),
      blockers: blockers.trim() || undefined,
      nextSteps: nextSteps.trim() || undefined,
      deliverableId: deliverable?.id,
      newProgress: deliverable ? pct : undefined,
    });
  };

  if (post.isSuccess) {
    return (
      <Sheet open onClose={onClose} title={t('updates.post')}>
        <div className={s.done}>
          <CheckCircle size={56} weight="duotone" />
          <p className={s.doneTitle}>{t('updates.posted')}</p>
          <p className="muted">{t('updates.postedHint', { code: project?.code })}</p>
          <Button variant="primary" onClick={onClose}>
            {t('common.done')}
          </Button>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title={t('updates.post')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={() => submit()} disabled={post.isPending}>
            {post.isPending ? t('common.saving') : t('updates.submit')}
          </Button>
        </>
      }
    >
      <form onSubmit={submit}>
        <Field label={t('updates.project')}>
          <Select
            value={pid}
            onChange={(e) => {
              setProjectId(e.target.value);
              setDeliverableId('');
              setProgress(null);
            }}
          >
            {mine.length > 0 && (
              <optgroup label={t('mywork.myProjects')}>
                {mine.map((p) => (
                  <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
                ))}
              </optgroup>
            )}
            <optgroup label={t('projects.everyone')}>
              {(projects ?? [])
                .filter((p) => !mine.includes(p))
                .map((p) => (
                  <option key={p.id} value={p.id}>{p.code} · {p.title}</option>
                ))}
            </optgroup>
          </Select>
        </Field>

        <Field label={t('updates.deliverable')} hint={t('updates.deliverableHint')}>
          <Select
            value={deliverableId}
            onChange={(e) => {
              setDeliverableId(e.target.value);
              setProgress(null);
            }}
          >
            <option value="">{t('updates.general')}</option>
            {project?.deliverables
              .filter((d) => d.status !== 'done')
              .map((d) => (
                <option key={d.id} value={d.id}>{d.code} · {d.title}</option>
              ))}
          </Select>
        </Field>

        {deliverable && (
          <div className={s.slider}>
            <div className={s.sliderHead}>
              <span className={s.sliderLabel}>{t('updates.newProgress')}</span>
              <span className={`mono ${s.pct}`}>
                {deliverable.progress}% → <b>{pct}%</b>
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={pct}
              onChange={(e) => setProgress(Number(e.target.value))}
              style={{ ['--fill' as string]: `${pct}%` }}
              aria-label={t('updates.newProgress')}
            />
            <div className={s.quick}>
              {[25, 50, 75, 100].map((v) => (
                <button type="button" key={v} onClick={() => setProgress(v)} className={pct === v ? s.qOn : undefined}>
                  {v === 100 ? t('updates.complete') : `${v}%`}
                </button>
              ))}
            </div>
          </div>
        )}

        <Field label={t('updates.summary')} hint={t('updates.summaryHint')} error={error}>
          <TextArea
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              setError(null);
            }}
            rows={4}
            autoFocus
          />
        </Field>
        <Field label={t('updates.blockers')} hint={t('common.optional')}>
          <TextArea value={blockers} onChange={(e) => setBlockers(e.target.value)} rows={2} />
        </Field>
        <Field label={t('updates.nextSteps')} hint={t('common.optional')}>
          <TextArea value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} rows={2} />
        </Field>
      </form>
    </Sheet>
  );
}
