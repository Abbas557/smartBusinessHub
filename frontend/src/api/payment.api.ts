import axiosInstance from './axios';
import { ApiResponse, Payment, PaymentMethod } from '../types';

export interface DemoCheckoutResponse {
  payment: Payment;
  checkoutMode: 'demo';
}

export interface RazorpayOrderResponse {
  keyId: string;
  orderId: string;
  amount: number;
  currency: string;
  bookingId: string;
}

export interface RazorpayVerifyResponse {
  payment: Payment;
  bookingId: string;
}

const paymentApi = {
  createDemoCheckout: async (payload: {
    bookingId: string;
    method?: PaymentMethod;
  }): Promise<DemoCheckoutResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<DemoCheckoutResponse>>(
      '/payments/demo-checkout',
      payload,
    );
    return data.data;
  },

  createRazorpayOrder: async (payload: {
    bookingId: string;
  }): Promise<RazorpayOrderResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<RazorpayOrderResponse>>(
      '/payments/razorpay/order',
      payload,
    );
    return data.data;
  },

  verifyRazorpayPayment: async (payload: {
    bookingId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<RazorpayVerifyResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<RazorpayVerifyResponse>>(
      '/payments/razorpay/verify',
      payload,
    );
    return data.data;
  },
};

export default paymentApi;
