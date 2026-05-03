import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button, Input } from '../../components/ui';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';
  const [showPassword, setShowPassword] = useState(false);
  const googleUrl = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      const user = await login(values);
      const destination =
        from !== '/dashboard'
          ? from
          : user.role === 'CUSTOMER'
            ? '/marketplace'
            : '/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Login failed. Try again.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center dark-grid p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Smart Business Hub
          </h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-lg border border-white/10 bg-white/95 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
          <a href={googleUrl} className="block">
            <Button type="button" variant="secondary" className="w-full">
              Continue with Google
            </Button>
          </a>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium uppercase text-slate-400">or</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              required
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1">
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  required
                  error={errors.password?.message}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-slate-900 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
