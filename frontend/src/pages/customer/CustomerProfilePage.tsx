import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { LocateFixed, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '../../hooks/useCustomerProfile';
import { searchAddresses, GeocodingResult } from '../../api/geocoding.api';
import { Button, Card, Input, Spinner } from '../../components/ui';

interface FormValues {
  phone?: string;
  city?: string;
  area?: string;
  pincode?: string;
}

const CustomerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useCustomerProfile();
  const updateProfile = useUpdateCustomerProfile();
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<GeocodingResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const { register, handleSubmit, reset, setValue } = useForm<FormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || '',
        city: profile.city || '',
        area: profile.area || '',
        pincode: profile.pincode || '',
      });
      if (profile.location?.coordinates?.length === 2) {
        setSelectedLocation({
          label: [profile.area, profile.city, profile.pincode].filter(Boolean).join(', '),
          lng: profile.location.coordinates[0],
          lat: profile.location.coordinates[1],
          city: profile.city,
          area: profile.area,
          pincode: profile.pincode,
        });
      }
    }
  }, [profile, reset]);

  const handleAddressSearch = async () => {
    try {
      setIsSearchingAddress(true);
      const results = await searchAddresses(addressQuery);
      setAddressResults(results);
      if (results.length === 0) toast.error('No address matches found');
    } catch {
      toast.error('Address search failed');
    } finally {
      setIsSearchingAddress(false);
    }
  };

  const chooseAddress = (result: GeocodingResult) => {
    setSelectedLocation(result);
    setAddressResults([]);
    setValue('city', result.city || '');
    setValue('area', result.area || '');
    setValue('pincode', result.pincode || '');
  };

  const submitProfile = (values: FormValues) => {
    updateProfile.mutate({
      ...values,
      location: selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
        : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center app-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
        <div className="mb-6">
          <h1 className="font-display text-4xl font-semibold text-brand-900">Customer profile</h1>
          <p className="mt-2 text-sm text-brand-800/60">
            Keep your location updated so marketplace results stay relevant.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="mesh-panel">
            <form
              onSubmit={handleSubmit(submitProfile)}
              className="space-y-4"
            >
              <div className="rounded-lg border border-brand-100 bg-white p-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Find your address
                </label>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    value={addressQuery}
                    onChange={(event) => setAddressQuery(event.target.value)}
                    placeholder="Search with area, city, pincode"
                    leftIcon={<MapPin className="h-4 w-4" />}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    isLoading={isSearchingAddress}
                    leftIcon={<LocateFixed className="h-4 w-4" />}
                    onClick={handleAddressSearch}
                  >
                    Search
                  </Button>
                </div>
                {addressResults.length > 0 && (
                    <div className="mt-3 divide-y divide-brand-100 rounded-lg border border-brand-100 bg-white">
                    {addressResults.map((result) => (
                      <button
                        key={`${result.lat}-${result.lng}`}
                        type="button"
                        onClick={() => chooseAddress(result)}
                        className="block w-full px-3 py-2 text-left text-sm text-brand-800/70 hover:bg-brand-50"
                      >
                        {result.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Input label="Phone" {...register('phone')} />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input label="City" {...register('city')} />
                <Input label="Area" {...register('area')} />
                <Input label="Pincode" {...register('pincode')} />
              </div>
              <Button type="submit" isLoading={updateProfile.isPending}>
                Save profile
              </Button>
            </form>
          </Card>

          <Card>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blush-100 text-brand-600">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-brand-900">{user?.name}</h2>
            <p className="mt-1 text-sm text-brand-800/60">{user?.email}</p>
            <div className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-800/70">
              {[profile?.area, profile?.city, profile?.pincode]
                .filter(Boolean)
                .join(', ') || 'No location saved yet'}
            </div>
            {selectedLocation && (
              <div className="mt-3 rounded-lg bg-blush-100 p-3 text-xs text-brand-800">
                Coordinates saved: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </div>
            )}
          </Card>
        </div>
    </div>
  );
};

export default CustomerProfilePage;
