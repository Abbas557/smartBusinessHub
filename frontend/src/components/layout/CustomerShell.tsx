import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, LogOut, MapPin, Search, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui';

const navItems = [
  { label: 'Discover', to: '/marketplace', icon: Search },
  { label: 'My Bookings', to: '/customer/bookings', icon: CalendarDays },
  { label: 'Profile', to: '/customer/profile', icon: UserRound },
];

const CustomerShell: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-brand-50">
      <header className="sticky top-0 z-30 border-b border-brand-200/70 bg-brand-50/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
          <Link to="/marketplace" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-white shadow-button">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-bold tracking-tight text-brand-900">
                Smart Business Hub
              </span>
              <span className="hidden text-xs text-brand-800/60 sm:block">
                Local services, beautifully booked
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-lg border border-brand-200 bg-white/70 p-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-brand-900 shadow-sm'
                        : 'text-brand-800/65 hover:text-brand-900'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-brand-900">{user?.name || 'Customer'}</p>
                  <p className="text-xs text-brand-800/55">Ready to book</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => logout()} leftIcon={<LogOut className="h-4 w-4" />}>
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="secondary" size="sm">Sign in</Button>
                </Link>
                <Link to="/customer/register">
                  <Button size="sm">Join</Button>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-brand-100 px-4 py-2 md:hidden">
          <nav className="grid grid-cols-3 gap-1 rounded-lg bg-white/70 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-center gap-1 rounded-md px-2 py-2 text-xs font-medium ${
                      isActive ? 'bg-white text-brand-900 shadow-sm' : 'text-brand-800/65'
                    }`
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>

      <div className="pointer-events-none fixed inset-x-0 top-0 -z-0 h-80 bg-[radial-gradient(circle_at_20%_15%,rgba(247,217,214,0.55),transparent_35%),radial-gradient(circle_at_80%_5%,rgba(184,147,79,0.18),transparent_30%)]" />

      <main className="relative z-10">
        <Outlet />
      </main>

      <footer className="mx-auto flex max-w-7xl items-center justify-between px-4 py-8 text-xs text-brand-800/55 lg:px-6">
        <span>Smart Business Hub</span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          Built for nearby bookings
        </span>
      </footer>
    </div>
  );
};

export default CustomerShell;
