import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '../../hooks/useCustomerProfile';
import GoogleAddressAutocomplete from '../../components/maps/GoogleAddressAutocomplete';
import { ParsedGoogleAddress } from '../../lib/googleMaps';
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
  const [selectedLocation, setSelectedLocation] = useState<ParsedGoogleAddress | null>(null);
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

  const chooseAddress = (result: ParsedGoogleAddress) => {
    setSelectedLocation(result);
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
              <GoogleAddressAutocomplete
                label="Find your address"
                defaultValue={selectedLocation?.label || ''}
                onSelect={chooseAddress}
              />
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
