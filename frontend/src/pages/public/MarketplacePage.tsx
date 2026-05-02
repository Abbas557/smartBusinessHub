import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  MapPin,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { usePublicBusinesses } from '../../hooks/useBusiness';
import { BusinessCategory } from '../../types';
import { Badge, Button, Card, Input, Select, Spinner } from '../../components/ui';

const categories: Array<{ value: BusinessCategory | 'all'; label: string }> = [
  { value: 'all', label: 'All categories' },
  { value: 'salon', label: 'Salon' },
  { value: 'gym', label: 'Gym' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'repair', label: 'Repair' },
  { value: 'tuition', label: 'Tuition' },
  { value: 'other', label: 'Other' },
];

const MarketplacePage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<BusinessCategory | 'all'>('all');
  const [city, setCity] = useState('');

  const params = useMemo(
    () => ({
      search: search.trim() || undefined,
      category,
      city: city.trim() || undefined,
    }),
    [category, city, search],
  );

  const { data: businesses = [], isLoading } = usePublicBusinesses(params);

  return (
    <div className="min-h-screen app-surface">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link to="/marketplace" className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Building2 className="h-4 w-4" />
            </span>
            Smart Business Hub
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="sm">Owner login</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="dark-grid p-8 text-white lg:p-10">
            <Badge variant="blue">Customer marketplace</Badge>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight lg:text-5xl">
              Discover nearby businesses and book the right service in minutes.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
              Browse published vendors, compare services, check prices, and reserve a time without calling around.
            </p>
          </div>
          <div className="grid gap-3 border-t border-slate-200 bg-white p-4 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search services, vendors, or keywords"
              leftIcon={<Search className="h-4 w-4" />}
            />
            <Select
              value={category}
              onChange={(event) => setCategory(event.target.value as BusinessCategory | 'all')}
              options={categories}
            />
            <Input
              value={city}
              onChange={(event) => setCity(event.target.value)}
              placeholder="City"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </section>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Available vendors</h2>
            <p className="text-sm text-slate-500">{businesses.length} published profiles found</p>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 sm:flex">
            <SlidersHorizontal className="h-4 w-4" />
            Sorted by activity
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : businesses.length === 0 ? (
          <Card className="text-center">
            <h3 className="text-lg font-semibold text-slate-900">No vendors found</h3>
            <p className="mt-2 text-sm text-slate-500">
              Try a different city, service, or category.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {businesses.map((business) => {
              const startingPrice = Math.min(
                ...business.services.filter((service) => service.isActive).map((service) => service.price),
              );
              return (
                <Card key={business._id} className="group overflow-hidden p-0 transition-shadow hover:shadow-lg">
                  <div className="h-36 bg-slate-200">
                    {business.bannerUrl ? (
                      <img
                        src={business.bannerUrl}
                        alt={`${business.name} banner`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="dark-grid flex h-full items-center justify-center">
                        <Building2 className="h-10 w-10 text-white/70" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white">
                          {business.logoUrl ? (
                            <img src={business.logoUrl} alt={`${business.name} logo`} className="h-full w-full rounded-lg object-contain p-1.5" />
                          ) : (
                            <Building2 className="h-5 w-5 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{business.name}</h3>
                          <p className="text-sm capitalize text-slate-500">{business.category}</p>
                        </div>
                      </div>
                      <Badge variant="green">Live</Badge>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-500">
                      {business.description || 'Online bookings are open for this business.'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-500">From</p>
                        <p className="font-semibold text-slate-900">
                          ₹{Number.isFinite(startingPrice) ? startingPrice : 0}
                        </p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-500">Services</p>
                        <p className="font-semibold text-slate-900">{business.services.length}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {business.city && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {business.city}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
                        <Star className="h-3.5 w-3.5" />
                        Popular
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link to={`/b/${business.slug}`}>
                        <Button variant="secondary" className="w-full">View</Button>
                      </Link>
                      <Link to={`/b/${business.slug}/book`}>
                        <Button className="w-full" leftIcon={<CalendarDays className="h-4 w-4" />}>
                          Book
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          {[
            ['Browse', 'Search vendors by city, service, category, or price range.'],
            ['Compare', 'Open each profile to review services, hours, and business details.'],
            ['Book and pay', 'Choose a service, select an available slot, then pay online or at the venue.'],
          ].map(([title, copy], index) => (
            <Card key={title} className="mesh-panel">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{copy}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-slate-400" />
            </Card>
          ))}
        </section>
      </main>
    </div>
  );
};

export default MarketplacePage;
