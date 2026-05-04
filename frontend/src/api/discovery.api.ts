import axiosInstance from './axios';
import {
  ApiResponse,
  Business,
  RecommendationHome,
  ServiceDiscoveryHome,
} from '../types';
import { getCustomerSessionId } from './customerEvent.api';

export interface RecommendationParams {
  city?: string;
  area?: string;
  pincode?: string;
  lat?: number;
  lng?: number;
  radiusKm?: number;
  sessionId?: string;
}

const discoveryApi = {
  getExploreHome: async (): Promise<ServiceDiscoveryHome> => {
    const { data } = await axiosInstance.get<ApiResponse<ServiceDiscoveryHome>>(
      '/service-discovery',
    );
    return data.data;
  },

  getCollectionBusinesses: async (params: {
    categories?: string[];
    city?: string;
    area?: string;
  }): Promise<Business[]> => {
    const category = params.categories?.[0];
    const { data } = await axiosInstance.get<ApiResponse<Business[]>>(
      '/business/public',
      {
        params: {
          category,
          city: params.city,
          area: params.area,
          sort: 'top-rated',
        },
      },
    );
    return data.data;
  },

  getPublicRecommendations: async (
    params: RecommendationParams,
  ): Promise<RecommendationHome> => {
    const { data } = await axiosInstance.get<ApiResponse<RecommendationHome>>(
      '/recommendations/public',
      { params: { sessionId: getCustomerSessionId(), ...params } },
    );
    return data.data;
  },

  getCustomerRecommendations: async (
    params: RecommendationParams,
  ): Promise<RecommendationHome> => {
    const { data } = await axiosInstance.get<ApiResponse<RecommendationHome>>(
      '/recommendations/me',
      { params: { sessionId: getCustomerSessionId(), ...params } },
    );
    return data.data;
  },
};

export default discoveryApi;
