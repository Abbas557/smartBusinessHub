import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  XCircle,
} from 'lucide-react';
import {
  useBookingSlots,
  useCancelCustomerBooking,
  useMyCustomerBookings,
  useRescheduleCustomerBooking,
} from '../../hooks/useBookings';
import { Badge, Button, Card, Input, Spinner } from '../../components/ui';
import { Booking, BookingStatus, PaymentStatus } from '../../types';
import { useCreateReview, useMyReviews } from '../../hooks/useReviews';

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

const dateToday = () => new Date().toISOString().slice(0, 10);

const BookingCard: React.FC<{
  booking: Booking;
  hasReview: boolean;
}> = ({ booking, hasReview }) => {
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [newDate, setNewDate] = useState(dateToday());
  const [newSlot, setNewSlot] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const cancelBooking = useCancelCustomerBooking();
  const rescheduleBooking = useRescheduleCustomerBooking();
  const createReview = useCreateReview();
  const canChange = booking.status !== 'cancelled' && booking.status !== 'completed';
  const canReview = booking.status === 'completed' && !hasReview;
  const { data: slots = [], isFetching: slotsLoading } = useBookingSlots(
    booking.businessId,
    booking.serviceId,
    isRescheduling ? newDate : undefined,
  );
  const date = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <Card className="overflow-hidden p-0">
      <div className="grid gap-0 md:grid-cols-[170px_minmax(0,1fr)]">
        <div className="flex flex-col justify-between bg-brand-900 p-5 text-white">
          <div>
            <p className="text-xs uppercase tracking-wide text-blush-100/80">Appointment</p>
            <p className="mt-2 font-display text-3xl font-semibold">{date}</p>
            <p className="mt-1 text-sm text-blush-100/70">
              {booking.startTime} - {booking.endTime}
            </p>
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-blush-100/70">
            {statusIcon(booking.status)}
            <span className="capitalize">{booking.status}</span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold text-brand-900">{booking.serviceName}</h2>
              <p className="mt-1 text-sm text-brand-800/60">
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
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-xs text-brand-800/55">Amount</p>
              <p className="font-semibold text-brand-900">
                {currency.format(booking.servicePrice || 0)}
              </p>
            </div>
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-xs text-brand-800/55">Payment</p>
              <p className="font-semibold capitalize text-brand-900">
                {booking.paymentMethod.replace('_', ' ')}
              </p>
            </div>
            <div className="rounded-lg bg-brand-50 p-3">
              <p className="text-xs text-brand-800/55">Requested</p>
              <p className="font-semibold text-brand-900">
                {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>

          {booking.notes && (
            <p className="mt-4 rounded-lg border border-brand-100 bg-white p-3 text-sm text-brand-800/60">
              {booking.notes}
            </p>
          )}

          {booking.rescheduledFrom && (
            <p className="mt-4 rounded-lg border border-gold-100 bg-gold-100/50 p-3 text-sm text-gold-700">
              Rescheduled from {new Date(booking.rescheduledFrom.date).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
              })}{' '}
              at {booking.rescheduledFrom.startTime}.
            </p>
          )}

          {canChange && (
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setIsRescheduling((value) => !value);
                  setNewSlot('');
                }}
              >
                Reschedule
              </Button>
              <Button
                size="sm"
                variant="danger"
                isLoading={cancelBooking.isPending}
                onClick={() =>
                  cancelBooking.mutate({
                    bookingId: booking._id,
                    reason: 'Cancelled by customer',
                  })
                }
              >
                Cancel
              </Button>
            </div>
          )}

          {isRescheduling && canChange && (
            <div className="mt-4 rounded-lg border border-brand-100 bg-brand-50 p-4">
              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)]">
                <Input
                  label="New date"
                  type="date"
                  min={dateToday()}
                  value={newDate}
                  onChange={(event) => {
                    setNewDate(event.target.value);
                    setNewSlot('');
                  }}
                />
                <div>
                  <p className="mb-2 text-sm font-medium text-brand-900">Available slots</p>
                  {slotsLoading ? (
                    <Spinner />
                  ) : slots.length === 0 ? (
                    <p className="rounded-lg bg-white p-3 text-sm text-slate-500">
                      No slots available.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {slots.map((slot) => (
                        <button
                          key={slot.startTime}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setNewSlot(slot.startTime)}
                          className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${
                            newSlot === slot.startTime
                              ? 'border-brand-700 bg-brand-700 text-white'
                              : 'border-brand-100 bg-white text-brand-800 hover:bg-brand-50'
                          } disabled:cursor-not-allowed disabled:bg-brand-100 disabled:text-brand-800/35`}
                        >
                          {slot.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsRescheduling(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={!newSlot}
                  isLoading={rescheduleBooking.isPending}
                  onClick={() =>
                    rescheduleBooking.mutate(
                      {
                        bookingId: booking._id,
                        date: newDate,
                        startTime: newSlot,
                      },
                      {
                        onSuccess: () => setIsRescheduling(false),
                      },
                    )
                  }
                >
                  Save new time
                </Button>
              </div>
            </div>
          )}

          {booking.status === 'completed' && hasReview && (
            <p className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blush-100 px-3 py-2 text-sm font-medium text-brand-700">
              <Star className="h-4 w-4 fill-current" />
              Review submitted
            </p>
          )}

          {canReview && (
            <div className="mt-5">
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<MessageSquare className="h-4 w-4" />}
                onClick={() => setIsReviewing((value) => !value)}
              >
                Leave review
              </Button>
            </div>
          )}

          {isReviewing && canReview && (
            <div className="mt-4 rounded-lg border border-gold-100 bg-gold-100/50 p-4">
              <p className="text-sm font-semibold text-brand-900">
                Rate this completed service
              </p>
              <div className="mt-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    className="rounded-md p-1 text-amber-500"
                    aria-label={`${value} star rating`}
                  >
                    <Star
                      className={`h-6 w-6 ${
                        value <= rating ? 'fill-current' : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                rows={3}
                maxLength={700}
                placeholder="Share what went well for future customers"
                className="mt-3 w-full resize-none rounded-lg border border-gold-100 bg-white px-3 py-2 text-sm focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-100"
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setIsReviewing(false)}
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  isLoading={createReview.isPending}
                  onClick={() =>
                    createReview.mutate(
                      {
                        bookingId: booking._id,
                        rating,
                        comment: comment.trim() || undefined,
                      },
                      {
                        onSuccess: () => setIsReviewing(false),
                      },
                    )
                  }
                >
                  Publish review
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const CustomerBookingsPage: React.FC = () => {
  const { data: bookings = [], isLoading } = useMyCustomerBookings();
  const { data: reviews = [] } = useMyReviews();
  const upcoming = bookings.filter((booking) => booking.status !== 'cancelled');
  const paidCount = bookings.filter((booking) => booking.paymentStatus === 'paid').length;
  const reviewedBookingIds = new Set(reviews.map((review) => review.bookingId));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6">
      <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="relative overflow-hidden bg-brand-900 p-8 text-white lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,217,214,0.32),transparent_30%),linear-gradient(135deg,rgba(43,23,21,0.96),rgba(130,37,45,0.86))]" />
            <div className="relative">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-blush-100">
                Customer bookings
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
                Your appointments, payments, and next visits in one place.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
                Track upcoming bookings, payment state, and appointment details without digging through messages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-blush-100 p-6 lg:grid-cols-1">
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <CalendarDays className="h-5 w-5 text-brand-600" />
              <p className="mt-3 text-2xl font-bold text-brand-900">{upcoming.length}</p>
              <p className="text-sm text-brand-800/60">Active bookings</p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow-sm">
              <CreditCard className="h-5 w-5 text-brand-600" />
              <p className="mt-3 text-2xl font-bold text-brand-900">{paidCount}</p>
              <p className="text-sm text-brand-800/60">Paid online</p>
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
          <h2 className="mt-4 font-display text-xl font-semibold text-brand-900">
            No bookings yet
          </h2>
          <p className="mt-2 text-sm text-brand-800/60">
            Explore nearby vendors and reserve your first service.
          </p>
          <Link to="/marketplace" className="mt-5 inline-flex">
            <Button>Discover vendors</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              hasReview={reviewedBookingIds.has(booking._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerBookingsPage;
