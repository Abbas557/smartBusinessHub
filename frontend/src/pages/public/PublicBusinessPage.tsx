import React from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { usePublicBusiness } from '../../hooks/useBusiness';
import { Badge, Button, Card, Spinner } from '../../components/ui';

const PublicBusinessPage: React.FC = () => {
  const { slug } = useParams();
  const { data: business, isLoading, isError } = usePublicBusiness(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !business) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="max-w-md text-center">
          <h1 className="text-xl font-semibold text-slate-900">Business not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This profile may be unpublished or the link may be incorrect.
          </p>
        </Card>
      </div>
    );
  }

  const openDays = Object.entries(business.hours || {}).filter(
    ([, hours]) => !hours.isClosed,
  );
  const activeServices = business.services.filter((service) => service.isActive);
  const startingPrice = Math.min(...activeServices.map((service) => service.price));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/marketplace" className="text-sm font-semibold text-slate-900">
            Smart Business Hub
          </Link>
          <Link to={`/b/${business.slug}/book`}>
            <Button size="sm" leftIcon={<ArrowRight className="h-4 w-4" />}>
              Book now
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
          <div className="relative min-h-[380px] overflow-hidden bg-slate-950">
            {business.bannerUrl ? (
              <img
                src={business.bannerUrl}
                alt={`${business.name} banner`}
                className="absolute inset-0 h-full w-full object-cover opacity-45"
              />
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.28),transparent_32%),linear-gradient(135deg,rgba(15,23,42,1),rgba(6,78,59,0.86))]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/45" />
            <div className="relative grid min-h-[380px] gap-8 p-8 text-white lg:grid-cols-[minmax(0,1fr)_360px] lg:p-10">
              <div className="flex flex-col justify-end">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border border-white/20 bg-white/95 shadow-lg">
                    {business.logoUrl ? (
                      <img
                        src={business.logoUrl}
                        alt={`${business.name} logo`}
                        className="h-full w-full rounded-lg object-contain p-2"
                      />
                    ) : (
                      <Sparkles className="h-8 w-8 text-emerald-700" />
                    )}
                  </div>
                  <div>
                    <Badge variant="blue">{business.category}</Badge>
                    <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight lg:text-6xl">
                      {business.name}
                    </h1>
                  </div>
                </div>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
                  {business.description || 'A local business ready to take bookings online.'}
                </p>
                <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-200">
                  {business.city && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                      <MapPin className="h-4 w-4" />
                      {[business.area, business.city].filter(Boolean).join(', ')}
                    </span>
                  )}
                  {business.phone && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                      <Phone className="h-4 w-4" />
                      {business.phone}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                    <ShieldCheck className="h-4 w-4" />
                    Verified booking profile
                  </span>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to={`/b/${business.slug}/book`} className="inline-flex">
                    <Button size="lg" variant="secondary" leftIcon={<CalendarDays className="h-4 w-4" />}>
                      Reserve your visit
                    </Button>
                  </Link>
                  <Link to="/marketplace" className="inline-flex">
                    <Button size="lg" variant="ghost" className="bg-white/10 text-white hover:bg-white/15">
                      Browse more vendors
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-lg border border-white/15 bg-white/10 p-5 backdrop-blur">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white/95 p-4 text-slate-950">
                      <Star className="h-5 w-5 text-amber-500" />
                      <p className="mt-3 text-2xl font-bold">4.8</p>
                      <p className="text-xs text-slate-500">Trust score</p>
                    </div>
                    <div className="rounded-lg bg-white/95 p-4 text-slate-950">
                      <CreditCard className="h-5 w-5 text-emerald-700" />
                      <p className="mt-3 text-2xl font-bold">
                        ₹{Number.isFinite(startingPrice) ? startingPrice : 0}
                      </p>
                      <p className="text-xs text-slate-500">Starting price</p>
                    </div>
                    <div className="rounded-lg bg-white/95 p-4 text-slate-950">
                      <CalendarDays className="h-5 w-5 text-emerald-700" />
                      <p className="mt-3 text-2xl font-bold">{activeServices.length}</p>
                      <p className="text-xs text-slate-500">Live services</p>
                    </div>
                    <div className="rounded-lg bg-white/95 p-4 text-slate-950">
                      <CheckCircle2 className="h-5 w-5 text-emerald-700" />
                      <p className="mt-3 text-2xl font-bold">{business.totalBookings}</p>
                      <p className="text-xs text-slate-500">Bookings served</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Transparent services', 'Review pricing, duration, and inclusions before choosing.'],
            ['Live slot selection', 'Pick from available appointment times and avoid back-and-forth.'],
            ['Flexible payment', 'Pay online in demo mode or reserve now and pay at the venue.'],
          ].map(([title, copy]) => (
            <Card key={title} className="mesh-panel">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <h2 className="mt-3 font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
            </Card>
          ))}
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="mesh-panel">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Choose a service</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Prices and durations are published by the vendor.
                </p>
              </div>
              <Badge variant="green">{activeServices.length} available</Badge>
            </div>
            <div className="mt-5 grid gap-3">
              {activeServices.map((service) => (
                <div
                  key={service._id}
                  className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div>
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-500">
                      {service.durationMinutes} min
                      {service.description ? ` · ${service.description}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:justify-end">
                    <p className="font-semibold text-slate-900">₹{service.price}</p>
                    <Link to={`/b/${business.slug}/book?service=${service._id}`}>
                      <Button size="sm">Book</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="h-fit">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <h2 className="text-lg font-semibold text-slate-900">Hours</h2>
            </div>
            <div className="mt-4 space-y-2">
              {openDays.map(([day, hours]) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="capitalize text-slate-500">{day}</span>
                  <span className="font-medium text-slate-800">
                    {hours.open} - {hours.close}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
              Select a service first, then choose a live slot and payment option.
            </div>
            <Link to={`/b/${business.slug}/book`} className="mt-4 block">
              <Button className="w-full">Choose a time</Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PublicBusinessPage;
