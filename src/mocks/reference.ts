/* ==========================================================================
   MOCK REFERENCE DATA: funders, programmes, countries.
   In production these become admin-editable lists.
   ========================================================================== */
import type { CountryCode, Funder, Programme } from '@/types/domain';

export const funders: Funder[] = [
  { id: 'f-bmftr', name: 'German Federal Ministry of Research, Technology and Space', short: 'BMFTR' },
  { id: 'f-cs4rra', name: 'CS4RRA Joint Call', short: 'CS4RRA' },
  { id: 'f-ecowas', name: 'ECOWAS Commission', short: 'ECOWAS' },
  { id: 'f-giz', name: 'Deutsche Gesellschaft für Internationale Zusammenarbeit', short: 'GIZ' },
  { id: 'f-wb', name: 'World Bank', short: 'World Bank' },
];

export const programmes: Programme[] = [
  { id: 'pr-land', name: 'Land Use Systems & Nature-Based Solutions', short: 'Land Use', kind: 'research' },
  { id: 'pr-ews', name: 'Risks, Early Warning & Anticipatory Action', short: 'Early Warning', kind: 'research' },
  { id: 'pr-csa', name: 'Climate-Smart Agriculture & Food Security', short: 'Agriculture', kind: 'research' },
  { id: 'pr-h2', name: 'Renewable Energy & Green Hydrogen', short: 'Energy & H₂', kind: 'research' },
  { id: 'pr-gsp', name: 'Graduate Studies Programme', short: 'Graduate', kind: 'graduate' },
  { id: 'pr-cicles', name: 'Climate & Environmental Services (CICLES)', short: 'CICLES', kind: 'service' },
  { id: 'pr-events', name: 'Events & Calls', short: 'Events', kind: 'event' },
];

export const countries: Record<CountryCode, { en: string; fr: string }> = {
  BJ: { en: 'Benin', fr: 'Bénin' },
  BF: { en: 'Burkina Faso', fr: 'Burkina Faso' },
  CV: { en: 'Cabo Verde', fr: 'Cap-Vert' },
  CI: { en: "Côte d'Ivoire", fr: "Côte d'Ivoire" },
  GM: { en: 'The Gambia', fr: 'Gambie' },
  GH: { en: 'Ghana', fr: 'Ghana' },
  GN: { en: 'Guinea', fr: 'Guinée' },
  ML: { en: 'Mali', fr: 'Mali' },
  NE: { en: 'Niger', fr: 'Niger' },
  NG: { en: 'Nigeria', fr: 'Nigéria' },
  SN: { en: 'Senegal', fr: 'Sénégal' },
  SL: { en: 'Sierra Leone', fr: 'Sierra Leone' },
  TG: { en: 'Togo', fr: 'Togo' },
  DE: { en: 'Germany', fr: 'Allemagne' },
};
