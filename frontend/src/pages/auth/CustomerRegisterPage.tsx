import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, HeartHandshake } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button, Card, Input } from '../../components/ui';

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7, 'Phone is required').max(30),
  password: z.string().min(8).max(64),
  confirmPassword: z.string(),
  city: z.string().min(2, 'City is required').max(100),
  area: z.string().min(2, 'Area is required').max(100),
  pincode: z.string().min(4, 'Pincode is required').max(20),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

const CustomerRegisterPage: React.FC = () => {
  const { registerCustomer } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await registerCustomer({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        profile: {
          phone: values.phone,
          city: values.city,
          area: values.area,
          pincode: values.pincode,
        },
      });
      toast.success('Customer account created.');
      navigate('/marketplace', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Registration failed.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <AuthLayout
      headline="Discover trusted local services, beautifully."
      copy="Create a customer profile so we can show nearby vendors, appointments, reviews, and saved favorites."
    >
      <Card className="bg-white/80">
        <div className="mb-7 text-center">
          <Link to="/register" className="text-sm font-semibold text-gold-700 hover:underline">
            Back to account type
          </Link>
          <div className="mx-auto mt-5 flex h-11 w-11 items-center justify-center rounded-lg bg-blush-200 text-brand-700">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold text-brand-900">
            Create customer account
          </h1>
          <p className="mt-2 text-sm text-brand-800/70">
            Save your area so the marketplace can show relevant businesses around you.
          </p>
        </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Full name" required error={errors.name?.message} {...register('name')} />
              <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
              <Input label="Phone" required error={errors.phone?.message} {...register('phone')} />
              <Input label="City" required error={errors.city?.message} {...register('city')} />
              <Input label="Area" required error={errors.area?.message} {...register('area')} />
              <Input label="Pincode" required error={errors.pincode?.message} {...register('pincode')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
                  className="absolute right-3 top-8 text-brand-800/40 hover:text-brand-700"
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

            <Button type="submit" size="lg" isLoading={isSubmitting}>
              Create customer account
            </Button>
          </form>
      </Card>
    </AuthLayout>
  );
};

export default CustomerRegisterPage;
