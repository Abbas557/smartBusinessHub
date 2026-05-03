import React from 'react';
import { format } from 'date-fns';
import { CalendarClock, Trash2 } from 'lucide-react';
import {
  useBookings,
  useRemoveBooking,
  useUpdateBookingStatus,
} from '../../hooks/useBookings';
import { Badge, Button, Card, EmptyState, Select, Spinner } from '../../components/ui';
import { BookingStatus } from '../../types';

const statusVariant: Record<BookingStatus, 'green' | 'yellow' | 'red' | 'blue'> = {
  pending: 'yellow',
  confirmed: 'blue',
  completed: 'green',
  cancelled: 'red',
};

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const BookingsPage: React.FC = () => {
  const { data: bookings = [], isLoading } = useBookings();
  const updateStatus = useUpdateBookingStatus();
  const removeBooking = useRemoveBooking();

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
        <h1 className="font-display text-4xl font-semibold tracking-tight text-brand-900">Bookings</h1>
        <p className="mt-1 text-sm text-brand-800/60">
          Review customer appointments and keep their status current.
        </p>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <EmptyState
            icon={<CalendarClock className="h-8 w-8" />}
            title="No bookings yet"
            description="Public bookings will appear here once customers reserve a time."
          />
        </Card>
      ) : (
        <Card padding={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-brand-100 bg-brand-50 text-xs uppercase text-brand-800/55">
                <tr>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Service</th>
                  <th className="px-4 py-3 font-semibold">When</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Notes</th>
                  <th className="px-4 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="align-top hover:bg-brand-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-brand-900">{booking.customerName}</p>
                      <p className="text-xs text-brand-800/55">{booking.customerEmail}</p>
                      {booking.customerPhone && (
                        <p className="text-xs text-brand-800/55">{booking.customerPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-brand-900">{booking.serviceName}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-brand-900">
                        {format(new Date(booking.date), 'dd MMM yyyy')}
                      </p>
                      <p className="text-xs text-brand-800/55">
                        {booking.startTime} - {booking.endTime}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="mb-2">
                        <Badge variant={statusVariant[booking.status]}>
                          {booking.status}
                        </Badge>
                      </div>
                      <Select
                        options={statusOptions}
                        value={booking.status}
                        onChange={(event) =>
                          updateStatus.mutate({
                            bookingId: booking._id,
                            status: event.target.value as BookingStatus,
                          })
                        }
                        className="min-w-32"
                        aria-label="Update booking status"
                      />
                    </td>
                    <td className="max-w-xs px-4 py-4 text-brand-800/60">
                      {booking.notes || '—'}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBooking.mutate(booking._id)}
                        leftIcon={<Trash2 className="h-4 w-4" />}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BookingsPage;
