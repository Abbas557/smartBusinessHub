import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import businessApi, {
  CreateBusinessPayload,
  UpdateBusinessPayload,
  CreateServicePayload,
  UpdateHoursPayload,
} from '../api/business.api';
import { QUERY_KEYS } from '../store/queryClient';

// ─── Fetch my business ────────────────────────────────────────────────────────

export const useMyBusiness = () => {
  return useQuery({
    queryKey: QUERY_KEYS.business.me(),
    queryFn: businessApi.getMyBusiness,
    // Don't throw on 404 — user might not have created one yet
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 1;
    },
  });
};

export const usePublicBusiness = (slug: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.business.public(slug || ''),
    queryFn: () => businessApi.getPublicProfile(slug!),
    enabled: Boolean(slug),
    retry: 1,
  });
};

// ─── Create business ──────────────────────────────────────────────────────────

export const useCreateBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: businessApi.create,
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success('Business created successfully!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to create business');
    },
  });
};

// ─── Update business ──────────────────────────────────────────────────────────

export const useUpdateBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: businessApi.update,
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success('Business updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });
};

// ─── Publish / Unpublish ──────────────────────────────────────────────────────

export const usePublishBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ publish }: { publish: boolean }) =>
      publish ? businessApi.publish() : businessApi.unpublish(),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success(data.isPublished ? 'Profile is now live!' : 'Profile unpublished');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Action failed');
    },
  });
};

// ─── Services ─────────────────────────────────────────────────────────────────

export const useAddService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: businessApi.addService,
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success('Service added!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add service');
    },
  });
};

export const useUpdateService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceId, payload }: { serviceId: string; payload: Partial<CreateServicePayload> }) =>
      businessApi.updateService(serviceId, payload),
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success('Service updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });
};

export const useRemoveService = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: businessApi.removeService,
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success('Service removed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to remove service');
    },
  });
};

// ─── Hours ────────────────────────────────────────────────────────────────────

export const useUpdateHours = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: businessApi.updateHours,
    onSuccess: (data) => {
      qc.setQueryData(QUERY_KEYS.business.me(), data);
      toast.success('Hours updated!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });
};
