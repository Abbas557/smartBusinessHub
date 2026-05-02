import axiosInstance from './axios';
import { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
}

const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthData>>(
      '/auth/register',
      payload,
    );
    return data.data;
  },

  login: async (payload: LoginPayload): Promise<AuthData> => {
    const { data } = await axiosInstance.post<ApiResponse<AuthData>>(
      '/auth/login',
      payload,
    );
    return data.data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await axiosInstance.post<ApiResponse<{ accessToken: string }>>(
      '/auth/refresh',
    );
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await axiosInstance.get<ApiResponse<User>>('/users/me');
    return data.data;
  },
};

export default authApi;
