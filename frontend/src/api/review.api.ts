import axiosInstance from './axios';
import { ApiResponse, Review } from '../types';

export interface CreateReviewPayload {
  bookingId: string;
  rating: number;
  comment?: string;
}

const reviewApi = {
  create: async (payload: CreateReviewPayload): Promise<Review> => {
    const { data } = await axiosInstance.post<ApiResponse<Review>>(
      '/reviews',
      payload,
    );
    return data.data;
  },

  listMine: async (): Promise<Review[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Review[]>>(
      '/reviews/me',
    );
    return data.data;
  },

  listForBusiness: async (businessId: string): Promise<Review[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Review[]>>(
      `/reviews/business/${businessId}`,
    );
    return data.data;
  },

  report: async (
    reviewId: string,
    reason?: string,
  ): Promise<Review> => {
    const { data } = await axiosInstance.post<ApiResponse<Review>>(
      `/reviews/${reviewId}/report`,
      { reason },
    );
    return data.data;
  },
};

export default reviewApi;
