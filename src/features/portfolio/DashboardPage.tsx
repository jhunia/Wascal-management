/* ==========================================================================
   PORTFOLIO DASHBOARD  (/portfolio): management's view of everything.
     1. Health tiles (click to filter)
     2. Filters: programme · funder · country · window (30/60/90 days)
     3. Deadline strip: every project's deadlines on one timeline
     4. Health board: table of projects, worst first
     5. Side: breakdown by programme and by country
   ========================================================================== */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { CountryCode, Health } from '@/types/domain';
import { useDeadlines, useLookup, useProjects } from '@/api/hooks';
import {
  budgetSpentPct,
  dueWithin,
  overdueCount,
  projectHealth,
  projectProgress,
  timeElapsedPct,
} from '@/lib/health';
import { countries } from '@/mocks/reference';
import { usePrefs } from '@/settings/PrefsContext';
import { money } from '@/lib/cx';
import { Avatar, Card, DueChip, FilterSelect, HealthBadge, PageHeader, ProgressBar, Segmented, SkeletonRows, Stat } from '@/ui';
import { DeadlineStrip } from '@/features/shared/DeadlineStrip';
import { nextDeadline } from '@/features/shared/ProjectCard';
import l from '@/features/shared/layout.module.css';
import s from './DashboardPage.module.css';

const HEALTH_ORDER: Record<Health, number> = { off_track: 0, at_risk: 1, on_track: 2, not_started: 3 };

export function DashboardPage() {
  const { t } = useTranslation();
  const { prefs } = usePrefs();
  const { data: projects, isLoading } = useProjects();
  const { data: deadlines } = useDeadlines();
  const { programmes, funders, programme, funder, person } = useLookup();

  const [health, setHealth] = useState<Health | null>(null);
  const [prog, setProg] = useState('all');
  const [fund, setFund] = useState('all');
  const [country, setCountry] = useState('all');
  const [win, setWin] = useState<'30' | '60' | '90'>('90');

  const all = projects ?? [];
  const live = all.filter((p) => p.status !== 'closed');

  const filtered = useMemo(
    () =>
      live
        .filter((p) => prog === 'all' || p.programmeId === prog)
        .filter((p) => fund === 'all' || p.funderIds.includes(fund))
        .filter((p) => country === 'all' || p.countries.includes(country as CountryCode))
        .sort((a, b) => HEALTH_ORDER[projectHealth(a)] - HEALTH_ORDER[projectHealth(b)] || overdueCount(b) - overdueCount(a)),
    [live, prog, fund, country],
  );
  const shown = health ? filtered.filter((p) => projectHealth(p) === health) : filtered;
  const countH = (h: Health) => filtered.filter((p) => projectHealth(p) === h).length;
  const toggle = (h: Health) => setHealth((cur) => (cur === h ? null : h));

  const totalBudget = filtered.reduce((sum, p) => sum + p.budgetEUR, 0);
  const totalOverdue = filtered.reduce((sum, p) => sum + overdueCount(p), 0);
  const due30 = filtered.reduce((sum, p) => sum + dueWithin(p, 30), 0);

  const usedCountries = Array.from(new Set(live.flatMap((p) => p.countries))).sort();

  return (
    <>
      <PageHeader
        eyebrow={t('nav.portfolio')}
        title={t('portfolio.title')}
        lede={t('portfolio.lede', { projects: filtered.length, budget: money(totalBudget), overdue: totalOverdue, due: due30 })}
      />

      <div className={l.stats}>
        <Stat label={t('health.on_track')} value={countH('on_track')} tone="ok" onClick={() => toggle('on_track')} active={health === 'on_track'} />
        <Stat label={t('health.at_risk')} value={countH('at_risk')} tone="warn" onClick={() => toggle('at_risk')} active={health === 'at_risk'} />
        <Stat label={t('health.off_track')} value={countH('off_track')} tone="risk" onClick={() => toggle('off_track')} active={health === 'off_track'} />
        <Stat label={t('health.not_started')} value={countH('not_started')} tone="neutral" onClick={() => toggle('not_started')} active={health === 'not_started'} />
      </div>

      <div className={l.filters}>
        <FilterSelect label={t('filters.programme')} value={prog} onChange={setProg}>
          <option value="all">{t('filters.allProgrammes')}</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </FilterSelect>
        <FilterSelect label={t('filters.funder')} value={fund} onChange={setFund}>
          <option value="all">{t('filters.allFunders')}</option>
          {funders.map((f) => (
            <option key={f.id} value={f.id}>{f.short}</option>
          ))}
        </FilterSelect>
        <FilterSelect label={t('filters.country')} value={country} onChange={setCountry}>
          <option value="all">{t('filters.allCountries')}</option>
          {usedCountries.map((c) => (
            <option key={c} value={c}>{countries[c][prefs.language]}</option>
          ))}
        </FilterSelect>
        <span className={l.grow} />
        <Segmented
          label={t('portfolio.window')}
          value={win}
          onChange={setWin}
          options={[
            { value: '30', label: '30d' },
            { value: '60', label: '60d' },
            { value: '90', label: '90d' },
          ]}
        />
      </div>

      <Card title={t('portfolio.strip')} meta={t('portfolio.stripMeta', { days: win })} flush className={s.stripCard}>
        {isLoading ? <SkeletonRows rows={6} /> : <DeadlineStrip projects={shown} items={deadlines ?? []} ahead={Number(win)} />}
      </Card>

      <div className={l.split}>
        <Card title={t('portfolio.board')} meta={String(shown.length)} flush>
          {isLoading ? (
            <SkeletonRows rows={8} />
          ) : (
            <div className={s.tableWrap}>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>{t('portfolio.col.project')}</th>
                    <th>{t('portfolio.col.health')}</th>
                    <th>{t('portfolio.col.progress')}</th>
                    <th className={s.num}>{t('portfolio.col.overdue')}</th>
                    <th>{t('portfolio.col.next')}</th>
                    <th>{t('portfolio.col.budget')}</th>
                    <th>{t('portfolio.col.lead')}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((p) => {
                    const h = projectHealth(p);
                    const next = nextDeadline(p);
                    const spent = budgetSpentPct(p);
                    const elapsed = timeElapsedPct(p);
                    const late = overdueCount(p);
                    return (
                      <tr key={p.id}>
                        <td>
                          <Link to={`/projects/${p.id}`} className={s.pcell}>
                            <span className="mono">{p.code}</span>
                            <small>
                              {programme(p.programmeId)?.short} · {p.funderIds.map((f) => funder(f)?.short).join(', ')}
                            </small>
                          </Link>
                        </td>
                        <td><HealthBadge health={h} /></td>
                        <td className={s.bar}>
                          <ProgressBar value={projectProgress(p)} marker={h === 'not_started' ? undefined : elapsed} />
                        </td>
                        <td className={s.num}>
                          <span className={late ? s.lateNum : 'muted'}>{late}</span>
                        </td>
                        <td>{next ? <DueChip due={next.due} /> : <span className="muted">—</span>}</td>
                        <td className={s.bar}>
                          <ProgressBar
                            value={spent}
                            marker={h === 'not_started' ? undefined : elapsed}
                            tone={spent - elapsed > 15 ? 'warn' : 'ok'}
                            label={<span className={`mono ${s.money}`}>{money(p.budgetEUR)}</span>}
                          />
                        </td>
                        <td><Avatar person={person(p.leadId)} size={26} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className={s.note}>{t('portfolio.markerNote')}</p>
            </div>
          )}
        </Card>

        <div className={l.stack}>
          <Card title={t('portfolio.byProgramme')}>
            <ul className={s.breakdown}>
              {programmes
                .map((pg) => ({ pg, list: filtered.filter((p) => p.programmeId === pg.id) }))
                .filter((x) => x.list.length)
                .map(({ pg, list }) => (
                  <li key={pg.id}>
                    <div className={s.bdHead}>
                      <span>{pg.short}</span>
                      <span className="mono">{list.length}</span>
                    </div>
                    <div className={s.stack}>
                      {(['on_track', 'at_risk', 'off_track', 'not_started'] as Health[]).map((h) => {
                        const n = list.filter((p) => projectHealth(p) === h).length;
                        return n ? <i key={h} className={s[h]} style={{ flex: n }} title={`${t(`health.${h}`)}: ${n}`} /> : null;
                      })}
                    </div>
                  </li>
                ))}
            </ul>
          </Card>

          <Card title={t('portfolio.byCountry')}>
            <div className={s.countries}>
              {usedCountries.map((c) => {
                const n = filtered.filter((p) => p.countries.includes(c)).length;
                return (
                  <button key={c} className={country === c ? s.cOn : undefined} onClick={() => setCountry(country === c ? 'all' : c)}>
                    <b className="mono">{c}</b>
                    <span>{countries[c][prefs.language]}</span>
                    <em className="mono">{n}</em>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
