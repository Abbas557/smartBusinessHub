import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Plus, Trash2, Globe, EyeOff, Clock, DollarSign, Building2, ListChecks, Code2, ImageUp, LocateFixed, MapPin } from 'lucide-react';
import {
  useMyBusiness,
  useCreateBusiness,
  useUpdateBusiness,
  usePublishBusiness,
  useAddService,
  useRemoveService,
  useUpdateHours,
} from '../../hooks/useBusiness';
import { useAssetUpload } from '../../hooks/useUpload';
import { searchAddresses, GeocodingResult } from '../../api/geocoding.api';
import {
  Button, Input, Textarea, Select, Card, Badge,
  Modal, Spinner, EmptyState,
} from '../../components/ui';
import { BusinessCategory, Service } from '../../types';

// ─── Tab Navigation ───────────────────────────────────────────────────────────

type Tab = 'profile' | 'services' | 'hours';

const TABS: { id: Tab; label: string }[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'services', label: 'Services' },
  { id: 'hours', label: 'Business Hours' },
];

const CATEGORY_OPTIONS = [
  { value: '', label: 'Select a category' },
  { value: 'salon', label: 'Salon / Beauty' },
  { value: 'gym', label: 'Gym / Fitness' },
  { value: 'restaurant', label: 'Restaurant / Cafe' },
  { value: 'clinic', label: 'Clinic / Healthcare' },
  { value: 'repair', label: 'Repair Shop' },
  { value: 'tuition', label: 'Tuition / Coaching' },
  { value: 'other', label: 'Other' },
];

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const;

// ─── Profile Form ─────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name:        z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  category:    z.string().optional(),
  phone:       z.string().optional(),
  address:     z.string().optional(),
  city:        z.string().optional(),
  area:        z.string().optional(),
  pincode:     z.string().optional(),
  galleryText: z.string().optional(),
});
type ProfileFormValues = z.infer<typeof profileSchema>;

const ProfileTab: React.FC = () => {
  const { data: business } = useMyBusiness();
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();
  const publishBusiness = usePublishBusiness();
  const uploadAsset = useAssetUpload();
  const [addressQuery, setAddressQuery] = useState('');
  const [addressResults, setAddressResults] = useState<GeocodingResult[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(
    business?.location?.coordinates?.length === 2
      ? {
          label: [business.area, business.city, business.pincode].filter(Boolean).join(', '),
          lng: business.location.coordinates[0],
          lat: business.location.coordinates[1],
          city: business.city,
          area: business.area,
          pincode: business.pincode,
        }
      : null,
  );
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  const isNew = !business;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } =
    useForm<ProfileFormValues>({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        name:        business?.name || '',
        description: business?.description || '',
        category:    business?.category || '',
        phone:       business?.phone || '',
        address:     business?.address || '',
        city:        business?.city || '',
        area:        business?.area || '',
        pincode:     business?.pincode || '',
        galleryText: (business?.galleryUrls || []).join('\n'),
      },
    });

  const onSubmit = async (values: ProfileFormValues) => {
    const { galleryText, ...profileValues } = values;
    const galleryUrls = galleryText
      ?.split('\n')
      .map((url) => url.trim())
      .filter(Boolean);
    const payload = {
      ...profileValues,
      galleryUrls,
      location: selectedLocation
        ? { lat: selectedLocation.lat, lng: selectedLocation.lng }
        : undefined,
    };

    if (isNew) {
      await createBusiness.mutateAsync(payload);
    } else {
      await updateBusiness.mutateAsync(payload);
    }
  };

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

  const handleAssetUpload = async (
    assetType: 'logo' | 'banner',
    file: File | undefined,
  ) => {
    if (!business || !file) return;
    const publicUrl = await uploadAsset.mutateAsync({ assetType, file });
    await updateBusiness.mutateAsync(
      assetType === 'logo'
        ? { logoUrl: publicUrl }
        : { bannerUrl: publicUrl },
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
      {/* Publish status bar */}
      {business && (
        <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={business.isPublished ? 'green' : 'yellow'}>
              {business.isPublished ? 'Published' : 'Draft'}
            </Badge>
            <span className="text-sm text-slate-600">
              {business.isPublished
                ? `Public at /b/${business.slug}`
                : 'Not visible to customers yet'}
            </span>
          </div>
          <Button
            variant={business.isPublished ? 'secondary' : 'primary'}
            size="sm"
            isLoading={publishBusiness.isPending}
            leftIcon={business.isPublished ? <EyeOff className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            onClick={() => publishBusiness.mutate({ publish: !business.isPublished })}
          >
            {business.isPublished ? 'Unpublish' : 'Publish Profile'}
          </Button>
        </div>
      )}

      {/* Form */}
      <Card>
        <h2 className="text-base font-semibold text-slate-900 mb-5">
          {isNew ? 'Create Your Business' : 'Edit Profile'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Business Name"
            placeholder="Priya Beauty Salon"
            required
            error={errors.name?.message}
            {...register('name')}
          />
          <Textarea
            label="Description"
            placeholder="Tell customers what makes your business special..."
            error={errors.description?.message}
            {...register('description')}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              options={CATEGORY_OPTIONS}
              {...register('category')}
            />
            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              {...register('phone')}
            />
          </div>
          <Input
            label="Address"
            placeholder="123 MG Road"
            {...register('address')}
          />
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Map coordinates
            </label>
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
              <Input
                value={addressQuery}
                onChange={(event) => setAddressQuery(event.target.value)}
                placeholder="Search full business address"
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
              <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
                {addressResults.map((result) => (
                  <button
                    key={`${result.lat}-${result.lng}`}
                    type="button"
                    onClick={() => chooseAddress(result)}
                    className="block w-full px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            )}
            {selectedLocation && (
              <p className="mt-3 text-xs text-emerald-700">
                Coordinates selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="City"
              placeholder="Lucknow"
              {...register('city')}
            />
            <Input
              label="Area"
              placeholder="Gomti Nagar"
              {...register('area')}
            />
            <Input
              label="Pincode"
              placeholder="226010"
              {...register('pincode')}
            />
          </div>
          <Textarea
            label="Gallery photo URLs"
            placeholder="Paste one public image URL per line"
            {...register('galleryText')}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSubmitting}>
              {isNew ? 'Create Business' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
      {business && (
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <ImageUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">Brand assets</h2>
              <p className="text-sm text-slate-500">Upload a logo and banner via S3.</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-slate-100">
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt="Business logo" className="max-h-20 rounded-md" />
                ) : (
                  <span className="text-sm text-slate-400">No logo</span>
                )}
              </div>
              <Input
                label="Logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  handleAssetUpload('logo', event.target.files?.[0])
                }
              />
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex h-24 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                {business.bannerUrl ? (
                  <img src={business.bannerUrl} alt="Business banner" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm text-slate-400">No banner</span>
                )}
              </div>
              <Input
                label="Banner"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) =>
                  handleAssetUpload('banner', event.target.files?.[0])
                }
              />
            </div>
          </div>

          {uploadAsset.isPending && (
            <p className="mt-3 text-sm text-slate-500">Uploading asset to S3...</p>
          )}
        </Card>
      )}
      </div>

      <Card className="h-fit">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Building2 className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">Profile quality</h3>
        <p className="mt-1 text-sm text-slate-500">
          Customers see this information before booking. Keep the description short, services clear, and hours current.
        </p>
        <div className="mt-5 space-y-3">
          {[
            { label: 'Business details', done: Boolean(business?.name) },
            { label: 'Services added', done: Boolean(business?.services?.length) },
            { label: 'Ready to publish', done: Boolean(business?.isPublished) },
          ].map(({ label, done }) => (
            <div key={label} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{label}</span>
              <Badge variant={done ? 'green' : 'gray'}>{done ? 'Done' : 'Open'}</Badge>
            </div>
          ))}
        </div>
        {business?.isPublished && (
          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-950 p-4 text-white">
            <div className="mb-3 flex items-center gap-2">
              <Code2 className="h-4 w-4 text-teal-300" />
              <p className="text-sm font-semibold">Booking widget</p>
            </div>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-slate-200">{`<script
  src="${window.location.origin}/smart-hub-widget.js"
  data-business="${business.slug}">
</script>`}</pre>
          </div>
        )}
      </Card>
    </div>
  );
};

// ─── Service Form Modal ───────────────────────────────────────────────────────

const serviceSchema = z.object({
  name:            z.string().min(1, 'Service name is required').max(100),
  durationMinutes: z.coerce.number().min(5).max(480),
  price:           z.coerce.number().min(0),
  description:     z.string().max(300).optional(),
});
type ServiceFormValues = z.infer<typeof serviceSchema>;

const ServiceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const addService = useAddService();
  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ServiceFormValues>({ resolver: zodResolver(serviceSchema) });

  const onSubmit = async (values: ServiceFormValues) => {
    await addService.mutateAsync(values);
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Service">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Service Name"
          placeholder="Haircut, Facial, Full Body Massage..."
          required
          error={errors.name?.message}
          {...register('name')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Duration (minutes)"
            type="number"
            min={5}
            max={480}
            placeholder="60"
            required
            error={errors.durationMinutes?.message}
            {...register('durationMinutes')}
          />
          <Input
            label="Price (₹)"
            type="number"
            min={0}
            placeholder="500"
            required
            error={errors.price?.message}
            {...register('price')}
          />
        </div>
        <Textarea
          label="Description (optional)"
          placeholder="Brief description of the service..."
          {...register('description')}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" isLoading={addService.isPending}>Add Service</Button>
        </div>
      </form>
    </Modal>
  );
};

// ─── Services Tab ─────────────────────────────────────────────────────────────

const ServicesTab: React.FC = () => {
  const { data: business } = useMyBusiness();
  const removeService = useRemoveService();
  const [modalOpen, setModalOpen] = useState(false);

  if (!business) {
    return (
      <Card>
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="Create your business first"
          description="Set up your profile before adding services."
        />
      </Card>
    );
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Services</h2>
          <p className="text-sm text-slate-500">{business.services.length} service{business.services.length !== 1 ? 's' : ''}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
          Add Service
        </Button>
      </div>

      {business.services.length === 0 ? (
        <Card>
          <EmptyState
            icon={<DollarSign className="w-8 h-8" />}
            title="No services yet"
            description="Add the services you offer so customers can book them."
            action={
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                Add First Service
              </Button>
            }
          />
        </Card>
      ) : (
        <Card padding={false}>
          <ul className="divide-y divide-gray-100">
            {business.services.map((service) => (
              <li key={service._id} className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{service.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {service.durationMinutes} min
                    {service.description && ` · ${service.description}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-sm font-semibold text-slate-900">₹{service.price}</span>
                  <button
                    onClick={() => removeService.mutate(service._id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove service"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <ServiceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};

// ─── Hours Tab ────────────────────────────────────────────────────────────────

const HoursTab: React.FC = () => {
  const { data: business } = useMyBusiness();
  const updateHours = useUpdateHours();
  const [hours, setHours] = useState(() => {
    const defaults: Record<string, { open: string; close: string; isClosed: boolean }> = {};
    DAYS.forEach((day) => {
      defaults[day] = {
        open:     business?.hours?.[day]?.open     || '09:00',
        close:    business?.hours?.[day]?.close    || '18:00',
        isClosed: business?.hours?.[day]?.isClosed ?? ['saturday','sunday'].includes(day),
      };
    });
    return defaults;
  });

  const handleSave = () => {
    updateHours.mutate(hours);
  };

  if (!business) {
    return (
      <Card>
        <EmptyState
          icon={<Clock className="w-8 h-8" />}
          title="Create your business first"
          description="Set up your profile before configuring hours."
        />
      </Card>
    );
  }

  return (
    <div className="max-w-lg space-y-4">
      <Card>
        <h2 className="text-base font-semibold text-slate-900 mb-5">Business Hours</h2>
        <div className="space-y-3">
          {DAYS.map((day) => (
            <div key={day} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium capitalize text-slate-700">{day}</span>
              <input
                type="checkbox"
                id={`closed-${day}`}
                checked={hours[day].isClosed}
                onChange={(e) =>
                  setHours((prev) => ({
                    ...prev,
                    [day]: { ...prev[day], isClosed: e.target.checked },
                  }))
                }
                className="accent-slate-900"
              />
              <label htmlFor={`closed-${day}`} className="w-12 text-xs text-slate-500">Closed</label>

              {!hours[day].isClosed && (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={(e) =>
                      setHours((prev) => ({
                        ...prev,
                        [day]: { ...prev[day], open: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                  <span className="text-sm text-slate-400">to</span>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={(e) =>
                      setHours((prev) => ({
                        ...prev,
                        [day]: { ...prev[day], close: e.target.value },
                      }))
                    }
                    className="rounded-lg border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
          <Button onClick={handleSave} isLoading={updateHours.isPending}>
            Save Hours
          </Button>
        </div>
      </Card>
    </div>
  );
};

// ─── Main BusinessPage ────────────────────────────────────────────────────────

const BusinessPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const { isLoading } = useMyBusiness();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <ListChecks className="h-5 w-5" />
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">My Business</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your profile, services, and business hours.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'profile'   && <ProfileTab />}
      {activeTab === 'services'  && <ServicesTab />}
      {activeTab === 'hours'     && <HoursTab />}
    </div>
  );
};

export default BusinessPage;
