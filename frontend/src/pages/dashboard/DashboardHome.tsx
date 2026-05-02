import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart3,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  IndianRupee,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useMyBusiness } from '../../hooks/useBusiness';
import { useBookings } from '../../hooks/useBookings';
import { useCustomers } from '../../hooks/useCustomers';
import { Badge, Button, Card, Spinner } from '../../components/ui';
import { Booking, BookingStatus } from '../../types';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}> = ({ label, value, icon, color, sub }) => (
  <Card className="transition-shadow hover:shadow-md">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="mb-1 text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
      </div>
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
        {icon}
      </div>
    </div>
  </Card>
);

const MiniBarChart: React.FC<{
  data: Array<{ label: string; value: number }>;
  color?: string;
}> = ({ data, color = '#0f172a' }) => {
  const max = Math.max(...data.map((item) => item.value), 1);
  const width = 520;
  const height = 190;
  const gap = 14;
  const barWidth = (width - gap * (data.length - 1)) / data.length;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-56 w-full" role="img">
      <line x1="0" y1="150" x2={width} y2="150" stroke="#e2e8f0" />
      {data.map((item, index) => {
        const barHeight = (item.value / max) * 120;
        const x = index * (barWidth + gap);
        const y = 150 - barHeight;
        return (
          <g key={item.label}>
            <rect x={x} y={y} width={barWidth} height={barHeight} rx="7" fill={color} opacity={0.9} />
            <text x={x + barWidth / 2} y="174" textAnchor="middle" className="fill-slate-500 text-[11px]">
              {item.label}
            </text>
            <text x={x + barWidth / 2} y={Math.max(y - 8, 12)} textAnchor="middle" className="fill-slate-700 text-[11px] font-semibold">
              {item.value ? currency.format(item.value).replace('.00', '') : '0'}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

const DonutChart: React.FC<{
  paid: number;
  unpaid: number;
}> = ({ paid, unpaid }) => {
  const total = Math.max(paid + unpaid, 1);
  const paidPercent = paid / total;
  const circumference = 2 * Math.PI * 42;

  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="h-32 w-32">
        <circle cx="60" cy="60" r="42" fill="none" stroke="#e2e8f0" strokeWidth="16" />
        <circle
          cx="60"
          cy="60"
          r="42"
          fill="none"
          stroke="#10b981"
          strokeDasharray={`${circumference * paidPercent} ${circumference}`}
          strokeLinecap="round"
          strokeWidth="16"
          transform="rotate(-90 60 60)"
        />
        <text x="60" y="57" textAnchor="middle" className="fill-slate-900 text-lg font-bold">
          {Math.round(paidPercent * 100)}%
        </text>
        <text x="60" y="75" textAnchor="middle" className="fill-slate-500 text-[10px]">
          paid
        </text>
      </svg>
      <div className="space-y-3 text-sm">
        <div>
          <p className="text-slate-500">Paid revenue</p>
          <p className="font-semibold text-slate-900">{currency.format(paid)}</p>
        </div>
        <div>
          <p className="text-slate-500">Unpaid pipeline</p>
          <p className="font-semibold text-slate-900">{currency.format(unpaid)}</p>
        </div>
      </div>
    </div>
  );
};

const getBookingRevenue = (booking: Booking) => booking.servicePrice || 0;

const getMonthKey = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', { month: 'short' });

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
      <div className="flex h-64 items-center justify-center">
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
  const maxStatus = Math.max(...Object.values(statusCounts), 1);

  const paidRevenue = bookings
    .filter((booking) => booking.paymentStatus === 'paid')
    .reduce((sum, booking) => sum + getBookingRevenue(booking), 0);
  const projectedRevenue = bookings
    .filter((booking) => booking.status !== 'cancelled')
    .reduce((sum, booking) => sum + getBookingRevenue(booking), 0);
  const unpaidRevenue = Math.max(projectedRevenue - paidRevenue, 0);
  const averageOrderValue = bookings.length ? Math.round(projectedRevenue / bookings.length) : 0;
  const paidCount = bookings.filter((booking) => booking.paymentStatus === 'paid').length;
  const conversionRate = bookings.length ? Math.round((paidCount / bookings.length) * 100) : 0;

  const monthlyRevenue = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const label = date.toLocaleDateString('en-IN', { month: 'short' });
    return { label, value: 0 };
  });
  bookings.forEach((booking) => {
    const label = getMonthKey(booking.date);
    const bucket = monthlyRevenue.find((item) => item.label === label);
    if (bucket && booking.status !== 'cancelled') {
      bucket.value += getBookingRevenue(booking);
    }
  });

  const serviceRevenue = Object.values(
    bookings.reduce<Record<string, { label: string; value: number }>>((acc, booking) => {
      if (booking.status === 'cancelled') return acc;
      acc[booking.serviceName] ||= { label: booking.serviceName, value: 0 };
      acc[booking.serviceName].value += getBookingRevenue(booking);
      return acc;
    }, {}),
  )
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const upcoming = bookings
    .filter((booking) => new Date(booking.date) >= new Date(new Date().toDateString()))
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="overflow-hidden rounded-lg border border-slate-200/80 bg-white shadow-sm">
        <div className="dark-grid p-6 text-white lg:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-medium text-teal-100/80">{greeting()}</p>
              <h1 className="mt-1 text-4xl font-bold tracking-tight">
                {user?.name?.split(' ')[0] || 'Business owner'}'s revenue command center
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Track demand, earnings, payment collection, service performance, and the next appointments that need attention.
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
              <Link to="/marketplace">
                <Button variant="secondary" leftIcon={<Users className="h-4 w-4" />}>
                  Marketplace
                </Button>
              </Link>
              <Link to="/dashboard/business">
                <Button leftIcon={<Building2 className="h-4 w-4" />}>
                  Manage Business
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {!business && (
        <div className="flex items-start gap-4 rounded-lg border border-sky-200 bg-sky-50 p-5">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-sky-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-sky-950">Set up your business profile to get started</p>
            <p className="mt-0.5 text-sm text-sky-700">
              Create your profile, add your services, and publish your page.
            </p>
          </div>
          <Link to="/dashboard/business">
            <Button size="sm">
              Set Up <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projected Revenue"
          value={currency.format(projectedRevenue)}
          icon={<IndianRupee className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-50"
          sub="All non-cancelled bookings"
        />
        <StatCard
          label="Paid Revenue"
          value={currency.format(paidRevenue)}
          icon={<CreditCard className="h-5 w-5 text-sky-600" />}
          color="bg-sky-50"
          sub={`${conversionRate}% payment conversion`}
        />
        <StatCard
          label="Average Order"
          value={currency.format(averageOrderValue)}
          icon={<TrendingUp className="h-5 w-5 text-violet-600" />}
          color="bg-violet-50"
          sub="Revenue per booking"
        />
        <StatCard
          label="Customers"
          value={customers.length}
          icon={<Users className="h-5 w-5 text-amber-600" />}
          color="bg-amber-50"
          sub={`${bookings.length || business?.totalBookings || 0} total bookings`}
        />
      </div>

      {business && (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <Card className="mesh-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Revenue trend</h2>
                <p className="text-sm text-slate-500">Projected earnings across the last 6 months</p>
              </div>
              <BarChart3 className="h-5 w-5 text-slate-500" />
            </div>
            <MiniBarChart data={monthlyRevenue} color="#0f766e" />
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Payment health</h2>
                <p className="text-sm text-slate-500">Paid versus unpaid pipeline</p>
              </div>
              <CreditCard className="h-5 w-5 text-slate-500" />
            </div>
            <DonutChart paid={paidRevenue} unpaid={unpaidRevenue} />
          </Card>
        </div>
      )}

      {business && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <Card className="mesh-panel">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Service revenue</h2>
                <p className="text-sm text-slate-500">Top earners by booked value</p>
              </div>
              <Activity className="h-5 w-5 text-slate-500" />
            </div>
            {serviceRevenue.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No service revenue yet.</p>
            ) : (
              <div className="space-y-4">
                {serviceRevenue.map((service) => {
                  const width = (service.value / Math.max(serviceRevenue[0]?.value || 1, 1)) * 100;
                  return (
                    <div key={service.label}>
                      <div className="mb-1 flex justify-between gap-3 text-sm">
                        <span className="truncate text-slate-600">{service.label}</span>
                        <span className="font-semibold text-slate-900">{currency.format(service.value)}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-200">
                        <div className="h-3 rounded-full bg-slate-900" style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Booking funnel</h2>
                <p className="text-sm text-slate-500">Operational status mix</p>
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
        </div>
      )}

      {business && (
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Upcoming</h2>
                <p className="text-sm text-slate-500">Next appointments</p>
              </div>
              <Calendar className="h-5 w-5 text-slate-500" />
            </div>
            {upcoming.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No upcoming bookings yet.</p>
            ) : (
              <div className="space-y-3">
                {upcoming.map((booking) => (
                  <div key={booking._id} className="rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{booking.customerName}</p>
                      <Badge variant={booking.paymentStatus === 'paid' ? 'green' : 'yellow'}>
                        {booking.paymentStatus || 'unpaid'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {booking.serviceName} · {booking.startTime} · {currency.format(getBookingRevenue(booking))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Launch readiness</h2>
                <p className="mt-1 text-sm text-slate-500">{completedSteps} of {setupSteps.length} setup steps complete.</p>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 sm:w-56">
                <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${(completedSteps / setupSteps.length) * 100}%` }} />
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
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
