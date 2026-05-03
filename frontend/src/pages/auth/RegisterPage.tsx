import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Search } from 'lucide-react';
import { Button, Card } from '../../components/ui';

const RegisterPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center dark-grid p-4">
      <div className="w-full max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Smart Business Hub</h1>
          <p className="mt-2 text-sm text-slate-300">
            Choose the account type that matches what you want to do.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white/95">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              I own a business
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create a vendor profile, add services, manage bookings, collect payments, and track revenue.
            </p>
            <Link to="/owner/register" className="mt-6 block">
              <Button className="w-full" leftIcon={<ArrowRight className="h-4 w-4" />}>
                Create owner account
              </Button>
            </Link>
          </Card>

          <Card className="bg-white/95">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-teal-700 text-white">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-xl font-semibold text-slate-900">
              I want to book services
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Discover nearby vendors, compare services, book appointments, and pay online or at the venue.
            </p>
            <Link to="/customer/register" className="mt-6 block">
              <Button className="w-full bg-teal-700 hover:bg-teal-800" leftIcon={<ArrowRight className="h-4 w-4" />}>
                Create customer account
              </Button>
            </Link>
          </Card>
        </div>

        <p className="mt-6 text-center text-sm text-slate-300">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-white hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
