import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import customerProfileApi from '../api/customerProfile.api';

const customerProfileKey = ['customer-profile', 'me'] as const;

export const useCustomerProfile = (enabled = true) => {
  return useQuery({
    queryKey: customerProfileKey,
    queryFn: customerProfileApi.getMe,
    enabled,
  });
};

export const useUpdateCustomerProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerProfileApi.updateMe,
    onSuccess: (data) => {
      qc.setQueryData(customerProfileKey, data);
      toast.success('Profile updated');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Update failed');
    },
  });
};

export const useSaveBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerProfileApi.saveBusiness,
    onSuccess: (data) => {
      qc.setQueryData(customerProfileKey, data);
      toast.success('Vendor saved');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Could not save vendor');
    },
  });
};

export const useUnsaveBusiness = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: customerProfileApi.unsaveBusiness,
    onSuccess: (data) => {
      qc.setQueryData(customerProfileKey, data);
      toast.success('Vendor removed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Could not remove vendor');
    },
  });
};
