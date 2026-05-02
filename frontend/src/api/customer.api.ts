import axiosInstance from './axios';
import { ApiResponse, Customer } from '../types';

const customerApi = {
  list: async (): Promise<Customer[]> => {
    const { data } = await axiosInstance.get<ApiResponse<Customer[]>>(
      '/customers',
    );
    return data.data;
  },
};

export default customerApi;
