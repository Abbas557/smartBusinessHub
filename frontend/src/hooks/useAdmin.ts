import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import adminApi from '../api/admin.api';

const ADMIN_KEYS = {
  overview: ['admin', 'overview'] as const,
  users: ['admin', 'users'] as const,
  businesses: ['admin', 'businesses'] as const,
  bookings: ['admin', 'bookings'] as const,
  payments: ['admin', 'payments'] as const,
  reviews: ['admin', 'reviews'] as const,
};

export const useAdminOverview = () =>
  useQuery({ queryKey: ADMIN_KEYS.overview, queryFn: adminApi.overview });

export const useAdminUsers = () =>
  useQuery({ queryKey: ADMIN_KEYS.users, queryFn: adminApi.users });

export const useAdminBusinesses = () =>
  useQuery({ queryKey: ADMIN_KEYS.businesses, queryFn: adminApi.businesses });

export const useAdminBookings = () =>
  useQuery({ queryKey: ADMIN_KEYS.bookings, queryFn: adminApi.bookings });

export const useAdminPayments = () =>
  useQuery({ queryKey: ADMIN_KEYS.payments, queryFn: adminApi.payments });

export const useAdminReviews = () =>
  useQuery({ queryKey: ADMIN_KEYS.reviews, queryFn: adminApi.reviews });

export const useVerifyBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      isVerified,
    }: {
      businessId: string;
      isVerified: boolean;
    }) => adminApi.verifyBusiness(businessId, isVerified),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.businesses });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.overview });
      toast.success('Business verification updated');
    },
  });
};

export const useModerateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      reviewId,
      status,
    }: {
      reviewId: string;
      status: 'published' | 'hidden';
    }) => adminApi.moderateReview(reviewId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.reviews });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.overview });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.businesses });
      toast.success('Review moderation updated');
    },
  });
};
