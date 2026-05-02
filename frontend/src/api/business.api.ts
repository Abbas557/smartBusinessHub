import axiosInstance from './axios';
import { ApiResponse, Business, Service } from '../types';

export interface CreateBusinessPayload {
  name: string;
  description?: string;
  category?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export interface UpdateBusinessPayload extends Partial<CreateBusinessPayload> {
  logoUrl?: string;
  bannerUrl?: string;
}

export interface CreateServicePayload {
  name: string;
  durationMinutes: number;
  price: number;
  description?: string;
}

export interface UpdateHoursPayload {
  [day: string]: {
    open?: string;
    close?: string;
    isClosed?: boolean;
  };
}

const businessApi = {
  // ─── Business CRUD ─────────────────────────────────────────────────────────

  create: async (payload: CreateBusinessPayload): Promise<Business> => {
    const { data } = await axiosInstance.post<ApiResponse<Business>>(
      '/business',
      payload,
    );
    return data.data;
  },

  getMyBusiness: async (): Promise<Business> => {
    const { data } = await axiosInstance.get<ApiResponse<Business>>('/business/me');
    return data.data;
  },

  update: async (payload: UpdateBusinessPayload): Promise<Business> => {
    const { data } = await axiosInstance.patch<ApiResponse<Business>>(
      '/business/me',
      payload,
    );
    return data.data;
  },

  publish: async (): Promise<Business> => {
    const { data } = await axiosInstance.post<ApiResponse<Business>>(
      '/business/me/publish',
    );
    return data.data;
  },

  unpublish: async (): Promise<Business> => {
    const { data } = await axiosInstance.post<ApiResponse<Business>>(
      '/business/me/unpublish',
    );
    return data.data;
  },

  getPublicProfile: async (slug: string): Promise<Business> => {
    const { data } = await axiosInstance.get<ApiResponse<Business>>(
      `/business/public/${slug}`,
    );
    return data.data;
  },

  // ─── Services ──────────────────────────────────────────────────────────────

  addService: async (payload: CreateServicePayload): Promise<Business> => {
    const { data } = await axiosInstance.post<ApiResponse<Business>>(
      '/business/me/services',
      payload,
    );
    return data.data;
  },

  updateService: async (
    serviceId: string,
    payload: Partial<CreateServicePayload>,
  ): Promise<Business> => {
    const { data } = await axiosInstance.patch<ApiResponse<Business>>(
      `/business/me/services/${serviceId}`,
      payload,
    );
    return data.data;
  },

  removeService: async (serviceId: string): Promise<Business> => {
    const { data } = await axiosInstance.delete<ApiResponse<Business>>(
      `/business/me/services/${serviceId}`,
    );
    return data.data;
  },

  // ─── Hours ─────────────────────────────────────────────────────────────────

  updateHours: async (payload: UpdateHoursPayload): Promise<Business> => {
    const { data } = await axiosInstance.patch<ApiResponse<Business>>(
      '/business/me/hours',
      payload,
    );
    return data.data;
  },
};

export default businessApi;
