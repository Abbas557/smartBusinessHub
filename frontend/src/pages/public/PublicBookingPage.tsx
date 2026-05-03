import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, CreditCard, WalletCards } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useBookingSlots,
  useCreateBooking,
  useCreateCustomerBooking,
} from '../../hooks/useBookings';
import { usePublicBusiness } from '../../hooks/useBusiness';
import { useDemoCheckout } from '../../hooks/usePayments';
import { useAuth } from '../../context/AuthContext';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { Button, Card, Input, Select, Spinner, Textarea } from '../../components/ui';
import { Booking, PaymentMethod } from '../../types';

const bookingSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  customerEmail: z.string().email('Enter a valid email'),
  customerPhone: z.string().optional(),
  notes: z.string().max(500).optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const dateToday = () => new Date().toISOString().slice(0, 10);

const PublicBookingPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const { data: customerProfile } = useCustomerProfile(isCustomer);
  const { data: business, isLoading } = usePublicBusiness(slug);
  const [serviceId, setServiceId] = useState(searchParams.get('service') || '');
  const [date, setDate] = useState(dateToday());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pay_later');
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const createBooking = useCreateBooking();
  const createCustomerBooking = useCreateCustomerBooking();
  const demoCheckout = useDemoCheckout();

  const selectedServiceId = serviceId || business?.services?.[0]?._id;
  const { data: slots = [], isFetching: slotsLoading } = useBookingSlots(
    business?._id,
    selectedServiceId,
    date,
  );

  const serviceOptions = useMemo(
    () =>
      (business?.services || []).map((service) => ({
        value: service._id,
        label: `${service.name} · ${service.durationMinutes} min · ₹${service.price}`,
      })),
    [business],
  );
  const selectedService = business?.services.find((service) => service._id === selectedServiceId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (!isCustomer || !user) return;
    reset({
      customerName: user.name || '',
      customerEmail: user.email || '',
      customerPhone: customerProfile?.phone || user.phone || '',
      notes: '',
    });
  }, [customerProfile, isCustomer, reset, user]);

  const onSubmit = async (values: BookingFormValues) => {
    if (!business || !selectedServiceId || !selectedSlot) return;

    const payload = {
      businessId: business._id,
      serviceId: selectedServiceId,
      date,
      startTime: selectedSlot,
      paymentMethod,
      ...values,
    };
    const booking = await (isCustomer
      ? createCustomerBooking.mutateAsync(payload)
      : createBooking.mutateAsync(payload));

    if (paymentMethod === 'demo_card') {
      await demoCheckout.mutateAsync({
        bookingId: booking._id,
        method: 'demo_card',
      });
      setConfirmedBooking({
        ...booking,
        paymentStatus: 'paid',
        paymentMethod: 'demo_card',
      });
    } else {
      setConfirmedBooking(booking);
    }

    setConfirmed(true);
    reset();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center app-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="flex min-h-screen items-center justify-center app-surface">
        <Card>Business not found.</Card>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="flex min-h-screen items-center justify-center app-surface p-4">
        <Card className="max-w-md text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 text-xl font-semibold text-slate-900">Booking requested</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your appointment request has been sent to {business.name}.
          </p>
          {confirmedBooking && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-left text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Service</span>
                <span className="font-medium text-slate-900">{confirmedBooking.serviceName}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">Amount</span>
                <span className="font-medium text-slate-900">₹{confirmedBooking.servicePrice}</span>
              </div>
              <div className="mt-2 flex justify-between">
                <span className="text-slate-500">Payment</span>
                <span className="font-medium capitalize text-slate-900">
                  {confirmedBooking.paymentStatus === 'paid' ? 'Paid online' : 'Pay at venue'}
                </span>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-center gap-3">
            {isCustomer && (
              <Button onClick={() => navigate('/customer/bookings')}>
                My bookings
              </Button>
            )}
            <Button onClick={() => setConfirmed(false)} variant={isCustomer ? 'secondary' : 'primary'}>
              Book another
            </Button>
            <Link to={`/b/${business.slug}`}>
              <Button variant="secondary">View profile</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-surface">
      <main className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="dark-grid h-fit text-white">
          <Link to={`/b/${business.slug}`} className="text-sm font-medium text-teal-100/80 hover:text-white">
            Back to profile
          </Link>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white">
            Book {business.name}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-200">
            Select a service, date, and available time.
          </p>
        </Card>

        <Card className="mesh-panel">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Service"
                options={serviceOptions}
                value={selectedServiceId || ''}
                onChange={(event) => {
                  setServiceId(event.target.value);
                  setSelectedSlot('');
                }}
              />
              <Input
                label="Date"
                type="date"
                min={dateToday()}
                value={date}
                onChange={(event) => {
                  setDate(event.target.value);
                  setSelectedSlot('');
                }}
              />
            </div>

            {selectedService && (
              <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_1fr]">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pay_later')}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                    paymentMethod === 'pay_later'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  <WalletCards className="mt-0.5 h-5 w-5" />
                  <span>
                    <span className="block text-sm font-semibold">Pay at venue</span>
                    <span className="mt-1 block text-xs opacity-80">Reserve now, settle after service.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('demo_card')}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                    paymentMethod === 'demo_card'
                      ? 'border-emerald-700 bg-emerald-700 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                  }`}
                >
                  <CreditCard className="mt-0.5 h-5 w-5" />
                  <span>
                    <span className="block text-sm font-semibold">Demo online payment</span>
                    <span className="mt-1 block text-xs opacity-80">Mark ₹{selectedService.price} as paid.</span>
                  </span>
                </button>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Available times</p>
              {slotsLoading ? (
                <Spinner />
              ) : slots.length === 0 ? (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  No slots available for this date.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {slots.map((slot) => (
                    <button
                      key={slot.startTime}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot(slot.startTime)}
                      className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        selectedSlot === slot.startTime
                          ? 'border-slate-900 bg-slate-900 text-white'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400`}
                    >
                      {slot.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Name"
                required
                error={errors.customerName?.message}
                {...register('customerName')}
              />
              <Input
                label="Email"
                type="email"
                required
                error={errors.customerEmail?.message}
                {...register('customerEmail')}
              />
            </div>
            <Input label="Phone" type="tel" {...register('customerPhone')} />
            <Textarea label="Notes" {...register('notes')} />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={!selectedSlot}
              isLoading={
                createBooking.isPending ||
                createCustomerBooking.isPending ||
                demoCheckout.isPending
              }
            >
              {paymentMethod === 'demo_card' ? 'Book and pay demo' : 'Request booking'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default PublicBookingPage;
