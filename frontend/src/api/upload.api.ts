import axios from 'axios';
import axiosInstance from './axios';
import { ApiResponse } from '../types';

export interface PresignedUploadPayload {
  assetType: 'logo' | 'banner';
  contentType: string;
}

export interface PresignedUploadResponse {
  key: string;
  uploadUrl: string;
  publicUrl: string;
  expiresIn: number;
}

const uploadApi = {
  presignedUrl: async (
    payload: PresignedUploadPayload,
  ): Promise<PresignedUploadResponse> => {
    const { data } = await axiosInstance.post<ApiResponse<PresignedUploadResponse>>(
      '/upload/presigned-url',
      payload,
    );
    return data.data;
  },

  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    await axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type },
    });
  },
};

export default uploadApi;
