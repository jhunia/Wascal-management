/* ==========================================================================
   MOCK PEOPLE: fictional staff used until the real directory
   (Microsoft Entra ID) is connected. Names are invented on purpose.
   ========================================================================== */
import type { Person } from '@/types/domain';

export const people: Person[] = [
  { id: 'u-ama', name: 'Dr. Ama Owusu', email: 'a.owusu@wascal.org', title: 'Head, Renewable Energy & Green Hydrogen', unit: 'Competence Centre', role: 'programme_head', country: 'BF' },
  { id: 'u-ibrahim', name: 'Prof. Ibrahim Sawadogo', email: 'i.sawadogo@wascal.org', title: 'Director of Research', unit: 'Competence Centre', role: 'executive', country: 'BF' },
  { id: 'u-fatou', name: 'Dr. Fatou Ndiaye', email: 'f.ndiaye@wascal.org', title: 'Senior Scientist, Climate-Smart Agriculture', unit: 'Competence Centre', role: 'lead', country: 'SN' },
  { id: 'u-kwame', name: 'Kwame Asante', email: 'k.asante@wascal.org', title: 'Grants & Finance Officer', unit: 'Finance', role: 'finance', country: 'GH' },
  { id: 'u-aissata', name: 'Dr. Aïssata Traoré', email: 'a.traore@wascal.org', title: 'Land Use Scientist', unit: 'Competence Centre', role: 'lead', country: 'ML' },
  { id: 'u-chinedu', name: 'Dr. Chinedu Okafor', email: 'c.okafor@wascal.org', title: 'Energy Systems Researcher', unit: 'Competence Centre', role: 'lead', country: 'NG' },
  { id: 'u-esi', name: 'Esi Boateng', email: 'e.boateng@wascal.org', title: 'Research Assistant', unit: 'HQ Accra', role: 'member', country: 'GH' },
  { id: 'u-moussa', name: 'Moussa Diallo', email: 'm.diallo@wascal.org', title: 'GIS & Remote Sensing Analyst', unit: 'Competence Centre', role: 'member', country: 'GN' },
  { id: 'u-adjoa', name: 'Prof. Adjoa Mensah', email: 'a.mensah@wascal.org', title: 'Director, Capacity Building', unit: 'HQ Accra', role: 'executive', country: 'GH' },
  { id: 'u-yao', name: 'Dr. Yao Kouassi', email: 'y.kouassi@wascal.org', title: 'Coordinator, IMP-EGH', unit: 'Graduate Programme', role: 'programme_head', country: 'CI' },
  { id: 'u-binta', name: 'Binta Jallow', email: 'b.jallow@wascal.org', title: 'Communications Officer', unit: 'HQ Accra', role: 'member', country: 'GM' },
  { id: 'u-kossi', name: 'Kossi Agbeko', email: 'k.agbeko@wascal.org', title: 'Data Manager, WADI', unit: 'ICT', role: 'admin', country: 'TG' },
  { id: 'u-mariama', name: 'Dr. Mariama Sesay', email: 'm.sesay@wascal.org', title: 'Disaster Risk Scientist', unit: 'Competence Centre', role: 'lead', country: 'SL' },
  { id: 'u-joao', name: 'João Tavares', email: 'j.tavares@wascal.org', title: 'Marine Science Associate', unit: 'Graduate Programme', role: 'member', country: 'CV' },
];

export const personById = (id: string) => people.find((p) => p.id === id);
