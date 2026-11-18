# WASCAL Project Tracker: frontend prototype

An internal web app for WASCAL that tracks projects, deliverables, milestones and funder reports, and **warns people before deadlines are missed**. It works on laptops and phones and can be installed on a phone like an app (PWA).

> **Status: frontend MVP with mock data.** Every screen works and is clickable, but the data comes from fake files inside the app (`src/mocks/`), not a server. Sign-in is simulated. The plan is to finish the look and feel first, then plug in a real backend (see [§11](#11-connecting-the-real-backend-later)).

---

## Contents

1. [Run it](#1-run-it)
2. [Tech stack: what each tool does](#2-tech-stack-what-each-tool-does)
3. [Folder map: where everything is](#3-folder-map-where-everything-is)
4. [How a screen gets its data](#4-how-a-screen-gets-its-data)
5. [Screens → files](#5-screens--files)
6. [The design system (colours, fonts, components)](#6-the-design-system)
7. [Business rules: health and alerts](#7-business-rules-health-and-alerts)
8. [Translations (English / French)](#8-translations-english--french)
9. [Mock data](#9-mock-data)
10. [How to… (common changes, step by step)](#10-how-to-common-changes-step-by-step)
11. [Connecting the real backend later](#11-connecting-the-real-backend-later)
12. [Build, install on phone, deploy](#12-build-install-on-phone-deploy)
13. [Troubleshooting](#13-troubleshooting)
14. [Glossary](#14-glossary)

---

## 1. Run it

Needs **Node.js 20 or newer** (`node -v` to check).

```bash
npm install        # first time only: downloads the libraries into node_modules/
npm run dev        # starts the app at http://localhost:5180 with live reload
```

Open http://localhost:5180. On the sign-in screen, either type any `something@wascal.org` address or click one of the **demo personas** to see the app as a different role.

| Command | What it does |
|---|---|
| `npm run dev` | Development server. Saving any file updates the browser instantly. |
| `npm run typecheck` | Checks the whole codebase for type errors without building. Run it after big changes. |
| `npm run build` | Type-checks, then produces the production site in `dist/`. |
| `npm run preview` | Serves the built `dist/` folder, to test the real build (including offline/PWA). |

**Your demo changes are saved in the browser.** Updates you post and alerts you mark as read live in the browser's localStorage. To start fresh: **Settings → Prototype tools → Reset demo data**.

---

## 2. Tech stack: what each tool does

| Tool | Version | Job in this app | Docs |
|---|---|---|---|
| **React** | 18 | Builds the UI out of components (functions that return HTML-like JSX). | react.dev |
| **TypeScript** | 5.6 | JavaScript with types. Catches mistakes like a misspelled field or a missing prop before you run the app. | typescriptlang.org |
| **Vite** | 5 | Dev server + build tool. Config in `vite.config.ts`. | vitejs.dev |
| **React Router** | 6 | Maps URLs to screens. All routes are in `src/routes.tsx`. | reactrouter.com |
| **TanStack Query** | 5 | Loads data, shows loading states, caches results and refreshes after changes. Used through `src/api/hooks.ts`. | tanstack.com/query |
| **CSS Modules** | (built into Vite) | Each component has its own `Something.module.css`. Class names are scoped automatically, so styles never leak between components. | |
| **CSS variables (design tokens)** | | Every colour, size and font is defined once in `src/styles/tokens.css`. | |
| **i18next / react-i18next** | 23 / 15 | English and French text. Words live in `src/i18n/en.json` and `fr.json`. | react.i18next.com |
| **date-fns** | 4 | Date maths and formatting ("in 5 days", "12 Dec 2026"). Wrapped in `src/lib/dates.ts`. | date-fns.org |
| **Phosphor Icons** | 2 | Icons. Browse them at phosphoricons.com and use them as `<Bell size={20} weight="duotone" />`. | phosphoricons.com |
| **Fontsource** | 5 | Bundles the **Inter** font (the WASCAL website's typeface) into the app, so it works offline and needs no Google request. | fontsource.org |
| **vite-plugin-pwa** | 0.21 | Makes the app installable on phones and cached for offline use. | vite-pwa-org.netlify.app |

**No UI library** (no Tailwind, MUI, Bootstrap or shadcn) on purpose. Every visual piece is in `src/ui/` or next to its screen, so you can read and change all of it.

---

## 3. Folder map: where everything is

```
WASCAL-tracker/
├── index.html               The one HTML page. React mounts into <div id="root">.
├── vite.config.ts           Dev server port (5180), "@/..." import shortcut, PWA settings (app name, colours).
├── tsconfig.json            TypeScript settings. Rarely needs touching.
├── package.json             Library list + npm scripts (dev, build, …).
├── public/
│   ├── wascal-logo.png      The official WASCAL logo (same file as the website). Sidebar, sign-in, printed reports.
│   ├── favicon.png          App icon (browser tab + phone home screen), from the website.
│   └── images/station.jpg   Field photo behind the sign-in screen (from the website).
└── src/
    ├── main.tsx             ENTRY POINT. Loads fonts + global CSS + translations, renders <App/>.
    ├── App.tsx              Wraps the app in "providers": data cache, preferences, sign-in, router.
    ├── routes.tsx           ★ URL → screen table. Add new pages here.
    │
    ├── types/
    │   └── domain.ts        ★ The data shapes: Project, Deliverable, Update, Alert, Person…
    │
    ├── styles/
    │   ├── tokens.css       ★ DESIGN TOKENS: WASCAL website colours, Inter, spacing, radius, light + dark theme.
    │   └── global.css       Page reset, link/heading defaults, helper classes (.mono, .eyebrow), print rules.
    │
    ├── ui/                  ★ THE COMPONENT KIT (reusable pieces, no business logic)
    │   ├── index.ts         Re-exports everything, so you write: import { Button, Card } from '@/ui'
    │   ├── Button.tsx       Button + ButtonLink (primary blue / accent ochre / secondary / ghost / danger)
    │   ├── Signals.tsx      HealthBadge (tinted pill), StatusPill, DueChip ("4 days late", "In 3 days", "12 Dec")
    │   ├── Surface.tsx      PageHeader (deep-blue banner), Card, Stat tile, EmptyState, Skeleton loaders, Tag
    │   ├── Bits.tsx         Avatar, AvatarStack, ProgressBar (with time marker), Segmented switch
    │   ├── Sheet.tsx        Slide-in panel (right on laptop, bottom sheet on phone)
    │   └── Field.tsx        Form field wrapper + TextInput, TextArea, Select, FilterSelect
    │
    ├── layout/
    │   ├── AppShell.tsx     The frame: white sidebar with WASCAL logo (laptop), top bar, bottom tab bar + "More" (phone)
    │   ├── nav.ts           ★ Menu items: label, icon, URL, who can see it, shown on phone?
    │   └── Composer.tsx     Lets any screen open the "Post update" sheet: useComposer().openComposer()
    │
    ├── features/            ★ THE SCREENS, one folder per area
    │   ├── auth/            Sign-in screen
    │   ├── mywork/          My Work (home)
    │   ├── portfolio/       Portfolio dashboard (management view)
    │   ├── projects/        Projects list, Project detail, Gantt, and tabs/ (one file per tab)
    │   ├── calendar/        Deadlines calendar
    │   ├── alerts/          Alerts centre
    │   ├── reports/         Printable project status report + portfolio summary + CSV export
    │   ├── settings/        Settings + Admin
    │   ├── updates/         The "Post update" sheet
    │   ├── shared/          Pieces used by several screens:
    │   │   ├── DeadlineLedger.tsx   Grouped deadline list (Overdue / This week / …)
    │   │   ├── DeadlineStrip.tsx    The "deadline radar" timeline on Portfolio
    │   │   ├── ProjectCard.tsx      Project summary card
    │   │   └── layout.module.css    Shared grids: stat row, main+side split, filter bar
    │   └── NotFoundPage.tsx
    │
    ├── api/                 ★ DATA LAYER: the only place screens get data from
    │   ├── hooks.ts         useProjects(), useProject(id), useDeadlines(), useAlerts(), usePostUpdate()…
    │   ├── endpoints.ts     The functions behind the hooks. TODAY: read mock data. LATER: call the server.
    │   └── db.ts            Fake in-browser database (mock data + your saved changes). Deleted later.
    │
    ├── mocks/               FAKE DATA (deleted when the backend exists)
    │   ├── projects.ts      11 WASCAL-style projects with work packages, deliverables, reports
    │   ├── people.ts        14 fictional staff
    │   ├── reference.ts     Funders, programmes, countries (EN/FR names)
    │   └── updates.ts       Sample progress updates
    │
    ├── lib/                 PLAIN HELPER FUNCTIONS (no UI)
    │   ├── health.ts        ★ Health rules (green/amber/red), progress, budget burn, deadline lists
    │   ├── dates.ts         Days-until, "in 5 days", date formats, urgency buckets
    │   └── cx.ts            cx() to join class names, money() "€1.2M", initials() "AO"
    │
    ├── auth/
    │   ├── AuthContext.tsx  Who is signed in. Mock today; Microsoft sign-in (MSAL) later.
    │   └── RequireAuth.tsx  Redirects to /sign-in if not signed in.
    │
    ├── settings/
    │   └── PrefsContext.tsx Theme (light/dark/system), language, notification prefs (saved in browser).
    │
    └── i18n/
        ├── index.ts         Sets up translations; picks the saved language on start.
        ├── en.json          ★ All English interface text
        └── fr.json          ★ All French interface text
```

★ = the files you'll most likely edit.

**Rule of thumb:** *looks* → `src/ui/` or the screen's `.module.css` · *words* → `src/i18n/*.json` · *rules/maths* → `src/lib/` · *data* → `src/mocks/` (now) or `src/api/` (later) · *new page* → `src/features/` + `src/routes.tsx`.

---

## 4. How a screen gets its data

```
 Screen (e.g. MyWorkPage.tsx)
   │  const { data, isLoading } = useDeadlines();
   ▼
 src/api/hooks.ts      useDeadlines() → TanStack Query (caching, loading state)
   │
   ▼
 src/api/endpoints.ts  getDeadlines()  ← TODAY reads db.ts, LATER fetch('/api/deadlines')
   │
   ▼
 src/api/db.ts  →  src/mocks/*.ts  (+ your changes saved in localStorage)
```

**Screens never import from `mocks/` or `db.ts`.** They only use hooks from `@/api/hooks`. That's what makes the backend swap painless: only `endpoints.ts` changes.

**Changing data** (e.g. posting an update) goes through a *mutation* hook: `usePostUpdate().mutateAsync({...})`. When it succeeds, the hook tells TanStack Query to refresh anything that might have changed (projects, deadlines, alerts), so every screen updates by itself.

**Calculated values** (health colour, % progress, overdue count) are *not stored*. They are computed from the data by the functions in `src/lib/health.ts`.

---

## 5. Screens → files

| Screen | URL | Main file | What's on it |
|---|---|---|---|
| Sign-in | `/sign-in` | `features/auth/SignInPage.tsx` | Email box (only `@wascal.org`), demo personas, EN/FR switch |
| My Work | `/my-work` | `features/mywork/MyWorkPage.tsx` | Greeting, 4 clickable tiles, my deadlines grouped by urgency, my projects, latest updates |
| Portfolio | `/portfolio` | `features/portfolio/DashboardPage.tsx` | Health tiles, filters, **deadline radar** (`shared/DeadlineStrip.tsx`), health board table, by programme / by country |
| Projects | `/projects` | `features/projects/ProjectsPage.tsx` | Search, filters, status tabs, grid of `ProjectCard`s |
| Project detail | `/projects/:id/:tab` | `features/projects/ProjectDetailPage.tsx` | Header + tabs. Each tab is a file in `features/projects/tabs/` |
| ↳ Overview | `…/overview` | `tabs/OverviewTab.tsx` | Progress / time / budget / overdue tiles, what's next, work packages, latest news |
| ↳ Timeline | `…/timeline` | `tabs/TimelineTab.tsx` → `Gantt.tsx` | Gantt chart of work packages with deliverable/milestone/report markers |
| ↳ Deliverables | `…/deliverables` | `tabs/DeliverablesTab.tsx` | Every dated item, filter by work package |
| ↳ Updates | `…/updates` | `tabs/UpdatesTab.tsx` | Progress diary (newest first) |
| ↳ Funder reports | `…/reports` | `tabs/ReportsTab.tsx` | Technical/financial/final reports due to funders |
| ↳ Team | `…/team` | `tabs/TeamTab.tsx` | Staff, partners, countries |
| Calendar | `/calendar` | `features/calendar/CalendarPage.tsx` | Month grid (laptop) / agenda list (phone) |
| Alerts | `/alerts` | `features/alerts/AlertsPage.tsx` | Escalations, overdue, reports due, due soon, stale projects |
| Reports | `/reports?kind=…&project=…` | `features/reports/ReportsPage.tsx` | Printable status report or portfolio summary; Print/PDF; CSV |
| Settings | `/settings` | `features/settings/SettingsPage.tsx` | Language, theme, notification channels, reminder days, prototype tools |
| Admin | `/admin` | `features/settings/AdminPage.tsx` | Users & roles, alert rules (admins/executives only) |
| Post update | (sheet, any page) | `features/updates/PostUpdateSheet.tsx` | Project → deliverable → % slider → summary / blockers / next steps |

The **frame** around all screens (sidebar, top bar, phone tab bar) is `layout/AppShell.tsx`.

---

## 6. The design system

### Look & feel
**The tracker uses the WASCAL website's design** (the redesign in `D:\WASCAL`), so staff feel they're in the same family:
- **Colours:** WASCAL blue `#1b539b`, deep blue `#0f2e57`, ochre accent `#e0a33a`, cool-grey page background `#f4f6f9`, white cards. These are the exact values from the website's `global.css`.
- **Font:** **Inter** only, like the website. Dates and numbers use Inter's *tabular figures* (class `mono`), so columns of numbers line up.
- **Real brand assets:** the official WASCAL logo in the sidebar, on sign-in and on printed reports; the website's favicon; a WASCAL field photo on sign-in.
- **Deep-blue page banners** with an ochre label on top of every screen, mirroring the website's page banners (`PageHeader` in `src/ui/Surface.tsx`).
- **Ochre = the one main action** on a screen ("Post update", "Print"). Blue = normal primary buttons and links.
- **Calm by default, loud when it matters:** only overdue items (red) and items due this week (ochre) get coloured pills. Everything later is plain text.

**Banners re-colour what's inside them.** Inside `PageHeader`, the colour tokens are switched to white-on-blue (see `.banner` in `Surface.module.css`). A `Tag`, `HealthBadge`, secondary `Button` or `Segmented` placed in a banner therefore adapts on its own. You don't need special "dark" versions.

### Tokens: `src/styles/tokens.css`
Every visual value is a CSS variable. **Change it there and the whole app follows.**

| Token | Meaning |
|---|---|
| `--c-paper`, `--c-paper-2`, `--c-card` | Backgrounds: page (cool grey), sunken, cards (white) |
| `--c-ink`, `--c-ink-2`, `--c-ink-3` | Text: main, secondary, muted |
| `--c-line`, `--c-line-strong` | Borders |
| `--c-brand`, `--c-brand-deep`, `--c-brand-soft` | WASCAL blue (links, buttons), deep blue (hover), blue tint (selected items, avatars) |
| `--c-banner` | Background of the deep-blue page banners |
| `--c-ochre`, `--c-ochre-soft`, `--c-ochre-ink` | Accent: main action button, "due this week", today line, active-menu marker |
| `--c-ok` / `--c-warn` / `--c-risk` / `--c-idle` (+ `-soft`) | Health & status colours |
| `--c-rail*` | Sidebar colours |
| `--c-on-dark`, `--c-on-dark-2` | Text on blue banners |
| `--f-body` (and `--f-display`, `--f-mono`, which point to it) | Inter |
| `--t-xs` … `--t-3xl` | Text sizes |
| `--s-1` … `--s-12` | Spacing (4px steps) |
| `--r-sm/md/lg/pill` | Corner rounding |
| `--rail-width`, `--tabbar-height`, `--content-max` | Layout sizes |

The **dark theme** is the block `:root[data-theme='dark']` in the same file. It is applied by `settings/PrefsContext.tsx`.

### Components: `src/ui/`
| Component | Use it for | Example |
|---|---|---|
| `Button`, `ButtonLink` | Actions / links that look like buttons. `variant="accent"` = ochre main action | `<Button variant="primary" icon={<Plus/>}>Add</Button>` |
| `HealthBadge` | Project health (pill; `compact` = dot only) | `<HealthBadge health="at_risk" />` |
| `StatusPill` | Deliverable status | `<StatusPill status="in_progress" />` |
| `DueChip` | When it's due: red if late, ochre if ≤7 days, plain date otherwise | `<DueChip due="2026-12-01" />` |
| `PageHeader` | Deep-blue banner at the top of every screen. `above` for back links/badges, `children` for extra rows | `<PageHeader eyebrow="…" title="…" lede="…" actions={…} />` |
| `Card` | Panels | `<Card title="…" meta="3" actions={…} flush>…</Card>` |
| `Stat` | Number tiles (clickable with `onClick`) | `<Stat label="Overdue" value={3} tone="risk" />` |
| `ProgressBar` | % bars, optional time marker | `<ProgressBar value={60} marker={45} />` |
| `Segmented` | Small tab switch / filter | see `MyWorkPage.tsx` |
| `Sheet` | Slide-in panel | see `PostUpdateSheet.tsx` |
| `Field` + `TextInput` / `TextArea` / `Select` | Forms | `<Field label="Title"><TextInput/></Field>` |
| `Avatar`, `AvatarStack`, `Tag`, `EmptyState`, `Skeleton(Rows)` | Bits and pieces | |

### Responsive breakpoints
- **≤ 960px**: sidebar hides; phone top bar + bottom tab bar appear (`AppShell.module.css`).
- **≤ 720px**: tables/lists become stacked cards, stat tiles go 2-across, the sheet becomes a bottom sheet.
- **≤ 900px**: the calendar switches from a month grid to an agenda list.

---

## 7. Business rules: health and alerts

### Project health: `src/lib/health.ts → projectHealth()`
| Result | When |
|---|---|
| ⚪ **Not started** | Project is `planned` or its start date is in the future |
| 🔴 **Off track** | A funder report is overdue, **or** 3+ items overdue, **or** a *blocked* item is overdue |
| 🟡 **At risk** | 1–2 items overdue, **or** budget spent % is more than 15 points ahead of time elapsed % |
| 🟢 **On track** | Everything else |

Change the thresholds in that one function and every badge, tile, filter and report follows.

### Alerts: `src/api/endpoints.ts → getAlerts()`
Generated from the data (the backend will run the same rules nightly):

| Alert | Rule | Who sees it |
|---|---|---|
| Funder report due | report due in ≤ 30 days | lead / owner / project team |
| Due soon | item due in ≤ 7 days | owner or project lead |
| Overdue | past due date | owner or project lead |
| Escalation | overdue > 3 days | programme heads, executives, admins (when not their own item) |
| Project off track | health = red | team + bosses |
| Stale | active project, no update for 30 days | team + bosses |

"Read" state is stored in the browser (`db.ts → store.readAlerts`).

---

## 8. Translations (English / French)

All interface text lives in **`src/i18n/en.json`** and **`src/i18n/fr.json`**, under the **same keys**.

In code: `const { t } = useTranslation();` then `t('nav.myWork')` → "My Work" / "Mon travail".

- **Variables:** `"lede": "You have {{overdue}} overdue"` → `t('mywork.lede', { overdue: 3 })`
- **Plurals:** write `key_one` and `key_other`, then call `t('key', { count: n })`
- **Dates** follow the language automatically (`lib/dates.ts` picks the date-fns locale)
- **Country names** have EN/FR in `mocks/reference.ts`

The language can be switched on the sign-in screen and in Settings, and is remembered.

---

## 9. Mock data

- **Projects** (`mocks/projects.ts`): real WASCAL programme and project names (DAS-Clim, NIGERIA4H2, PV2H, COINS, DecLaRe, iGST-WA, IMP-EGH, WISE, CICLES-TIX, COP31, H2-Sahel). **All dates, budgets, people and deliverables are invented.**
- **Dates are relative to today**: `D(-10)` means 10 days ago and `D(14)` means in two weeks. So the demo always has live, overdue and upcoming items, whatever day you open it.
- **People** (`mocks/people.ts`) are fictional. The default persona is *Dr. Ama Owusu* (Programme Head). If you sign in with an unknown `@wascal.org` email, you get Ama's data under your own name.

---

## 10. How to… (common changes, step by step)

### Change a colour
1. Open `src/styles/tokens.css`.
2. Edit the value, e.g. `--c-ochre: #d9912b;` → `#e0a030;`.
3. If it should also change in dark mode, edit the same variable inside `:root[data-theme='dark']`.

### Change the font
The app uses Inter to match the website. To change it:
1. `npm install @fontsource-variable/<font-name>`
2. In `src/main.tsx`, replace `import '@fontsource-variable/inter'`.
3. In `tokens.css`, update `--f-body` (headings and numbers follow it). The font family name is shown on fontsource.org.

### Keep the app in step with the WASCAL website
If the website's colours change, copy the new values from the website's `src/styles/global.css` (`--blue`, `--blue-deep`, `--ochre`, `--surface`, …) into the matching tokens here (`--c-brand`, `--c-banner`/`--c-brand-deep`, `--c-ochre`, `--c-paper`, …). If the logo changes, replace `public/wascal-logo.png`.

### Change some wording
Search for the text in `src/i18n/en.json`, edit it, and do the same in `fr.json`.

### Restyle one component everywhere (e.g. all cards)
Edit `src/ui/Surface.module.css` → `.card`. For buttons use `Button.module.css`, and so on.

### Restyle one screen only
Edit that screen's own `.module.css` next to its `.tsx` (e.g. `features/portfolio/DashboardPage.module.css`).

### Add a new page
1. Create `src/features/<area>/<Name>Page.tsx`:
   ```tsx
   import { useTranslation } from 'react-i18next';
   import { PageHeader, Card } from '@/ui';
   export function BudgetPage() {
     const { t } = useTranslation();
     return (<><PageHeader title={t('budget.title')} /><Card>…</Card></>);
   }
   ```
2. Register it in `src/routes.tsx`: `{ path: 'budget', element: <BudgetPage /> },`
3. (Optional) add a menu item in `src/layout/nav.ts` with a Phosphor icon.
4. Add the text keys (`budget.title`, `nav.budget`) to both `en.json` and `fr.json`.

### Add / reorder / hide a menu item
Edit `src/layout/nav.ts`. `mobile: true` puts it in the phone bottom bar (keep it to 4). `roles: ['admin']` hides it from everyone else.

### Add a field to projects (e.g. "contract number")
1. `src/types/domain.ts` → add `contractNo: string;` to `Project`.
2. Run `npm run typecheck`. It lists every mock project missing the field. Add it in `src/mocks/projects.ts`.
3. Show it, e.g. in `ProjectDetailPage.tsx` inside the `<dl className={s.facts}>` block.
4. Add the label to both translation files.

### Add a mock project
Copy one of the functions in `src/mocks/projects.ts` (e.g. `declare()`), change the values, and add it to the list in `buildProjects()` at the bottom.

### Change the health rules or alert rules
Health: `src/lib/health.ts → projectHealth()`. Alerts: `src/api/endpoints.ts → getAlerts()`. Lead-time chips in Settings: `LEAD_OPTIONS` in `SettingsPage.tsx`.

### Change the app name / icon / phone theme colour
`vite.config.ts` (PWA manifest: name, colours, icon), `index.html` (`<title>`, theme-color), `public/favicon.png`. For phone installs, add a 192×192 and a 512×512 PNG icon to the manifest (the current favicon is only 64×64).

### Remove the prototype-only bits (when going live)
- Sign-in demo personas: `features/auth/SignInPage.tsx` (the `DEMO` list + `.demo` block)
- Settings → "Prototype tools" card: `features/settings/SettingsPage.tsx`
- `src/mocks/` and `src/api/db.ts` (after `endpoints.ts` calls the real server)

---

## 11. Connecting the real backend later

The frontend was built so the backend swap touches **two places**:

**1. Data: `src/api/endpoints.ts`.** Replace each function body with a real HTTP call. The function names and return types stay the same:
```ts
const API = import.meta.env.VITE_API_URL; // e.g. https://tracker-api.wascal.org

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken(); // from MSAL, see below
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init?.headers },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export const getProjects = () => http<Project[]>('/projects');
export const postUpdate = (u: NewUpdate) => http<ProgressUpdate>('/updates', { method: 'POST', body: JSON.stringify(u) });
```
The planned backend: NestJS + PostgreSQL (via Prisma), a nightly job that runs the alert rules and sends email/push, and report generation (DOCX/PDF).

**2. Sign-in: `src/auth/AuthContext.tsx`.** Use `@azure/msal-browser` + `@azure/msal-react` with WASCAL's **Microsoft Entra ID** tenant. (wascal.org email already runs on Microsoft 365, so every staff member has an account.) `signIn()` becomes `loginRedirect()`, and `user` comes from the signed-in account + `/me` on the backend. Every screen uses `useAuth()`, so nothing else changes. WASCAL IT needs to register the app in Entra ID.

Then delete `src/mocks/`, `src/api/db.ts` and the prototype-only bits listed in §10.

---

## 12. Build, install on phone, deploy

- `npm run build` creates `dist/`, a static site that any static host can serve (Azure Static Web Apps, Vercel, Netlify, or an IIS/nginx server at WASCAL).
- **Single-page app routing:** the host must send every unknown path to `index.html` (e.g. `/projects/p-pv2h` → `index.html`). On Azure Static Web Apps or Vercel, this is a one-line "fallback/rewrite" rule.
- **Install on a phone:** open the site in Chrome (Android) → menu → *Install app*. On iPhone, open it in Safari → Share → *Add to Home Screen*. The PWA must be served over **HTTPS** to be installable (localhost is the exception).

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| `npm run dev` says the port is in use | Another dev server is running. Close it, or change `server.port` in `vite.config.ts`. |
| Page is blank | Open the browser console (F12). A red error names the file and line. |
| "Cannot find module '@/…'" | Check the path under `src/` (the `@` means `src/`). File names are case-sensitive on deployment servers. |
| Text shows as `nav.something` | That key is missing from `en.json`/`fr.json`, or is misspelled. |
| My posted updates disappeared | They live in this browser only. Clearing site data or switching browsers resets them (expected until the backend exists). |
| The app looks old after a change (built version) | The PWA cached it. Hard-refresh (Ctrl+Shift+R) or close all tabs of the app. |
| Type errors after editing | Run `npm run typecheck` and read the first error: it gives the file, line and what's wrong. |

---

## 14. Glossary

| Term | Meaning here |
|---|---|
| **Project** | Anything with deadlines: a research project, a graduate cohort, a service, an event/call |
| **Work package (WP)** | A group of deliverables with its own lead and dates |
| **Deliverable** | Something to hand in (report, dataset, model, workshop…) with a due date |
| **Milestone** | A key deliverable/moment (shown as ◆) |
| **Funder report** | A technical/financial/final report owed to the funder (shown as ■) |
| **Update** | A short dated progress note by a team member |
| **Health** | Green/amber/red signal calculated from deadlines and budget (§7) |
| **Escalation** | Overdue item pushed up to programme heads/management |
| **Component** | A reusable piece of UI (a function returning JSX) |
| **Hook** | A `useSomething()` function that gives a component data or abilities |
| **Token** | A named design value (CSS variable) in `tokens.css` |
| **PWA** | Progressive Web App: a website that can be installed and work offline |
