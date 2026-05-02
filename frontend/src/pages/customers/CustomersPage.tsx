import React from 'react';
import { format } from 'date-fns';
import { Users } from 'lucide-react';
import { Card, EmptyState, Spinner } from '../../components/ui';
import { useCustomers } from '../../hooks/useCustomers';

const CustomersPage: React.FC = () => {
  const { data: customers = [], isLoading } = useCustomers();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Customers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Customers are created automatically when someone books.
        </p>
      </div>

      {customers.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No customers yet"
            description="Customer profiles will appear after the first public booking."
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {customers.map((customer) => (
            <Card key={customer._id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-slate-900">{customer.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{customer.email}</p>
                  {customer.phone && (
                    <p className="text-sm text-slate-500">{customer.phone}</p>
                  )}
                </div>
                <div className="rounded-lg bg-slate-100 px-3 py-2 text-center">
                  <p className="text-lg font-bold text-slate-900">
                    {customer.totalBookings}
                  </p>
                  <p className="text-xs text-slate-500">bookings</p>
                </div>
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4 text-sm text-slate-500">
                Last booking:{' '}
                <span className="font-medium text-slate-700">
                  {customer.lastBookingDate
                    ? format(new Date(customer.lastBookingDate), 'dd MMM yyyy')
                    : 'Not recorded'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
