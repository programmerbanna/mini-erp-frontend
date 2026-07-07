import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { hasPermission } from '@/lib/permissions';
import { useBackendStatus } from '@/lib/useBackendStatus';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    to: '/',
    label: 'Dashboard',
    permission: 'dashboard:read',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/products',
    label: 'Products',
    permission: 'product:read',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    ),
  },
  {
    to: '/sales',
    label: 'Sales',
    permission: 'sale:create',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    to: '/users',
    label: 'Users',
    permission: 'user:manage',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    to: '/roles',
    label: 'Roles',
    permission: 'role:manage',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

const STATUS_LABEL: Record<string, string> = {
  online: 'Connected',
  offline: 'Server offline',
  checking: 'Connecting…',
};

const STATUS_COLOR: Record<string, string> = {
  online: 'hsl(142 60% 36%)',
  offline: 'hsl(358 72% 46%)',
  checking: 'hsl(38 90% 38%)',
};

export default function AppShell() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, retry } = useBackendStatus();

  function handleLogout() {
    dispatch(logout());
    navigate('/login', { replace: true });
  }

  const initials = user?.name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const visibleNavItems = NAV_ITEMS.filter((item) => hasPermission(user, item.permission));

  return (
    <div className="flex min-h-svh bg-background">
      {/* ── Sidebar ── */}
      <aside
        className="fixed inset-y-0 left-0 z-40 flex w-[232px] flex-col"
        style={{
          background: 'white',
          borderRight: '1px solid hsl(220 15% 90%)',
          boxShadow: '1px 0 0 0 hsl(220 15% 92%)',
        }}
      >
        {/* Logo */}
        <div
          className="flex h-14 flex-shrink-0 items-center gap-2.5 px-5"
          style={{ borderBottom: '1px solid hsl(220 15% 92%)' }}
        >
          <div
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'hsl(245 75% 55%)' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight" style={{ color: 'hsl(222 47% 11%)' }}>
              Mini ERP
            </p>
            <p className="text-xs" style={{ color: 'hsl(220 13% 55%)' }}>
              v1.0
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p
            className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'hsl(220 13% 62%)' }}
          >
            Navigation
          </p>
          {visibleNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => cn('nav-item', isActive && 'active')}
            >
              <span className="nav-icon flex-shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom: status + user */}
        <div style={{ borderTop: '1px solid hsl(220 15% 92%)' }} className="px-3 py-3 space-y-1">
          {/* Backend status */}
          <button
            onClick={status === 'offline' ? retry : undefined}
            title={status === 'offline' ? 'Click to retry connection' : undefined}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs transition-colors duration-150"
            style={{
              background: 'hsl(220 20% 97%)',
              border: '1px solid hsl(220 15% 91%)',
              cursor: status === 'offline' ? 'pointer' : 'default',
            }}
          >
            <span className={cn('status-dot', status)} />
            <span style={{ color: STATUS_COLOR[status] }} className="font-medium">
              {STATUS_LABEL[status]}
            </span>
            {status === 'offline' && (
              <span style={{ color: 'hsl(220 13% 55%)' }} className="ml-auto">
                Retry ↺
              </span>
            )}
          </button>

          {/* User */}
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div
              className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{
                background: 'hsl(245 75% 55% / 0.12)',
                color: 'hsl(245 75% 48%)',
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'hsl(222 47% 14%)' }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: 'hsl(220 13% 55%)' }}>
                {user?.role.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex-shrink-0 rounded-md p-1 transition-colors duration-150 hover:bg-red-50 hover:text-red-500"
              style={{ color: 'hsl(220 13% 62%)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col" style={{ marginLeft: '232px' }}>
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 flex h-14 items-center justify-between px-6"
          style={{
            background: 'white',
            borderBottom: '1px solid hsl(220 15% 92%)',
            boxShadow: '0 1px 0 0 hsl(220 15% 93%)',
          }}
        >
          {/* Breadcrumb-style page title is rendered by each page */}
          <div className="flex items-center gap-2">
            <div
              className="h-5 w-5 rounded flex items-center justify-center"
              style={{ background: 'hsl(245 75% 55% / 0.08)' }}
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="hsl(245 75% 50%)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: 'hsl(220 13% 50%)' }}>
              Mini ERP
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'hsl(220 13% 55%)' }}>
            <span>
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-6 max-w-screen-xl w-full mx-auto page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
