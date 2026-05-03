import React, { useMemo, useState } from 'react';
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  EyeOff,
  type LucideIcon,
  ShieldCheck,
  Star,
  Users,
} from 'lucide-react';
import {
  useAdminBookings,
  useAdminBusinesses,
  useAdminOverview,
  useAdminPayments,
  useAdminReviews,
  useAdminUsers,
  useModerateReview,
  useVerifyBusiness,
} from '../../hooks/useAdmin';
import { Badge, Button, Card, Spinner } from '../../components/ui';

const tabs = ['businesses', 'reviews', 'users', 'bookings', 'payments'] as const;
type AdminTab = (typeof tabs)[number];

type StatCard = {
  label: string;
  value: number;
  Icon: LucideIcon;
};

const AdminDashboardPage: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('businesses');
  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const { data: users = [] } = useAdminUsers();
  const { data: businesses = [] } = useAdminBusinesses();
  const { data: bookings = [] } = useAdminBookings();
  const { data: payments = [] } = useAdminPayments();
  const { data: reviews = [] } = useAdminReviews();
  const verifyBusiness = useVerifyBusiness();
  const moderateReview = useModerateReview();

  const stats = useMemo<StatCard[]>(
    () => [
      { label: 'Users', value: overview?.users || 0, Icon: Users },
      { label: 'Businesses', value: overview?.businesses || 0, Icon: Building2 },
      { label: 'Bookings', value: overview?.bookings || 0, Icon: CalendarDays },
      { label: 'Payments', value: overview?.payments || 0, Icon: CreditCard },
      { label: 'Reviews', value: overview?.reviews || 0, Icon: Star },
      { label: 'Verified', value: overview?.verifiedBusinesses || 0, Icon: ShieldCheck },
    ],
    [overview],
  );

  if (overviewLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center app-surface">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen app-surface">
      <header className="border-b border-brand-100 bg-brand-50/95">
        <div className="mx-auto max-w-7xl px-5 py-5">
          <p className="text-sm font-medium text-brand-800/60">Admin console</p>
          <h1 className="mt-1 font-display text-4xl font-semibold text-brand-900">
            Platform moderation
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-5 py-6">
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          {stats.map(({ label, value, Icon }) => (
            <Card key={label} className="p-4">
              <Icon className="h-5 w-5 text-brand-600" />
              <p className="mt-3 text-2xl font-bold text-brand-900">{value}</p>
              <p className="text-sm text-brand-800/60">{label}</p>
            </Card>
          ))}
        </section>

        <div className="flex flex-wrap gap-2">
          {tabs.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                tab === item
                  ? 'bg-brand-700 text-white shadow-button'
                  : 'border border-brand-100 bg-white text-brand-800/65'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {tab === 'businesses' && (
          <Card>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Vendor verification</h2>
            <div className="mt-4 divide-y divide-brand-100">
              {businesses.map((business) => (
                <div
                  key={business._id}
                  className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium text-brand-900">{business.name}</p>
                    <p className="text-sm text-brand-800/60">
                      {[business.area, business.city, business.category]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={business.isVerified ? 'green' : 'gray'}>
                      {business.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                    <Button
                      size="sm"
                      variant="secondary"
                      isLoading={verifyBusiness.isPending}
                      onClick={() =>
                        verifyBusiness.mutate({
                          businessId: business._id,
                          isVerified: !business.isVerified,
                        })
                      }
                    >
                      {business.isVerified ? 'Unverify' : 'Verify'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'reviews' && (
          <Card>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Review moderation</h2>
            <div className="mt-4 divide-y divide-brand-100">
              {reviews.map((review) => (
                <div key={review._id} className="py-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-medium text-brand-900">
                        {review.customerName}
                      </p>
                      <p className="mt-1 text-sm text-brand-800/60">
                        {review.comment || 'No comment'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={review.status === 'published' ? 'green' : 'red'}>
                        {review.status}
                      </Badge>
                      {Boolean(review.reportCount) && (
                        <Badge variant="yellow">
                          {review.reportCount} report(s)
                        </Badge>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {review.rating}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<EyeOff className="h-4 w-4" />}
                        isLoading={moderateReview.isPending}
                        onClick={() =>
                          moderateReview.mutate({
                            reviewId: review._id,
                            status:
                              review.status === 'published'
                                ? 'hidden'
                                : 'published',
                          })
                        }
                      >
                        {review.status === 'published' ? 'Hide' : 'Publish'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'users' && (
          <Card>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Users</h2>
            <div className="mt-4 grid gap-3">
              {users.map((user) => (
                <div key={user._id} className="rounded-lg border border-brand-100 p-4">
                  <p className="font-medium text-brand-900">{user.name}</p>
                  <p className="text-sm text-brand-800/60">{user.email}</p>
                  <Badge>{user.role}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'bookings' && (
          <Card>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Bookings</h2>
            <div className="mt-4 divide-y divide-brand-100">
              {bookings.slice(0, 40).map((booking) => (
                <div key={booking._id} className="flex justify-between gap-3 py-3 text-sm">
                  <span>{booking.serviceName}</span>
                  <span className="text-brand-800/60">{booking.status}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'payments' && (
          <Card>
            <h2 className="font-display text-2xl font-semibold text-brand-900">Payments</h2>
            <div className="mt-4 divide-y divide-brand-100">
              {payments.slice(0, 40).map((payment) => (
                <div key={payment._id} className="flex justify-between gap-3 py-3 text-sm">
                  <span>{payment.provider}</span>
                  <span className="font-medium">₹{payment.amount}</span>
                  <span className="text-brand-800/60">{payment.status}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;
