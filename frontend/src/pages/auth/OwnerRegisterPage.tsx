import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input, Select, Textarea } from '../../components/ui';
import { BusinessCategory } from '../../types';

const categories: Array<{ value: BusinessCategory; label: string }> = [
  { value: 'salon', label: 'Salon' },
  { value: 'gym', label: 'Gym' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'repair', label: 'Repair' },
  { value: 'tuition', label: 'Tuition' },
  { value: 'other', label: 'Other' },
];

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7, 'Phone is required').max(30),
  password: z.string().min(8).max(64),
  confirmPassword: z.string(),
  businessName: z.string().min(2).max(100),
  category: z.enum(['salon', 'gym', 'restaurant', 'clinic', 'repair', 'tuition', 'other']),
  businessPhone: z.string().min(7, 'Business phone is required').max(30),
  description: z.string().max(500).optional(),
  address: z.string().min(3, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  area: z.string().min(2, 'Area is required').max(100),
  pincode: z.string().min(4, 'Pincode is required').max(20),
  serviceName: z.string().min(2, 'First service is required').max(100),
  serviceDuration: z.coerce.number().min(5).max(480),
  servicePrice: z.coerce.number().min(0),
  serviceDescription: z.string().max(300).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

const OwnerRegisterPage: React.FC = () => {
  const { registerOwner } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      category: 'salon',
      serviceDuration: 45,
      servicePrice: 500,
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerOwner({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        business: {
          name: values.businessName,
          category: values.category,
          phone: values.businessPhone,
          description: values.description,
          address: values.address,
          city: values.city,
          area: values.area,
          pincode: values.pincode,
          serviceRadiusKm: 10,
        },
        firstService: {
          name: values.serviceName,
          durationMinutes: values.serviceDuration,
          price: values.servicePrice,
          description: values.serviceDescription,
        },
      });
      toast.success('Owner account and business profile created.');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="min-h-screen app-surface px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Back to account type
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Create owner account</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add the essentials now so your vendor profile starts cleanly.
          </p>
        </div>

        <Card className="mesh-panel">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900">Owner details</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Input label="Full name" required error={errors.name?.message} {...register('name')} />
                <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
                <Input label="Phone" required error={errors.phone?.message} {...register('phone')} />
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="relative">
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Input
                  label="Confirm password"
                  type="password"
                  required
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">Business profile</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Input label="Business name" required error={errors.businessName?.message} {...register('businessName')} />
                <Select label="Category" options={categories} error={errors.category?.message} {...register('category')} />
                <Input label="Business phone" required error={errors.businessPhone?.message} {...register('businessPhone')} />
                <Input label="City" required error={errors.city?.message} {...register('city')} />
                <Input label="Area" required error={errors.area?.message} {...register('area')} />
                <Input label="Pincode" required error={errors.pincode?.message} {...register('pincode')} />
              </div>
              <div className="mt-4 grid gap-4">
                <Input label="Address" required error={errors.address?.message} {...register('address')} />
                <Textarea label="Description" error={errors.description?.message} {...register('description')} />
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900">First service</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <Input label="Service name" required error={errors.serviceName?.message} {...register('serviceName')} />
                <Input label="Duration minutes" type="number" required error={errors.serviceDuration?.message} {...register('serviceDuration')} />
                <Input label="Price" type="number" required error={errors.servicePrice?.message} {...register('servicePrice')} />
              </div>
              <div className="mt-4">
                <Textarea label="Service description" error={errors.serviceDescription?.message} {...register('serviceDescription')} />
              </div>
            </section>

            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Create owner account
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default OwnerRegisterPage;
