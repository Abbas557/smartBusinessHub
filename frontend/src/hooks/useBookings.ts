import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import bookingApi, { CreateBookingPayload } from '../api/booking.api';
import { BookingStatus } from '../types';
import { QUERY_KEYS } from '../store/queryClient';

export const useBookings = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.all(),
    queryFn: bookingApi.list,
    enabled,
  });
};

export const useMyCustomerBookings = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.mine(),
    queryFn: bookingApi.listMine,
    enabled,
  });
};

export const useBookingSlots = (
  businessId: string | undefined,
  serviceId: string | undefined,
  date: string | undefined,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.bookings.slots(
      businessId || '',
      serviceId || '',
      date || '',
    ),
    queryFn: () =>
      bookingApi.slots({
        businessId: businessId!,
        serviceId: serviceId!,
        date: date!,
      }),
    enabled: Boolean(businessId && serviceId && date),
  });
};

export const useCreateBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => bookingApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.customers.all() });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Booking failed');
    },
  });
};

export const useCreateCustomerBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingPayload) =>
      bookingApi.createForCustomer(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.mine() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all() });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Booking failed');
    },
  });
};

export const useUpdateBookingStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: BookingStatus;
    }) => bookingApi.updateStatus(bookingId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all() });
      toast.success('Booking updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });
};

export const useRemoveBooking = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: bookingApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all() });
      toast.success('Booking deleted');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Delete failed');
    },
  });
};
