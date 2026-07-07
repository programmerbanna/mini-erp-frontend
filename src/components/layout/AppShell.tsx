import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { hasPermission } from '@/lib/permissions';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', permission: 'dashboard:read' },
  { to: '/products', label: 'Products', permission: 'product:read' },
  { to: '/sales', label: 'Sales', permission: 'sale:create' },
  { to: '/users', label: 'Users', permission: 'user:manage' },
  { to: '/roles', label: 'Roles', permission: 'role:manage' },
];

export default function AppShell() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-svh bg-muted/20">
      <header className="border-b bg-background">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="text-lg font-semibold">Mini ERP</span>
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.filter((item) => hasPermission(user, item.permission)).map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                      isActive && 'bg-accent text-accent-foreground',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="hidden text-sm sm:block">
                <p className="font-medium leading-none">{user?.name}</p>
                <p className="text-muted-foreground">{user?.role.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
