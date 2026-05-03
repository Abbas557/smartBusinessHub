import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  useCustomerProfile,
  useUpdateCustomerProfile,
} from '../../hooks/useCustomerProfile';
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
  const { register, handleSubmit, reset } = useForm<FormValues>();

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || '',
        city: profile.city || '',
        area: profile.area || '',
        pincode: profile.pincode || '',
      });
    }
  }, [profile, reset]);

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
          <h1 className="text-3xl font-bold text-slate-900">Customer profile</h1>
          <p className="mt-2 text-sm text-slate-500">
            Keep your location updated so marketplace results stay relevant.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card className="mesh-panel">
            <form
              onSubmit={handleSubmit((values) => updateProfile.mutate(values))}
              className="space-y-4"
            >
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
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
              <MapPin className="h-5 w-5" />
            </div>
            <h2 className="mt-4 font-semibold text-slate-900">{user?.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{user?.email}</p>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              {[profile?.area, profile?.city, profile?.pincode]
                .filter(Boolean)
                .join(', ') || 'No location saved yet'}
            </div>
          </Card>
        </div>
    </div>
  );
};

export default CustomerProfilePage;
