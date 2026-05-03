import React from 'react';
import { Link } from 'react-router-dom';
import CrystalGraphic from '../brand/CrystalGraphic';

interface AuthLayoutProps {
  eyebrow?: string;
  headline: string;
  copy: string;
  children: React.ReactNode;
  compact?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  eyebrow = 'Smart Business Hub',
  headline,
  copy,
  children,
  compact = false,
}) => {
  return (
    <main className="grid min-h-screen bg-brand-50 lg:grid-cols-2">
      <section className="auth-surface relative hidden min-h-screen overflow-hidden px-10 py-10 lg:flex lg:flex-col lg:justify-between">
        <Link to="/marketplace" className="text-sm font-semibold tracking-wide text-brand-800">
          {eyebrow}
        </Link>

        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center text-center">
          <h1 className="font-display text-5xl font-semibold leading-tight text-brand-900 xl:text-6xl">
            {headline}
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-brand-800/70">
            {copy}
          </p>
          <div className="mt-20">
            <CrystalGraphic />
          </div>
        </div>

        <div className="text-xs font-medium text-brand-800/60">
          Local vendors. Trusted bookings. Calm operations.
        </div>
      </section>

      <section className="auth-form-surface flex min-h-screen items-center justify-center px-4 py-8 sm:px-8">
        <div className={compact ? 'w-full max-w-md' : 'w-full max-w-2xl'}>
          <div className="mb-8 text-center lg:hidden">
            <Link to="/marketplace" className="text-sm font-semibold text-brand-700">
              {eyebrow}
            </Link>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-brand-900">
              {headline}
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-brand-800/70">
              {copy}
            </p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
