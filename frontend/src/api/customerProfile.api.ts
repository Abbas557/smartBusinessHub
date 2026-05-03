import axiosInstance from './axios';
import { ApiResponse, CustomerProfile } from '../types';

export interface UpdateCustomerProfilePayload {
  phone?: string;
  city?: string;
  area?: string;
  pincode?: string;
}

const customerProfileApi = {
  getMe: async (): Promise<CustomerProfile> => {
    const { data } = await axiosInstance.get<ApiResponse<CustomerProfile>>(
      '/customer-profile/me',
    );
    return data.data;
  },

  updateMe: async (
    payload: UpdateCustomerProfilePayload,
  ): Promise<CustomerProfile> => {
    const { data } = await axiosInstance.patch<ApiResponse<CustomerProfile>>(
      '/customer-profile/me',
      payload,
    );
    return data.data;
  },
};

export default customerProfileApi;
