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
import {
  useCreateRazorpayOrder,
  useDemoCheckout,
  useVerifyRazorpayPayment,
} from '../../hooks/usePayments';
import { useAuth } from '../../context/AuthContext';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { useCustomerEvents } from '../../hooks/useCustomerEvents';
import { Button, Card, Input, Select, Spinner, Textarea } from '../../components/ui';
import { Booking, PaymentMethod } from '../../types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => { open: () => void };
  }
}

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
  const createRazorpayOrder = useCreateRazorpayOrder();
  const verifyRazorpayPayment = useVerifyRazorpayPayment();
  const { trackEvent } = useCustomerEvents(isCustomer);

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

  useEffect(() => {
    if (!business) return;
    trackEvent({
      eventType: 'booking_intent',
      businessId: business._id,
      businessSlug: business.slug,
      serviceId: selectedService?._id,
      serviceName: selectedService?.name,
      category: business.category,
      city: business.city,
      area: business.area,
      pincode: business.pincode,
      metadata: {
        source: 'booking_page',
      },
    });
  }, [business, selectedService, trackEvent]);

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
    if (!isCustomer) {
      trackEvent({
        eventType: 'booking_created',
        businessId: business._id,
        businessSlug: business.slug,
        serviceId: selectedServiceId,
        serviceName: selectedService?.name,
        category: business.category,
        city: business.city,
        area: business.area,
        pincode: business.pincode,
        metadata: {
          bookingId: booking._id,
          paymentMethod,
          source: 'booking_form',
        },
      });
    }

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
    } else if (paymentMethod === 'card') {
      await startRazorpayCheckout(booking, values);
      setConfirmedBooking({
        ...booking,
        paymentStatus: 'paid',
        paymentMethod: 'card',
      });
    } else {
      setConfirmedBooking(booking);
    }

    setConfirmed(true);
    reset();
  };

  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const startRazorpayCheckout = async (
    booking: Booking,
    values: BookingFormValues,
  ) => {
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error('Unable to load Razorpay Checkout');
    }

    const order = await createRazorpayOrder.mutateAsync({
      bookingId: booking._id,
    });

    await new Promise<void>((resolve, reject) => {
      const checkout = new window.Razorpay!({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Smart Business Hub',
        description: booking.serviceName,
        order_id: order.orderId,
        prefill: {
          name: values.customerName,
          email: values.customerEmail,
          contact: values.customerPhone,
        },
        notes: {
          bookingId: booking._id,
          businessId: booking.businessId,
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyRazorpayPayment.mutateAsync({
              bookingId: booking._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        },
        modal: {
          ondismiss: () => reject(new Error('Payment cancelled')),
        },
      });

      checkout.open();
    });
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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-blush-100 text-brand-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-5 font-display text-2xl font-semibold text-brand-900">Booking requested</h1>
          <p className="mt-2 text-sm text-brand-800/60">
            Your appointment request has been sent to {business.name}.
          </p>
          {confirmedBooking && (
            <div className="mt-5 rounded-lg border border-brand-100 bg-brand-50 p-4 text-left text-sm">
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
          <Link to={`/b/${business.slug}`} className="text-sm font-medium text-blush-100/80 hover:text-white">
            Back to profile
          </Link>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight text-white">
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
                  const nextService = business.services.find(
                    (service) => service._id === event.target.value,
                  );
                  trackEvent({
                    eventType: 'booking_intent',
                    businessId: business._id,
                    businessSlug: business.slug,
                    serviceId: nextService?._id,
                    serviceName: nextService?.name,
                    category: business.category,
                    city: business.city,
                    area: business.area,
                    pincode: business.pincode,
                    metadata: {
                      source: 'service_select',
                    },
                  });
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
              <div className="grid gap-3 rounded-lg border border-brand-100 bg-white p-4 lg:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('pay_later')}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                    paymentMethod === 'pay_later'
                      ? 'border-brand-700 bg-brand-700 text-white'
                      : 'border-brand-100 bg-brand-50 text-brand-800 hover:bg-white'
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
                      ? 'border-gold-700 bg-gold-700 text-white'
                      : 'border-brand-100 bg-brand-50 text-brand-800 hover:bg-white'
                  }`}
                >
                  <CreditCard className="mt-0.5 h-5 w-5" />
                  <span>
                    <span className="block text-sm font-semibold">Demo online payment</span>
                    <span className="mt-1 block text-xs opacity-80">Mark ₹{selectedService.price} as paid.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-brand-100 bg-brand-50 text-brand-800 hover:bg-white'
                  }`}
                >
                  <CreditCard className="mt-0.5 h-5 w-5" />
                  <span>
                    <span className="block text-sm font-semibold">Razorpay checkout</span>
                    <span className="mt-1 block text-xs opacity-80">Pay securely with UPI, card, or net banking.</span>
                  </span>
                </button>
              </div>
            )}

            <div>
              <p className="mb-2 text-sm font-medium text-brand-900">Available times</p>
              {slotsLoading ? (
                <Spinner />
              ) : slots.length === 0 ? (
                <p className="rounded-lg bg-brand-50 p-4 text-sm text-brand-800/60">
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
                demoCheckout.isPending ||
                createRazorpayOrder.isPending ||
                verifyRazorpayPayment.isPending
              }
            >
              {paymentMethod === 'demo_card'
                ? 'Book and pay demo'
                : paymentMethod === 'card'
                  ? 'Book and pay with Razorpay'
                  : 'Request booking'}
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default PublicBookingPage;
