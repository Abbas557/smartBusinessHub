import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Search, Sparkles } from 'lucide-react';
import AuthLayout from '../../components/layout/AuthLayout';
import { Button, Card } from '../../components/ui';

const RegisterPage: React.FC = () => {
  return (
    <AuthLayout
      headline="The ultimate platform connecting local vendors and customers."
      copy="Create the right account for your side of the marketplace."
    >
      <div className="rounded-lg border border-brand-100 bg-white/75 p-6 shadow-soft backdrop-blur sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-blush-200 text-brand-700">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="mt-4 font-display text-4xl font-semibold text-brand-900">
            Join the community
          </h1>
          <p className="mt-2 text-sm text-brand-800/70">
            Choose how you want to use Smart Business Hub.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white/90 transition-transform hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-700 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-brand-900">
              I own a business
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-800/65">
              Create a vendor profile, add services, manage bookings, collect payments, and track revenue.
            </p>
            <Link to="/owner/register" className="mt-6 block">
              <Button className="w-full" leftIcon={<ArrowRight className="h-4 w-4" />}>
                Create owner account
              </Button>
            </Link>
          </Card>

          <Card className="bg-white/90 transition-transform hover:-translate-y-0.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold-500 text-white">
              <Search className="h-5 w-5" />
            </div>
            <h2 className="mt-5 font-display text-2xl font-semibold text-brand-900">
              I want to book services
            </h2>
            <p className="mt-2 text-sm leading-6 text-brand-800/65">
              Discover nearby vendors, compare services, book appointments, and pay online or at the venue.
            </p>
            <Link to="/customer/register" className="mt-6 block">
              <Button className="w-full bg-gold-500 hover:bg-gold-700" leftIcon={<ArrowRight className="h-4 w-4" />}>
                Create customer account
              </Button>
            </Link>
          </Card>
        </div>

        <p className="mt-6 text-center text-sm text-brand-800/65">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gold-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
