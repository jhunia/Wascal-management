/* ==========================================================================
   MOCK PROJECTS: realistic WASCAL-style portfolio.
   Project names follow real WASCAL programmes (wascal.org); all dates,
   budgets, people and deliverables are INVENTED for the prototype.

   Dates are written as offsets from today (D(-10) = 10 days ago,
   D(14) = in two weeks) so the demo always has live deadlines.

   To add a project: copy one block below and change the values.
   ========================================================================== */
import type { Deliverable, DeliverableType, ItemStatus, Project, ReportObligation, WorkPackage } from '@/types/domain';
import { fromToday as D } from '@/lib/dates';

// ---- tiny builders so each project stays readable ------------------------
let seq = 0;
const id = (prefix: string) => `${prefix}-${++seq}`;

function wp(code: string, title: string, leadId: string, start: number, end: number): WorkPackage {
  return { id: id('wp'), code, title, leadId, start: D(start), end: D(end) };
}

function dl(
  code: string,
  title: string,
  type: DeliverableType,
  w: WorkPackage,
  ownerId: string,
  due: number,
  status: ItemStatus,
  progress: number,
  isMilestone = false,
): Deliverable {
  return {
    id: id('dl'),
    code,
    title,
    type,
    workPackageId: w.id,
    ownerId,
    due: D(due),
    status,
    progress,
    isMilestone,
    completedOn: status === 'done' ? D(due - 2) : undefined,
  };
}

function rp(title: string, kind: ReportObligation['kind'], ownerId: string, due: number, status: ItemStatus): ReportObligation {
  return { id: id('rp'), title, kind, ownerId, due: D(due), status };
}

// ---- projects -----------------------------------------------------------

function dasClim(): Project {
  const w1 = wp('WP1', 'Co-design with farmer organisations', 'u-fatou', -220, 60);
  const w2 = wp('WP2', 'Seasonal forecast downscaling', 'u-moussa', -180, 240);
  const w3 = wp('WP3', 'Advisory service pilots', 'u-fatou', -30, 420);
  return {
    id: 'p-dasclim',
    code: 'DAS-CLIM',
    title: 'Digital Advisory Services for Climate Resilience',
    summary: 'Co-developing digital climate advisories with smallholder farmers in Ghana, Senegal and Burkina Faso. Funded under the CS4RRA joint call.',
    programmeId: 'pr-csa',
    funderIds: ['f-cs4rra', 'f-bmftr'],
    leadId: 'u-fatou',
    teamIds: ['u-fatou', 'u-moussa', 'u-esi', 'u-kwame', 'u-ama'],
    countries: ['GH', 'SN', 'BF'],
    partners: ['University of Ghana', 'ISRA Senegal', 'University of Würzburg'],
    start: D(-220),
    end: D(510),
    status: 'active',
    budgetEUR: 2_000_000,
    spentEUR: 540_000,
    workPackages: [w1, w2, w3],
    deliverables: [
      dl('D1.1', 'Stakeholder mapping report', 'report', w1, 'u-esi', -150, 'done', 100),
      dl('D1.2', 'Co-design workshop: Tamale', 'workshop', w1, 'u-fatou', -40, 'done', 100, true),
      dl('D1.3', 'Farmer needs assessment synthesis', 'report', w1, 'u-fatou', 12, 'in_progress', 70),
      dl('D2.1', 'Downscaled seasonal forecast dataset v1', 'dataset', w2, 'u-moussa', 5, 'in_progress', 85),
      dl('D2.2', 'Forecast skill evaluation', 'publication', w2, 'u-moussa', 95, 'not_started', 0),
      dl('D3.1', 'Pilot advisory app (SMS + voice)', 'software', w3, 'u-ama', 160, 'not_started', 5, true),
    ],
    reports: [
      rp('Interim technical report Y1', 'technical', 'u-fatou', 26, 'in_progress'),
      rp('Financial statement Y1', 'financial', 'u-kwame', 26, 'not_started'),
    ],
  };
}

function nigeria4h2(): Project {
  const w1 = wp('WP1', 'Resource & demand assessment', 'u-chinedu', -300, -60);
  const w2 = wp('WP2', 'Techno-economic modelling', 'u-chinedu', -150, 90);
  const w3 = wp('WP3', 'Policy dialogue', 'u-ama', -20, 150);
  return {
    id: 'p-nigeria4h2',
    code: 'NIGERIA4H2',
    title: 'Green Hydrogen Potential Study for Nigeria',
    summary: 'Assessing renewable-powered hydrogen production, demand and export pathways for Nigeria, feeding the national hydrogen strategy.',
    programmeId: 'pr-h2',
    funderIds: ['f-bmftr'],
    leadId: 'u-chinedu',
    teamIds: ['u-chinedu', 'u-ama', 'u-kwame', 'u-esi'],
    countries: ['NG', 'DE'],
    partners: ['Forschungszentrum Jülich', 'FUT Minna', 'Energy Commission of Nigeria'],
    start: D(-300),
    end: D(180),
    status: 'active',
    budgetEUR: 850_000,
    spentEUR: 640_000,
    workPackages: [w1, w2, w3],
    deliverables: [
      dl('D1.1', 'Solar & wind resource atlas for Nigeria', 'dataset', w1, 'u-chinedu', -90, 'done', 100),
      dl('D1.2', 'Hydrogen demand scenarios 2030–2050', 'report', w1, 'u-chinedu', -45, 'done', 100, true),
      dl('D2.1', 'LCOH model and dashboard', 'model', w2, 'u-chinedu', -12, 'blocked', 60),
      dl('D2.2', 'Water-energy nexus assessment', 'report', w2, 'u-ama', -4, 'in_progress', 45),
      dl('D3.1', 'Policy brief: H₂ export corridors', 'policy_brief', w3, 'u-ama', 21, 'in_progress', 30),
      dl('D3.2', 'National stakeholder validation workshop', 'workshop', w3, 'u-ama', 70, 'not_started', 0, true),
    ],
    reports: [
      rp('Mid-term technical report', 'technical', 'u-chinedu', -9, 'in_progress'),
      rp('Mid-term financial report', 'financial', 'u-kwame', -9, 'submitted'),
    ],
  };
}

function pv2h(): Project {
  const w1 = wp('WP1', 'Test-bed design', 'u-ama', -120, 30);
  const w2 = wp('WP2', 'Electrolyser field trials', 'u-chinedu', 10, 300);
  return {
    id: 'p-pv2h',
    code: 'PV2H',
    title: 'Photovoltaic-to-Hydrogen Demonstrator',
    summary: 'A pilot PV-powered electrolysis test-bed in Ouagadougou to measure real-world hydrogen yield under Sahelian conditions.',
    programmeId: 'pr-h2',
    funderIds: ['f-bmftr', 'f-giz'],
    leadId: 'u-ama',
    teamIds: ['u-ama', 'u-chinedu', 'u-kossi', 'u-kwame'],
    countries: ['BF', 'DE'],
    partners: ['Université Joseph Ki-Zerbo', 'DLR'],
    start: D(-120),
    end: D(420),
    status: 'active',
    budgetEUR: 1_200_000,
    spentEUR: 210_000,
    workPackages: [w1, w2],
    deliverables: [
      dl('D1.1', 'Site assessment & permits', 'report', w1, 'u-ama', -60, 'done', 100),
      dl('D1.2', 'Test-bed engineering design', 'report', w1, 'u-ama', 3, 'in_progress', 90, true),
      dl('D1.3', 'Equipment procurement complete', 'other', w1, 'u-kwame', 28, 'in_progress', 40, true),
      dl('D2.1', 'Monitoring data pipeline into WADI', 'software', w2, 'u-kossi', 75, 'not_started', 0),
      dl('D2.2', 'First 3-month yield report', 'report', w2, 'u-chinedu', 190, 'not_started', 0),
    ],
    reports: [rp('Annual technical report', 'technical', 'u-ama', 48, 'not_started')],
  };
}

function coins(): Project {
  const w1 = wp('WP1', 'Innovation platforms', 'u-aissata', -400, 30);
  const w2 = wp('WP2', 'Sustainable land management trials', 'u-aissata', -350, 200);
  return {
    id: 'p-coins',
    code: 'COINS',
    title: 'Co-developing Innovations for Sustainable Land Management',
    summary: 'Multi-stakeholder innovation platforms in Ghana and Senegal testing land management practices on degraded farmland.',
    programmeId: 'pr-land',
    funderIds: ['f-bmftr'],
    leadId: 'u-aissata',
    teamIds: ['u-aissata', 'u-moussa', 'u-fatou', 'u-binta'],
    countries: ['GH', 'SN'],
    partners: ['KNUST', 'UCAD', 'University of Bonn'],
    start: D(-400),
    end: D(330),
    status: 'active',
    budgetEUR: 1_450_000,
    spentEUR: 1_010_000,
    workPackages: [w1, w2],
    deliverables: [
      dl('D1.1', 'Platform charter & governance', 'report', w1, 'u-aissata', -300, 'done', 100),
      dl('D1.2', 'Platform meetings round 3', 'workshop', w1, 'u-binta', -6, 'in_progress', 75, true),
      dl('D2.1', 'Soil baseline dataset', 'dataset', w2, 'u-moussa', -200, 'done', 100),
      dl('D2.2', 'Trial season 2 results', 'report', w2, 'u-aissata', 40, 'in_progress', 35),
      dl('D2.3', 'Land degradation map (10 m)', 'dataset', w2, 'u-moussa', 15, 'in_progress', 60),
    ],
    reports: [rp('Annual technical report Y2', 'technical', 'u-aissata', 34, 'not_started')],
  };
}

function declare(): Project {
  const w1 = wp('WP1', 'Decision-support toolkit', 'u-moussa', -90, 260);
  return {
    id: 'p-declare',
    code: 'DECLARE',
    title: 'Decision Support for Strengthening Land Resilience',
    summary: 'Building a decision-support toolkit that combines land-use scenarios with climate risk for district planners in Benin and Ghana.',
    programmeId: 'pr-land',
    funderIds: ['f-bmftr'],
    leadId: 'u-aissata',
    teamIds: ['u-aissata', 'u-moussa', 'u-kossi'],
    countries: ['BJ', 'GH'],
    partners: ['Université d’Abomey-Calavi', 'University of Augsburg'],
    start: D(-90),
    end: D(640),
    status: 'active',
    budgetEUR: 980_000,
    spentEUR: 260_000,
    workPackages: [w1],
    deliverables: [
      dl('D1.1', 'User requirements (district planners)', 'report', w1, 'u-moussa', -2, 'in_progress', 80),
      dl('D1.2', 'Toolkit prototype', 'software', w1, 'u-kossi', 120, 'not_started', 0, true),
    ],
    reports: [rp('Inception report', 'technical', 'u-aissata', 9, 'in_progress')],
  };
}

function igst(): Project {
  const w1 = wp('WP1', 'Regional stocktake synthesis', 'u-mariama', -160, 120);
  return {
    id: 'p-igst',
    code: 'iGST-WA',
    title: 'Independent Global Stocktake: West Africa Hub',
    summary: 'Regional hub supplying independent evidence on climate action progress to the UNFCCC Global Stocktake process.',
    programmeId: 'pr-ews',
    funderIds: ['f-ecowas'],
    leadId: 'u-mariama',
    teamIds: ['u-mariama', 'u-binta', 'u-esi'],
    countries: ['GH', 'SN', 'SL', 'NE'],
    partners: ['ClimateWorks', 'ECOWAS Commission'],
    start: D(-160),
    end: D(200),
    status: 'active',
    budgetEUR: 420_000,
    spentEUR: 150_000,
    workPackages: [w1],
    deliverables: [
      dl('D1.1', 'Country NDC progress briefs (x4)', 'policy_brief', w1, 'u-mariama', 18, 'in_progress', 50),
      dl('D1.2', 'Regional synthesis report', 'report', w1, 'u-mariama', 100, 'not_started', 0, true),
    ],
    reports: [rp('Quarterly progress note', 'technical', 'u-mariama', 6, 'in_progress')],
  };
}

function impEgh(): Project {
  const w1 = wp('WP1', 'Admissions', 'u-yao', -260, -120);
  const w2 = wp('WP2', 'Semester 1–2 coursework', 'u-yao', -120, 140);
  const w3 = wp('WP3', 'Germany research stay', 'u-yao', 140, 320);
  return {
    id: 'p-impegh',
    code: 'IMP-EGH-C4',
    title: 'International Master’s in Energy & Green Hydrogen, Cohort 4',
    summary: 'Fourth intake of the double-degree master’s programme across Niger, Togo, Côte d’Ivoire and Nigeria lead universities.',
    programmeId: 'pr-gsp',
    funderIds: ['f-bmftr'],
    leadId: 'u-yao',
    teamIds: ['u-yao', 'u-adjoa', 'u-kwame', 'u-joao'],
    countries: ['NE', 'TG', 'CI', 'NG', 'DE'],
    partners: ['Université Abdou Moumouni', 'Université de Lomé', 'UFHB', 'FUT Minna', 'University of Rostock'],
    start: D(-260),
    end: D(470),
    status: 'active',
    budgetEUR: 1_600_000,
    spentEUR: 700_000,
    workPackages: [w1, w2, w3],
    deliverables: [
      dl('M1', '60 students enrolled', 'training', w1, 'u-yao', -130, 'done', 100, true),
      dl('M2', 'Semester 1 results ratified', 'report', w2, 'u-yao', -10, 'done', 100, true),
      dl('M3', 'Thesis topics approved', 'other', w2, 'u-yao', 30, 'in_progress', 55, true),
      dl('M4', 'Visa & travel for Germany stay', 'other', w3, 'u-joao', 110, 'not_started', 0),
    ],
    reports: [rp('Annual programme report to BMFTR', 'technical', 'u-adjoa', 55, 'not_started')],
  };
}

function wise(): Project {
  const w1 = wp('WP1', 'Call & evaluation', 'u-binta', -40, 45);
  return {
    id: 'p-wise',
    code: 'WISE-2026',
    title: 'WASCAL Innovative Ideas Competition for Sustainable Energy',
    summary: 'Open call for youth-led sustainable energy ideas across member states; evaluation, pitch day and seed grants.',
    programmeId: 'pr-events',
    funderIds: ['f-giz'],
    leadId: 'u-ama',
    teamIds: ['u-ama', 'u-binta', 'u-esi'],
    countries: ['GH', 'BF', 'SN', 'NG', 'TG'],
    partners: [],
    start: D(-40),
    end: D(90),
    status: 'active',
    budgetEUR: 120_000,
    spentEUR: 30_000,
    workPackages: [w1],
    deliverables: [
      dl('E1', 'Call published', 'other', w1, 'u-binta', -35, 'done', 100, true),
      dl('E2', 'Applications close', 'other', w1, 'u-binta', 1, 'in_progress', 95, true),
      dl('E3', 'Evaluation panel scores', 'report', w1, 'u-ama', 14, 'not_started', 0),
      dl('E4', 'Pitch day in Accra', 'workshop', w1, 'u-esi', 40, 'not_started', 0, true),
    ],
    reports: [],
  };
}

function ciclesTix(): Project {
  const w1 = wp('WP1', 'Extreme-event bulletin service', 'u-mariama', -500, 230);
  return {
    id: 'p-tix',
    code: 'CICLES-TIX',
    title: 'Timely Information on Climate Extremes (TIX)',
    summary: 'Operational bulletin service warning national met agencies of heatwaves, heavy rainfall and dry spells.',
    programmeId: 'pr-cicles',
    funderIds: ['f-bmftr', 'f-wb'],
    leadId: 'u-mariama',
    teamIds: ['u-mariama', 'u-kossi', 'u-moussa'],
    countries: ['BF', 'GH', 'ML', 'NE', 'SN'],
    partners: ['ACMAD', 'GMet', 'Météo Burkina'],
    start: D(-500),
    end: D(230),
    status: 'active',
    budgetEUR: 700_000,
    spentEUR: 470_000,
    workPackages: [w1],
    deliverables: [
      dl('S1', 'Rainy-season bulletin series', 'report', w1, 'u-mariama', -20, 'done', 100),
      dl('S2', 'Heatwave alert threshold review', 'report', w1, 'u-kossi', 8, 'in_progress', 65),
      dl('S3', 'User satisfaction survey', 'report', w1, 'u-moussa', 60, 'not_started', 0),
    ],
    reports: [rp('Service performance report', 'technical', 'u-mariama', 20, 'not_started')],
  };
}

function cop31(): Project {
  const w1 = wp('WP1', 'Side event & pavilion', 'u-binta', -60, 5);
  return {
    id: 'p-cop31',
    code: 'COP31-SE',
    title: 'COP31 Side Event: Climate & Energy Solutions',
    summary: 'WASCAL side event and partnership meetings at COP31.',
    programmeId: 'pr-events',
    funderIds: ['f-bmftr'],
    leadId: 'u-binta',
    teamIds: ['u-binta', 'u-ibrahim', 'u-ama'],
    countries: ['GH'],
    partners: [],
    start: D(-60),
    end: D(20),
    status: 'closing',
    budgetEUR: 45_000,
    spentEUR: 41_000,
    workPackages: [w1],
    deliverables: [
      dl('E1', 'Side event held', 'workshop', w1, 'u-binta', -8, 'done', 100, true),
      dl('E2', 'Press release & photo set', 'other', w1, 'u-binta', -5, 'done', 100),
      dl('E3', 'Partnership follow-up list', 'report', w1, 'u-ibrahim', 4, 'in_progress', 50),
    ],
    reports: [rp('Event closure & expense report', 'financial', 'u-kwame', 15, 'not_started')],
  };
}

function h2Sahel(): Project {
  const w1 = wp('WP1', 'Inception', 'u-ama', 45, 135);
  return {
    id: 'p-h2sahel',
    code: 'H2-SAHEL',
    title: 'Hydrogen Valleys for the Sahel (proposal stage)',
    summary: 'Planned follow-on project scoping hydrogen valley sites in Niger, Mali and Burkina Faso.',
    programmeId: 'pr-h2',
    funderIds: ['f-bmftr'],
    leadId: 'u-ama',
    teamIds: ['u-ama', 'u-chinedu'],
    countries: ['NE', 'ML', 'BF'],
    partners: ['Université Abdou Moumouni'],
    start: D(45),
    end: D(800),
    status: 'planned',
    budgetEUR: 2_400_000,
    spentEUR: 0,
    workPackages: [w1],
    deliverables: [dl('D1.1', 'Inception report', 'report', w1, 'u-ama', 120, 'not_started', 0, true)],
    reports: [],
  };
}

/** The whole mock portfolio. Order = default sort on the Projects page. */
export function buildProjects(): Project[] {
  seq = 0;
  return [dasClim(), nigeria4h2(), pv2h(), coins(), declare(), igst(), impEgh(), wise(), ciclesTix(), cop31(), h2Sahel()];
}
