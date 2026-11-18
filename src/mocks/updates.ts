/* MOCK PROGRESS UPDATES: the "what happened this week" notes on each project. */
import type { ProgressUpdate } from '@/types/domain';
import { fromToday as D } from '@/lib/dates';

export const seedUpdates: ProgressUpdate[] = [
  { id: 'up-1', projectId: 'p-dasclim', authorId: 'u-moussa', date: D(-2), summary: 'Bias-corrected the CHIRPS-based forecasts for all three pilot regions; validation against station data running now.', nextSteps: 'Share v1 dataset with WP3 for app prototype.' },
  { id: 'up-2', projectId: 'p-dasclim', authorId: 'u-fatou', date: D(-9), summary: 'Needs-assessment interviews completed in Kaffrine (42 farmers). Tamale transcripts being coded.', blockers: 'Translator for Mooré interviews not yet contracted.' },
  { id: 'up-3', projectId: 'p-nigeria4h2', authorId: 'u-chinedu', date: D(-6), summary: 'LCOH model runs complete for 4 of 6 sites. Waiting on grid-tariff data from the Energy Commission.', blockers: 'Tariff dataset delayed; D2.1 blocked until it arrives.' },
  { id: 'up-4', projectId: 'p-nigeria4h2', authorId: 'u-ama', date: D(-15), summary: 'Agreed outline of the export-corridors policy brief with Jülich team.' },
  { id: 'up-5', projectId: 'p-pv2h', authorId: 'u-ama', date: D(-1), summary: 'Engineering design reviewed with DLR; final drawings due this week. Procurement tender for electrolyser closes in 3 weeks.' },
  { id: 'up-6', projectId: 'p-coins', authorId: 'u-binta', date: D(-38), summary: 'Round 3 platform meetings scheduled; Senegal session moved due to rains.' },
  { id: 'up-7', projectId: 'p-igst', authorId: 'u-mariama', date: D(-4), summary: 'Draft briefs for Ghana and Senegal sent to focal points for review.' },
  { id: 'up-8', projectId: 'p-impegh', authorId: 'u-yao', date: D(-3), summary: 'Semester 1 results ratified by all four lead universities. 58 of 60 students progressing.' },
  { id: 'up-9', projectId: 'p-wise', authorId: 'u-binta', date: D(-1), summary: '312 applications received so far; extension requests from Guinea and Togo under review.' },
  { id: 'up-10', projectId: 'p-tix', authorId: 'u-kossi', date: D(-12), summary: 'Heatwave thresholds recalculated using 1991–2020 baseline for 5 countries.' },
  { id: 'up-11', projectId: 'p-cop31', authorId: 'u-binta', date: D(-5), summary: 'Side event drew ~140 attendees. Photos and press release published.' },
];
