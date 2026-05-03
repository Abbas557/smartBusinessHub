import axiosInstance from './axios';
import {
  ApiResponse,
  Booking,
  BookingSlot,
  BookingStatus,
  PaymentMethod,
} from '../types';

export interface CreateBookingPayload {
  businessId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  serviceId: string;
  date: string;
  startTime: string;
  notes?: string;
  paymentMethod?: PaymentMethod;
}

const bookingApi = {
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await axiosInstance.post<ApiResponse<Booking>>(
      '/bookings',
      payload,
    );
    return data.data;
  },

  createForCustomer: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await axiosInstance.post<ApiResponse<Booking>>(
      '/bookings/customer',
      payload,
    );
    return data.data;
  },

  list: async (): Promise<Booking[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Booking[]>>('/bookings');
    return data.data;
  },

  listMine: async (): Promise<Booking[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Booking[]>>(
      '/bookings/customer/me',
    );
    return data.data;
  },

  slots: async (params: {
    businessId: string;
    serviceId: string;
    date: string;
  }): Promise<BookingSlot[]> => {
    const { data } = await axiosInstance.get<ApiResponse<BookingSlot[]>>(
      '/bookings/slots',
      { params },
    );
    return data.data;
  },

  updateStatus: async (
    bookingId: string,
    status: BookingStatus,
  ): Promise<Booking> => {
    const { data } = await axiosInstance.patch<ApiResponse<Booking>>(
      `/bookings/${bookingId}/status`,
      { status },
    );
    return data.data;
  },

  remove: async (bookingId: string): Promise<void> => {
    await axiosInstance.delete(`/bookings/${bookingId}`);
  },
};

export default bookingApi;
