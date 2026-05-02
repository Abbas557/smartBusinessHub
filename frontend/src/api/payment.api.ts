import axiosInstance from './axios';
import { ApiResponse, Payment, PaymentMethod } from '../types';

export interface DemoCheckoutResponse {
  payment: Payment;
  checkoutMode: 'demo';
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
};

export default paymentApi;
