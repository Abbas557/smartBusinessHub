import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Calendar,
  Users,
  TrendingUp,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock3,
  BarChart3,
  Activity,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyBusiness } from '../../hooks/useBusiness';
import { useBookings } from '../../hooks/useBookings';
import { useCustomers } from '../../hooks/useCustomers';
import { Card, Badge, Spinner, Button } from '../../components/ui';
import { BookingStatus } from '../../types';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}> = ({ label, value, icon, color, sub }) => (
  <Card className="transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between">
      <div>
        <p className="mb-1 text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const { data: business, isLoading } = useMyBusiness();
  const { data: bookings = [], isLoading: bookingsLoading } = useBookings(Boolean(business));
  const { data: customers = [] } = useCustomers(Boolean(business));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading || (business && bookingsLoading)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const setupSteps = [
    { label: 'Business profile', done: Boolean(business) },
    { label: 'At least one service', done: Boolean(business?.services?.length) },
    { label: 'Profile published', done: Boolean(business?.isPublished) },
  ];
  const completedSteps = setupSteps.filter((step) => step.done).length;
  const statusCounts = bookings.reduce<Record<BookingStatus, number>>(
    (acc, booking) => {
      acc[booking.status] += 1;
      return acc;
    },
    { pending: 0, confirmed: 0, completed: 0, cancelled: 0 },
  );
  const upcoming = bookings
    .filter((booking) => new Date(booking.date) >= new Date(new Date().toDateString()))
    .slice(0, 4);
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm">
        <div className="dark-grid p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-100/80">{greeting()}</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight">
                {user?.name?.split(' ')[0] || 'Business owner'}'s command center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Monitor profile readiness, booking demand, and customer growth from one calm, client-ready workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {business?.isPublished && (
                <Link to={`/b/${business.slug}`}>
                  <Button variant="secondary" leftIcon={<ExternalLink className="h-4 w-4" />}>
                    Public Page
                  </Button>
                </Link>
              )}
              <Link to="/dashboard/business">
                <Button leftIcon={<Building2 className="h-4 w-4" />}>
                  Manage Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Banner (no business yet) */}
      {!business && (
        <div className="flex items-start gap-4 rounded-lg border border-sky-200 bg-sky-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-sky-950">
              Set up your business profile to get started
            </p>
            <p className="mt-0.5 text-sm text-sky-700">
              Create your profile, add your services, and publish your page.
            </p>
          </div>
          <Link to="/dashboard/business">
            <Button size="sm">
              Set Up <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Bookings"
          value={bookings.length || business?.totalBookings || 0}
          icon={<Calendar className="w-5 h-5 text-sky-600" />}
          color="bg-sky-50"
          sub="All time"
        />
        <StatCard
          label="Services"
          value={business?.services?.length ?? 0}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          color="bg-emerald-50"
          sub="Active offerings"
        />
        <StatCard
          label="Customers"
          value={customers.length}
          icon={<Users className="w-5 h-5 text-violet-600" />}
          color="bg-violet-50"
          sub="Known contacts"
        />
        <StatCard
          label="Profile Status"
          value={business?.isPublished ? 'Live' : 'Draft'}
          icon={<Building2 className="w-5 h-5 text-amber-600" />}
          color="bg-amber-50"
        />
      </div>

      {business && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="mesh-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Booking mix</h2>
                <p className="text-sm text-slate-500">Live status distribution</p>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-500" />
            </div>
            <div className="space-y-4">
              {(Object.keys(statusCounts) as BookingStatus[]).map((status) => (
                <div key={status}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="capitalize text-slate-600">{status}</span>
                    <span className="font-semibold text-slate-900">{statusCounts[status]}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-200">
                    <div
                      className={`h-2 rounded-full ${
                        status === 'confirmed'
                          ? 'bg-sky-500'
                          : status === 'completed'
                            ? 'bg-emerald-500'
                            : status === 'cancelled'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                      }`}
                      style={{ width: `${(statusCounts[status] / maxStatus) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Upcoming</h2>
                <p className="text-sm text-slate-500">Next appointments</p>
              </div>
              <Activity className="h-5 w-5 text-slate-500" />
            </div>
            {upcoming.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No upcoming bookings yet.
              </p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((booking) => (
                  <div key={booking._id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{booking.customerName}</p>
                      <Badge variant={booking.status === 'confirmed' ? 'blue' : 'yellow'}>
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.serviceName} · {booking.startTime}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Launch readiness</h2>
            <p className="mt-1 text-sm text-slate-500">{completedSteps} of {setupSteps.length} Phase 1 setup steps complete.</p>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 sm:w-56">
            <div
              className="h-2 rounded-full bg-emerald-500 transition-all"
              style={{ width: `${(completedSteps / setupSteps.length) * 100}%` }}
            />
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {setupSteps.map((step) => (
            <div key={step.label} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              {step.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              ) : (
                <Clock3 className="h-5 w-5 text-slate-400" />
              )}
              <span className="text-sm font-medium text-slate-700">{step.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Business quick-view */}
      {business && (
        <Card>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">{business.name}</h2>
              <p className="text-sm text-slate-500">/{business.slug}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={business.isPublished ? 'green' : 'yellow'}>
                {business.isPublished ? 'Published' : 'Draft'}
              </Badge>
              <Link to="/dashboard/business">
                <Button variant="secondary" size="sm">
                  Manage
                </Button>
              </Link>
            </div>
          </div>

          {business.services.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {business.services.slice(0, 4).map((s) => (
                <div
                  key={s._id}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.durationMinutes} min</p>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">
                    ₹{s.price}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-slate-400">
              No services added yet.{' '}
              <Link to="/dashboard/business" className="font-medium text-slate-900 hover:underline">
                Add your first service
              </Link>
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

export default DashboardHome;
