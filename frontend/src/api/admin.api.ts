import axiosInstance from './axios';
import { ApiResponse, Booking, Business, Payment, Review, User } from '../types';

export interface AdminOverview {
  users: number;
  businesses: number;
  bookings: number;
  payments: number;
  reviews: number;
  verifiedBusinesses: number;
  hiddenReviews: number;
}

const adminApi = {
  overview: async (): Promise<AdminOverview> => {
    const { data } = await axiosInstance.get<ApiResponse<AdminOverview>>(
      '/admin/overview',
    );
    return data.data;
  },

  users: async (): Promise<User[]> => {
    const { data } = await axiosInstance.get<ApiResponse<User[]>>('/admin/users');
    return data.data;
  },

  businesses: async (): Promise<Business[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Business[]>>(
      '/admin/businesses',
    );
    return data.data;
  },

  bookings: async (): Promise<Booking[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Booking[]>>(
      '/admin/bookings',
    );
    return data.data;
  },

  payments: async (): Promise<Payment[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Payment[]>>(
      '/admin/payments',
    );
    return data.data;
  },

  reviews: async (): Promise<Review[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Review[]>>(
      '/admin/reviews',
    );
    return data.data;
  },

  verifyBusiness: async (
    businessId: string,
    isVerified: boolean,
  ): Promise<Business> => {
    const { data } = await axiosInstance.patch<ApiResponse<Business>>(
      `/admin/businesses/${businessId}/verification`,
      { isVerified },
    );
    return data.data;
  },

  moderateReview: async (
    reviewId: string,
    status: 'published' | 'hidden',
  ): Promise<Review> => {
    const { data } = await axiosInstance.patch<ApiResponse<Review>>(
      `/admin/reviews/${reviewId}/status`,
      { status },
    );
    return data.data;
  },
};

export default adminApi;
