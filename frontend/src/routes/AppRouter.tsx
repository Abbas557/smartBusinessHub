import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, RoleGuard } from './Guards';
import DashboardLayout from '../components/layout/DashboardLayout';
import CustomerShell from '../components/layout/CustomerShell';
import { Spinner } from '../components/ui';

// Lazy-loaded pages for code splitting
const LoginPage        = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage     = lazy(() => import('../pages/auth/RegisterPage'));
const OwnerRegisterPage = lazy(() => import('../pages/auth/OwnerRegisterPage'));
const CustomerRegisterPage = lazy(() => import('../pages/auth/CustomerRegisterPage'));
const DashboardHome    = lazy(() => import('../pages/dashboard/DashboardHome'));
const BusinessPage     = lazy(() => import('../pages/business/BusinessPage'));
const BookingsPage     = lazy(() => import('../pages/bookings/BookingsPage'));
const CustomersPage    = lazy(() => import('../pages/customers/CustomersPage'));
const SettingsPage     = lazy(() => import('../pages/settings/SettingsPage'));
const PublicBusinessPage = lazy(() => import('../pages/public/PublicBusinessPage'));
const PublicBookingPage  = lazy(() => import('../pages/public/PublicBookingPage'));
const MarketplacePage    = lazy(() => import('../pages/public/MarketplacePage'));
const CustomerBookingsPage = lazy(() => import('../pages/customer/CustomerBookingsPage'));
const CustomerProfilePage = lazy(() => import('../pages/customer/CustomerProfilePage'));
const NotFoundPage     = lazy(() => import('../pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

const PageLoader = () => (
  <div className="flex h-full items-center justify-center">
    <Spinner size="lg" />
  </div>
);

const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/marketplace" replace />} />

        {/* Guest-only routes (login, register) */}
        <Route element={<GuestRoute />}>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/owner/register" element={<OwnerRegisterPage />} />
          <Route path="/customer/register" element={<CustomerRegisterPage />} />
        </Route>

        {/* Public customer-facing routes */}
        <Route element={<CustomerShell />}>
          <Route path="/marketplace" element={<MarketplacePage />} />
        </Route>
        <Route path="/b/:slug"      element={<PublicBusinessPage />} />
        <Route path="/b/:slug/book" element={<PublicBookingPage />} />
        <Route path="/embed/:slug"  element={<PublicBookingPage />} />

        {/* Protected routes — requires valid JWT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleGuard allowedRoles={['CUSTOMER']} />}>
            <Route element={<CustomerShell />}>
              <Route path="/customer/bookings" element={<CustomerBookingsPage />} />
              <Route path="/customer/profile" element={<CustomerProfilePage />} />
            </Route>
          </Route>

          {/* Business Owner area */}
          <Route element={<RoleGuard allowedRoles={['BUSINESS_OWNER', 'SUPER_ADMIN']} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard"          element={<DashboardHome />} />
              <Route path="/dashboard/business" element={<BusinessPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route path="/dashboard/bookings"  element={<BookingsPage />} />
              <Route path="/dashboard/customers" element={<CustomersPage />} />
            </Route>
          </Route>
        </Route>

        {/* Misc */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*"             element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default AppRouter;
