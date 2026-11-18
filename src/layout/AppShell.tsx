/* ==========================================================================
   APP SHELL: the frame around every signed-in screen.
     Laptop (> 960px) : navy sidebar on the left + top bar
     Phone  (≤ 960px) : compact top bar + bottom tab bar + "More" sheet
   The current screen renders where <Outlet/> is.
   ========================================================================== */
import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Bell, DotsThreeOutline, NotePencil, SignOut } from '@phosphor-icons/react';
import { useAuth } from '@/auth/AuthContext';
import { useAlerts } from '@/api/hooks';
import { NAV } from './nav';
import { ComposerProvider, useComposer } from './Composer';
import { Avatar, Button, Sheet } from '@/ui';
import { formatDate, toISO, today } from '@/lib/dates';
import { getISOWeek } from 'date-fns';
import { cx } from '@/lib/cx';
import s from './AppShell.module.css';

export function AppShell() {
  return (
    <ComposerProvider>
      <Frame />
    </ComposerProvider>
  );
}

/** The real WASCAL logo (same file as the website) + the app's name. */
function Wordmark({ compact }: { compact?: boolean }) {
  return (
    <Link to="/my-work" className={cx(s.wordmark, compact && s.wordmarkCompact)} aria-label="WASCAL Project Tracker">
      <img src="/wascal-logo.png" alt="WASCAL" width={420} height={255} />
      {!compact && <span className={s.appName}>Project Tracker</span>}
    </Link>
  );
}

function Frame() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { openComposer } = useComposer();
  const { data: alerts } = useAlerts();
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const unread = alerts?.filter((a) => !a.read).length ?? 0;
  const visible = NAV.filter((n) => !n.roles || (user && n.roles.includes(user.role)));
  const now = today();

  return (
    <div className={s.shell}>
      {/* ---------- Sidebar (laptop) ---------- */}
      <aside className={s.rail}>
        <Wordmark />
        <nav className={s.railNav} aria-label={t('nav.main')}>
          {visible
            .filter((n) => n.section === 'main')
            .map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx(s.railLink, isActive && s.active)}>
                <n.icon size={20} weight={location.pathname.startsWith(n.to) ? 'fill' : 'regular'} />
                <span>{t(n.label)}</span>
                {n.to === '/alerts' && unread > 0 && <em className={s.badge}>{unread}</em>}
              </NavLink>
            ))}
        </nav>
        <div className={s.railFoot}>
          {visible
            .filter((n) => n.section === 'footer')
            .map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => cx(s.railLink, isActive && s.active)}>
                <n.icon size={20} weight={location.pathname.startsWith(n.to) ? 'fill' : 'regular'} />
                <span>{t(n.label)}</span>
              </NavLink>
            ))}
          <div className={s.me}>
            <Avatar person={user!} size={34} />
            <div className={s.meText}>
              <b>{user!.name}</b>
              <small>{t(`roles.${user!.role}`)}</small>
            </div>
            <button className={s.iconBtn} onClick={signOut} title={t('auth.signOut')} aria-label={t('auth.signOut')}>
              <SignOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Main column ---------- */}
      <div className={s.main}>
        <header className={s.topbar}>
          <div className={s.mobileBrand}>
            <Wordmark compact />
          </div>
          <div className={s.stamp}>
            <span className="mono">{formatDate(toISO(now))}</span>
            <span className={cx('mono', s.week)}>W{String(getISOWeek(now)).padStart(2, '0')}</span>
          </div>
          <div className={s.topActions}>
            <Link to="/alerts" className={s.bell} aria-label={t('nav.alerts')}>
              <Bell size={20} weight={location.pathname === '/alerts' ? 'fill' : 'regular'} />
              {unread > 0 && <em className={s.dot}>{unread > 9 ? '9+' : unread}</em>}
            </Link>
            <Button variant="accent" icon={<NotePencil size={18} weight="bold" />} onClick={() => openComposer()} className={s.postBtn}>
              <span className={s.postLabel}>{t('updates.post')}</span>
            </Button>
          </div>
        </header>

        <main className={s.content} id="main">
          <Outlet />
        </main>
      </div>

      {/* ---------- Bottom tab bar (phone) ---------- */}
      <nav className={s.tabbar} aria-label={t('nav.main')}>
        {visible
          .filter((n) => n.mobile)
          .map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => cx(s.tab, isActive && s.tabOn)}>
              <n.icon size={22} />
              <span>{t(n.label)}</span>
            </NavLink>
          ))}
        <button className={s.tab} onClick={() => setMoreOpen(true)}>
          <DotsThreeOutline size={22} />
          <span>{t('nav.more')}</span>
        </button>
      </nav>

      <Sheet open={moreOpen} onClose={() => setMoreOpen(false)} title={t('nav.more')}>
        <div className={s.moreList}>
          {visible
            .filter((n) => !n.mobile)
            .map((n) => (
              <NavLink key={n.to} to={n.to} className={s.moreLink} onClick={() => setMoreOpen(false)}>
                <n.icon size={22} />
                <span>{t(n.label)}</span>
                {n.to === '/alerts' && unread > 0 && <em className={s.badge}>{unread}</em>}
              </NavLink>
            ))}
          <div className={s.moreMe}>
            <Avatar person={user!} size={36} />
            <div className={s.meText}>
              <b>{user!.name}</b>
              <small>{user!.email}</small>
            </div>
          </div>
          <Button block icon={<SignOut size={18} />} onClick={signOut}>
            {t('auth.signOut')}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
