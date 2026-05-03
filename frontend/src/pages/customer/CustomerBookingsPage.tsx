import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Search,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { useMyCustomerBookings } from '../../hooks/useBookings';
import { Badge, Button, Card, Spinner } from '../../components/ui';
import { Booking, BookingStatus, PaymentStatus } from '../../types';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const statusVariant = (status: BookingStatus) => {
  if (status === 'confirmed') return 'blue';
  if (status === 'completed') return 'green';
  if (status === 'cancelled') return 'red';
  return 'yellow';
};

const paymentVariant = (status: PaymentStatus) => {
  if (status === 'paid') return 'green';
  if (status === 'failed') return 'red';
  return 'yellow';
};

const statusIcon = (status: BookingStatus) => {
  if (status === 'confirmed') return <CheckCircle2 className="h-4 w-4" />;
  if (status === 'completed') return <Sparkles className="h-4 w-4" />;
  if (status === 'cancelled') return <XCircle className="h-4 w-4" />;
  return <Clock3 className="h-4 w-4" />;
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const date = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 md:grid-cols-[170px_minmax(0,1fr)]">
        <div className="flex flex-col justify-between bg-slate-950 p-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-200">Appointment</p>
            <p className="mt-2 text-2xl font-bold">{date}</p>
            <p className="mt-1 text-sm text-slate-300">
              {booking.startTime} - {booking.endTime}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-300">
            {statusIcon(booking.status)}
            <span className="capitalize">{booking.status}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">{booking.serviceName}</h2>
              <p className="mt-1 text-sm text-slate-500">
                Booking for {booking.customerName}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={statusVariant(booking.status)}>
                {booking.status}
              </Badge>
              <Badge variant={paymentVariant(booking.paymentStatus)}>
                {booking.paymentStatus}
              </Badge>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Amount</p>
              <p className="font-semibold text-slate-950">
                {currency.format(booking.servicePrice || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Payment</p>
              <p className="font-semibold capitalize text-slate-950">
                {booking.paymentMethod.replace('_', ' ')}
              </p>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Requested</p>
              <p className="font-semibold text-slate-950">
                {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>

          {booking.notes && (
            <p className="mt-4 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-500">
              {booking.notes}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

const CustomerBookingsPage: React.FC = () => {
  const { data: bookings = [], isLoading } = useMyCustomerBookings();
  const upcoming = bookings.filter((booking) => booking.status !== 'cancelled');
  const paidCount = bookings.filter((booking) => booking.paymentStatus === 'paid').length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6">
      <section className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-950/5">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="relative overflow-hidden bg-slate-950 p-8 text-white lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.32),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(6,78,59,0.82))]" />
            <div className="relative">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-emerald-100">
                Customer bookings
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight">
                Your appointments, payments, and next visits in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
                Track upcoming bookings, payment state, and appointment details without digging through messages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-emerald-50 p-6 lg:grid-cols-1">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <CalendarDays className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-bold text-slate-950">{upcoming.length}</p>
              <p className="text-sm text-slate-500">Active bookings</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <CreditCard className="h-5 w-5 text-emerald-700" />
              <p className="mt-3 text-2xl font-bold text-slate-950">{paidCount}</p>
              <p className="text-sm text-slate-500">Paid online</p>
            </div>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : bookings.length === 0 ? (
        <Card className="text-center">
          <Search className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">
            No bookings yet
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Explore nearby vendors and reserve your first service.
          </p>
          <Link to="/marketplace" className="mt-5 inline-flex">
            <Button>Discover vendors</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingsPage;
