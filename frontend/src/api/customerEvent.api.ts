import axiosInstance from './axios';
import { ApiResponse, CustomerEvent, CustomerEventPayload } from '../types';

const SESSION_STORAGE_KEY = 'sbh_customer_session_id';

export const getCustomerSessionId = () => {
  const existing = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) return existing;

  const generated =
    window.crypto?.randomUUID?.() ||
    `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  window.localStorage.setItem(SESSION_STORAGE_KEY, generated);
  return generated;
};

const customerEventApi = {
  trackPublic: async (payload: CustomerEventPayload): Promise<CustomerEvent> => {
    const { data } = await axiosInstance.post<ApiResponse<CustomerEvent>>(
      '/customer-events/public',
      {
        sessionId: getCustomerSessionId(),
        ...payload,
      },
    );
    return data.data;
  },

  trackMe: async (payload: CustomerEventPayload): Promise<CustomerEvent> => {
    const { data } = await axiosInstance.post<ApiResponse<CustomerEvent>>(
      '/customer-events/me',
      {
        sessionId: getCustomerSessionId(),
        ...payload,
      },
    );
    return data.data;
  },
};

export default customerEventApi;
