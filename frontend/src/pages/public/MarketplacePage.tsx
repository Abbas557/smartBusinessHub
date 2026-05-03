import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Gem,
  Heart,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { usePublicBusinesses } from '../../hooks/useBusiness';
import { useAuth } from '../../context/AuthContext';
import {
  useCustomerProfile,
  useSaveBusiness,
  useUnsaveBusiness,
} from '../../hooks/useCustomerProfile';
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
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const { data: profile } = useCustomerProfile(isCustomer);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<BusinessCategory | 'all'>('all');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [radiusKm, setRadiusKm] = useState(25);
  const [sort, setSort] = useState<'nearest' | 'top-rated' | 'most-booked'>('nearest');
  const saveBusiness = useSaveBusiness();
  const unsaveBusiness = useUnsaveBusiness();

  useEffect(() => {
    if (!isCustomer || !profile) return;
    setCity((value) => value || profile.city || '');
    setArea((value) => value || profile.area || '');
  }, [isCustomer, profile]);

  const nearbyCoordinates = profile?.location?.coordinates;
  const hasNearbySearch = Boolean(isCustomer && nearbyCoordinates?.length === 2);

  const params = useMemo(() => {
    const baseParams = {
      search: search.trim() || undefined,
      category,
      city: city.trim() || undefined,
      area: area.trim() || undefined,
      sort,
    };

    if (!hasNearbySearch || !nearbyCoordinates) return baseParams;

    return {
      ...baseParams,
      lng: nearbyCoordinates[0],
      lat: nearbyCoordinates[1],
      radiusKm,
    };
  }, [area, category, city, hasNearbySearch, nearbyCoordinates, radiusKm, search, sort]);

  const { data: businesses = [], isLoading } = usePublicBusinesses(params);
  const savedBusinessIds = new Set(profile?.savedBusinessIds || []);
  const businessesWithCoordinates = businesses.filter(
    (business) => business.location?.coordinates?.length === 2,
  );
  const bounds = useMemo(() => {
    const coordinates = businessesWithCoordinates.map((business) => business.location!.coordinates);
    if (nearbyCoordinates?.length === 2) coordinates.push(nearbyCoordinates);
    const lngs = coordinates.map(([lng]) => lng);
    const lats = coordinates.map(([, lat]) => lat);
    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [businessesWithCoordinates, nearbyCoordinates]);

  const getPinStyle = (coordinates: [number, number]) => {
    const lngRange = Math.max(bounds.maxLng - bounds.minLng, 0.01);
    const latRange = Math.max(bounds.maxLat - bounds.minLat, 0.01);
    return {
      left: `${12 + ((coordinates[0] - bounds.minLng) / lngRange) * 76}%`,
      top: `${12 + ((bounds.maxLat - coordinates[1]) / latRange) * 76}%`,
    };
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6">
      <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-soft">
        <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="relative overflow-hidden bg-brand-900 p-8 text-white lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(247,217,214,0.32),transparent_30%),linear-gradient(135deg,rgba(43,23,21,0.96),rgba(130,37,45,0.86))]" />
            <div className="relative">
              <Badge variant="blue">Customer marketplace</Badge>
              <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-tight lg:text-5xl">
                Find the right local service without the back-and-forth.
            </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200">
                Compare trusted vendors near you, choose a service, reserve a slot, and pay in one clean flow.
            </p>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-200">
                {['Nearby vendors', 'Transparent prices', 'Instant booking'].map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-3 py-1.5">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between bg-blush-100 p-6">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Gem className="h-5 w-5" />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-brand-900">
                {hasNearbySearch && profile?.area
                  ? `Nearby picks around ${profile.area}`
                  : 'Curated for your area'}
              </h2>
              <p className="mt-2 text-sm leading-6 text-brand-800/70">
                {hasNearbySearch
                  ? `Showing vendors within ${radiusKm} km that also serve your location.`
                  : 'Set your customer profile location to unlock nearby vendor ranking.'}
              </p>
            </div>
            {!isCustomer && (
              <Link to="/customer/register" className="mt-5 block">
                <Button className="w-full">
                  Create customer account
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="grid gap-3 border-t border-brand-100 bg-white p-4 md:grid-cols-[minmax(0,1fr)_160px_160px_160px_140px_170px]">
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
            <Input
              value={area}
              onChange={(event) => setArea(event.target.value)}
              placeholder="Area"
              leftIcon={<MapPin className="h-4 w-4" />}
            />
            <Select
              value={String(radiusKm)}
              onChange={(event) => setRadiusKm(Number(event.target.value))}
              options={[
                { value: '5', label: '5 km' },
                { value: '10', label: '10 km' },
                { value: '25', label: '25 km' },
                { value: '50', label: '50 km' },
                { value: '100', label: '100 km' },
              ]}
              disabled={!hasNearbySearch}
            />
            <Select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value as 'nearest' | 'top-rated' | 'most-booked')
              }
              options={[
                { value: 'nearest', label: 'Nearest' },
                { value: 'top-rated', label: 'Top rated' },
                { value: 'most-booked', label: 'Most booked' },
              ]}
            />
        </div>
      </section>

      <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Available vendors</h2>
            <p className="text-sm text-brand-800/60">
              {businesses.length} published profiles found
              {hasNearbySearch ? ` within ${radiusKm} km` : ''}
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm text-brand-800/60 sm:flex">
            <SlidersHorizontal className="h-4 w-4" />
            Sorted by {sort.replace('-', ' ')}
          </div>
      </div>

      {businessesWithCoordinates.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative min-h-[280px] overflow-hidden bg-blush-100">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(168,52,61,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(184,147,79,0.09)_1px,transparent_1px)] bg-[size:42px_42px]" />
              {nearbyCoordinates?.length === 2 && (
                <div
                  className="absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-brand-900 px-3 py-1.5 text-xs font-semibold text-white shadow-lg"
                  style={getPinStyle(nearbyCoordinates)}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  You
                </div>
              )}
              {businessesWithCoordinates.slice(0, 16).map((business) => (
                <Link
                  key={business._id}
                  to={`/b/${business.slug}`}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-lg ring-1 ring-brand-200 hover:bg-brand-600 hover:text-white"
                  style={getPinStyle(business.location!.coordinates)}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {business.name}
                </Link>
              ))}
            </div>
            <div className="bg-brand-900 p-5 text-white">
              <h2 className="font-display text-2xl font-semibold">Vendor map</h2>
              <p className="mt-2 text-sm leading-6 text-blush-100/75">
                Pins use saved business coordinates. Distance labels use the marketplace location filter.
              </p>
              <div className="mt-4 space-y-2">
                {businessesWithCoordinates.slice(0, 5).map((business) => (
                  <a
                    key={business._id}
                    href={`https://www.openstreetmap.org/directions?to=${business.location!.coordinates[1]}%2C${business.location!.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                  >
                    <span>{business.name}</span>
                    <span className="text-slate-300">
                      {typeof business.distanceKm === 'number'
                        ? `${Math.round(business.distanceKm * 1.25)} km drive est.`
                        : 'Open route'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : businesses.length === 0 ? (
          <Card className="text-center">
            <h3 className="font-display text-xl font-semibold text-brand-900">No vendors found</h3>
            <p className="mt-2 text-sm text-brand-800/60">
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
                <Card key={business._id} className="group overflow-hidden p-0 transition-shadow hover:shadow-soft">
                  <div className="h-36 bg-brand-100">
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
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-brand-100 bg-white">
                          {business.logoUrl ? (
                            <img src={business.logoUrl} alt={`${business.name} logo`} className="h-full w-full rounded-lg object-contain p-1.5" />
                          ) : (
                            <Building2 className="h-5 w-5 text-brand-800/55" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-brand-900">{business.name}</h3>
                          <p className="text-sm capitalize text-brand-800/55">{business.category}</p>
                        </div>
                      </div>
                      <Badge variant="green">Live</Badge>
                    </div>

                    <p className="mt-4 line-clamp-2 text-sm leading-6 text-brand-800/60">
                      {business.description || 'Online bookings are open for this business.'}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-lg bg-brand-50 p-3">
                        <p className="text-brand-800/55">From</p>
                        <p className="font-semibold text-brand-900">
                          ₹{Number.isFinite(startingPrice) ? startingPrice : 0}
                        </p>
                      </div>
                      <div className="rounded-lg bg-brand-50 p-3">
                        <p className="text-brand-800/55">Services</p>
                        <p className="font-semibold text-brand-900">{business.services.length}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-brand-800/60">
                      {business.city && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2.5 py-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {[business.area, business.city].filter(Boolean).join(', ')}
                        </span>
                      )}
                      {typeof business.distanceKm === 'number' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blush-100 px-2.5 py-1 text-brand-700">
                          <MapPin className="h-3.5 w-3.5" />
                          {business.distanceKm} km away
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold-100 px-2.5 py-1 text-gold-700">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        {business.reviewCount
                          ? `${business.averageRating?.toFixed(1)} (${business.reviewCount})`
                          : 'New'}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-2">
                      <Link to={`/b/${business.slug}`}>
                        <Button variant="secondary" className="w-full">View</Button>
                      </Link>
                      <Button
                        variant="secondary"
                        className="w-full"
                        leftIcon={<Heart className={`h-4 w-4 ${savedBusinessIds.has(business._id) ? 'fill-current text-rose-500' : ''}`} />}
                        onClick={() => {
                          if (!isCustomer) return;
                          if (savedBusinessIds.has(business._id)) {
                            unsaveBusiness.mutate(business._id);
                          } else {
                            saveBusiness.mutate(business._id);
                          }
                        }}
                        disabled={!isCustomer}
                      >
                        {savedBusinessIds.has(business._id) ? 'Saved' : 'Save'}
                      </Button>
                      <Link to={`/b/${business.slug}/book`} className="col-span-2">
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
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                {index + 1}
              </div>
              <h3 className="mt-4 font-semibold text-brand-900">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-brand-800/60">{copy}</p>
              <ArrowRight className="mt-4 h-4 w-4 text-brand-800/40" />
            </Card>
          ))}
      </section>
    </div>
  );
};

export default MarketplacePage;
