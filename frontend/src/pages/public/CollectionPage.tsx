import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Building2,
  CalendarDays,
  CalendarHeart,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Stethoscope,
  Utensils,
  Wrench,
} from 'lucide-react';
import GooglePlaceLocationInput from '../../components/maps/GooglePlaceLocationInput';
import GoogleVendorMap from '../../components/maps/GoogleVendorMap';
import { Badge, Button, Card, Input, Select, Spinner } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { usePublicBusinesses } from '../../hooks/useBusiness';
import { useCustomerEvents } from '../../hooks/useCustomerEvents';
import { useCustomerProfile } from '../../hooks/useCustomerProfile';
import { useServiceCollection } from '../../hooks/useDiscovery';
import { Business, BusinessCategory } from '../../types';
import { hasGoogleMapsKey, ParsedGoogleAddress } from '../../lib/googleMaps';

const categoryLabels: Record<BusinessCategory, string> = {
  salon: 'Salon',
  gym: 'Fitness',
  restaurant: 'Food',
  clinic: 'Health',
  repair: 'Repair',
  tuition: 'Learning',
  other: 'Other',
};

const iconMap = {
  activity: Activity,
  'calendar-heart': CalendarHeart,
  dumbbell: Dumbbell,
  'graduation-cap': GraduationCap,
  'heart-pulse': HeartPulse,
  sparkles: Sparkles,
  stethoscope: Stethoscope,
  utensils: Utensils,
  wrench: Wrench,
};

const accentClasses: Record<string, string> = {
  burgundy: 'from-brand-950 via-brand-900 to-brand-600',
  clay: 'from-[#3a1614] via-[#8f3435] to-[#d47c65]',
  gold: 'from-[#3a2314] via-[#8d5f22] to-gold-500',
  rose: 'from-brand-900 via-brand-600 to-blush-300',
  sage: 'from-[#243027] via-[#78937d] to-[#dbe9df]',
};

const readNumberParam = (
  searchParams: URLSearchParams,
  key: string,
): number | undefined => {
  const value = Number(searchParams.get(key));
  return Number.isFinite(value) ? value : undefined;
};

const getStartingPrice = (business: Business) => {
  const activePrices = business.services
    .filter((service) => service.isActive)
    .map((service) => service.price);

  if (activePrices.length === 0) return 0;
  return Math.min(...activePrices);
};

const CollectionPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const isCustomer = isAuthenticated && user?.role === 'CUSTOMER';
  const { data: profile } = useCustomerProfile(isCustomer);
  const { data: collection, isLoading: isCollectionLoading } = useServiceCollection(slug);
  const { trackEvent } = useCustomerEvents(isCustomer);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState<BusinessCategory | 'all'>(
    (searchParams.get('category') as BusinessCategory | 'all') || 'all',
  );
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [area, setArea] = useState(searchParams.get('area') || '');
  const [selectedPlace, setSelectedPlace] = useState<ParsedGoogleAddress | null>(
    () => {
      const lat = readNumberParam(searchParams, 'lat');
      const lng = readNumberParam(searchParams, 'lng');
      const label = searchParams.get('locationLabel');
      if (lat === undefined || lng === undefined || !label) return null;
      return {
        placeId: searchParams.get('placeId') || '',
        label,
        city: searchParams.get('city') || undefined,
        area: searchParams.get('area') || undefined,
        pincode: searchParams.get('pincode') || undefined,
        lat,
        lng,
      };
    },
  );
  const [radiusKm, setRadiusKm] = useState(Number(searchParams.get('radiusKm')) || 25);
  const [sort, setSort] = useState<'nearest' | 'top-rated' | 'most-booked'>(
    (searchParams.get('sort') as 'nearest' | 'top-rated' | 'most-booked') || 'nearest',
  );
  const collectionCategories = collection?.categories || [];
  const Icon = collection
    ? iconMap[collection.icon as keyof typeof iconMap] || Sparkles
    : Sparkles;
  const accent = collection
    ? accentClasses[collection.accent] || accentClasses.rose
    : accentClasses.rose;
  const profileCoordinates = profile?.location?.coordinates;
  const searchCoordinates: [number, number] | undefined = useMemo(() => {
    if (selectedPlace) return [selectedPlace.lng, selectedPlace.lat];
    return profileCoordinates?.length === 2 ? profileCoordinates : undefined;
  }, [profileCoordinates, selectedPlace]);
  const hasNearbySearch = Boolean(searchCoordinates?.length === 2);
  const selectedCity = selectedPlace?.city || city.trim() || profile?.city;
  const selectedArea = selectedPlace?.area || area.trim() || profile?.area;
  const selectedPincode = selectedPlace?.pincode || profile?.pincode;
  const selectedLocationLabel =
    selectedPlace?.label ||
    [selectedArea, selectedCity, selectedPincode].filter(Boolean).join(', ');
  const activeCategoryParam =
    category !== 'all'
      ? category
      : collectionCategories.length > 0
        ? collectionCategories.join(',')
        : 'all';

  useEffect(() => {
    if (!profile) return;
    setCity((value) => value || profile.city || '');
    setArea((value) => value || profile.area || '');
  }, [profile]);

  useEffect(() => {
    if (!collection) return;
    trackEvent({
      eventType: 'click_collection',
      collectionSlug: collection.slug,
      category: collection.categories[0],
      city: selectedCity || undefined,
      area: selectedArea || undefined,
      query: search.trim() || undefined,
      metadata: {
        source: 'collection_page',
        title: collection.title,
      },
    });
  }, [collection, search, selectedArea, selectedCity, trackEvent]);

  const params = useMemo(() => {
    const baseParams = {
      search: search.trim() || undefined,
      category: activeCategoryParam,
      city: selectedCity || undefined,
      area: selectedArea || undefined,
      pincode: selectedPincode || undefined,
      placeId: selectedPlace?.placeId || undefined,
      sort,
    };

    if (!hasNearbySearch || !searchCoordinates) return baseParams;

    return {
      ...baseParams,
      lng: searchCoordinates[0],
      lat: searchCoordinates[1],
      radiusKm,
    };
  }, [
    activeCategoryParam,
    hasNearbySearch,
    radiusKm,
    search,
    searchCoordinates,
    selectedArea,
    selectedCity,
    selectedPincode,
    selectedPlace?.placeId,
    sort,
  ]);
  const { data: businesses = [], isLoading: areBusinessesLoading } = usePublicBusinesses(
    params,
    Boolean(collection),
  );
  const businessesWithCoordinates = businesses.filter(
    (business) => business.location?.coordinates?.length === 2,
  );
  const categoryOptions = useMemo(
    () => [
      { value: 'all', label: 'All in collection' },
      ...collectionCategories.map((item) => ({
        value: item,
        label: categoryLabels[item],
      })),
    ],
    [collectionCategories],
  );

  if (isCollectionLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Card className="text-center">
          <h1 className="font-display text-2xl font-semibold text-brand-900">
            Collection not found
          </h1>
          <p className="mt-2 text-sm text-brand-800/60">
            This explore collection is not available right now.
          </p>
          <Link to="/marketplace" className="mt-5 inline-flex">
            <Button leftIcon={<ArrowLeft className="h-4 w-4" />}>Back to marketplace</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-6">
      <section className="overflow-hidden rounded-lg border border-brand-100 bg-white shadow-soft">
        <div className={`relative overflow-hidden bg-gradient-to-br ${accent} p-8 text-white lg:p-10`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.24),transparent_28%),radial-gradient(circle_at_82%_22%,rgba(247,217,214,0.2),transparent_28%)]" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <Link
                to="/marketplace"
                className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-white/18 transition hover:bg-white/18"
              >
                <ArrowLeft className="h-4 w-4" />
                Marketplace
              </Link>
              <div className="mt-7 flex h-14 w-14 items-center justify-center rounded-lg bg-white/16 ring-1 ring-white/20">
                <Icon className="h-7 w-7" />
              </div>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-semibold tracking-tight lg:text-6xl">
                {collection.title}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/82">
                {collection.description || collection.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {collectionCategories.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold capitalize ring-1 ring-white/15"
                  >
                    {categoryLabels[item]}
                  </span>
                ))}
                <span className="rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15">
                  {radiusKm} km nearby
                </span>
              </div>
            </div>
            <Card className="bg-white/12 text-white ring-1 ring-white/15 backdrop-blur" padding={false}>
              <div className="p-5">
                <ShieldCheck className="h-6 w-6 text-blush-100" />
                <h2 className="mt-4 font-display text-2xl font-semibold">
                  Close-by results only
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Choose a Google place, radius, category, and search term to narrow this collection to nearby services.
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid gap-3 border-t border-brand-100 bg-white p-4 md:grid-cols-[minmax(0,1fr)_170px_minmax(240px,1fr)_140px_170px]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search within this collection"
            leftIcon={<Search className="h-4 w-4" />}
          />
          <Select
            value={category}
            onChange={(event) => setCategory(event.target.value as BusinessCategory | 'all')}
            options={categoryOptions}
          />
          <GooglePlaceLocationInput
            value={selectedLocationLabel}
            onSelect={(place) => {
              setSelectedPlace(place);
              setCity(place.city || '');
              setArea(place.area || '');
            }}
            onClear={() => {
              setSelectedPlace(null);
              setCity('');
              setArea('');
            }}
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="yellow">Collection results</Badge>
          <h2 className="mt-2 font-display text-2xl font-semibold text-brand-900">
            Services available near you
          </h2>
          <p className="text-sm text-brand-800/60">
            {businesses.length} published profiles found
            {hasNearbySearch ? ` within ${radiusKm} km` : ' after you select or save a location'}
          </p>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-lg border border-brand-100 bg-white px-3 py-2 text-sm text-brand-800/60">
          <SlidersHorizontal className="h-4 w-4" />
          Sorted by {sort.replace('-', ' ')}
        </div>
      </div>

      {businessesWithCoordinates.length > 0 && (
        <Card className="overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="relative min-h-[280px] overflow-hidden bg-blush-100">
              {hasGoogleMapsKey() ? (
                <GoogleVendorMap
                  businesses={businessesWithCoordinates}
                  customerCoordinates={searchCoordinates}
                  className="min-h-[280px]"
                />
              ) : (
                <div className="flex min-h-[280px] items-center justify-center bg-brand-50 text-sm text-brand-800/60">
                  Add a Google Maps key to enable the live collection map.
                </div>
              )}
            </div>
            <div className="bg-brand-900 p-5 text-white">
              <h2 className="font-display text-2xl font-semibold">Nearby map</h2>
              <p className="mt-2 text-sm leading-6 text-blush-100/75">
                Collection vendors are plotted from saved coordinates and filtered by your selected radius.
              </p>
              <div className="mt-4 space-y-2">
                {businessesWithCoordinates.slice(0, 5).map((business) => (
                  <Link
                    key={business._id}
                    to={`/b/${business.slug}`}
                    className="flex items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-sm hover:bg-white/15"
                  >
                    <span>{business.name}</span>
                    <span className="text-slate-300">
                      {typeof business.distanceKm === 'number'
                        ? `${business.distanceKm} km`
                        : 'View'}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {areBusinessesLoading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : businesses.length === 0 ? (
        <Card className="text-center">
          <h3 className="font-display text-xl font-semibold text-brand-900">
            No nearby services found
          </h3>
          <p className="mt-2 text-sm text-brand-800/60">
            Try a wider radius, a nearby landmark, or a broader search term.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {businesses.map((business) => (
            <Card
              key={business._id}
              className="group overflow-hidden p-0 transition-shadow hover:shadow-soft"
            >
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
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-brand-100 bg-white">
                      {business.logoUrl ? (
                        <img
                          src={business.logoUrl}
                          alt={`${business.name} logo`}
                          className="h-full w-full rounded-lg object-contain p-1.5"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-brand-800/55" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-brand-900">{business.name}</h3>
                      <p className="text-sm capitalize text-brand-800/55">
                        {categoryLabels[business.category]}
                      </p>
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
                      ₹{getStartingPrice(business)}
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
                      <Navigation className="h-3.5 w-3.5" />
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
                    <Button variant="secondary" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Link to={`/b/${business.slug}/book`}>
                    <Button
                      className="w-full"
                      leftIcon={<CalendarDays className="h-4 w-4" />}
                      onClick={() =>
                        trackEvent({
                          eventType: 'booking_intent',
                          businessId: business._id,
                          businessSlug: business.slug,
                          category: business.category,
                          city: business.city,
                          area: business.area,
                          pincode: business.pincode,
                          metadata: {
                            source: 'collection_card',
                            collectionSlug: collection.slug,
                          },
                        })
                      }
                    >
                      Book
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
