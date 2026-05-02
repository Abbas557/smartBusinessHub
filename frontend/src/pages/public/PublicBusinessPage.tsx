import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
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

  return (
    <div className="min-h-screen app-surface">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <p className="text-sm font-semibold text-slate-900">Smart Business Hub</p>
          <Link to={`/b/${business.slug}/book`}>
            <Button size="sm" leftIcon={<ArrowRight className="h-4 w-4" />}>
              Book now
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-5 py-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {business.bannerUrl && (
            <div className="h-56 overflow-hidden">
              <img
                src={business.bannerUrl}
                alt={`${business.name} banner`}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div className="dark-grid p-8 text-white lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              {business.logoUrl && (
                <img
                  src={business.logoUrl}
                  alt={`${business.name} logo`}
                  className="h-20 w-20 rounded-lg border border-white/20 bg-white object-contain p-2"
                />
              )}
              <div>
                <Badge variant="blue">{business.category}</Badge>
                <h1 className="mt-4 max-w-3xl text-5xl font-bold tracking-tight">{business.name}</h1>
              </div>
            </div>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
              {business.description || 'A local business ready to take bookings online.'}
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm text-slate-200">
              {business.city && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <MapPin className="h-4 w-4" />
                  {business.city}
                </span>
              )}
              {business.phone && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
                  <Phone className="h-4 w-4" />
                  {business.phone}
                </span>
              )}
            </div>
            <Link to={`/b/${business.slug}/book`} className="mt-8 inline-flex">
              <Button size="lg" variant="secondary" leftIcon={<ArrowRight className="h-4 w-4" />}>
                Reserve your visit
              </Button>
            </Link>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="mesh-panel">
            <h2 className="text-lg font-semibold text-slate-900">Services</h2>
            <div className="mt-4 divide-y divide-slate-100">
              {business.services.map((service) => (
                <div key={service._id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-slate-900">{service.name}</p>
                    <p className="text-sm text-slate-500">
                      {service.durationMinutes} min
                      {service.description ? ` · ${service.description}` : ''}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">₹{service.price}</p>
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
            <Link to={`/b/${business.slug}/book`} className="mt-6 block">
              <Button className="w-full">Choose a time</Button>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PublicBusinessPage;
