import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import paymentApi from '../api/payment.api';
import { QUERY_KEYS } from '../store/queryClient';

export const useDemoCheckout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: paymentApi.createDemoCheckout,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.mine() });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.bookings.all() });
      toast.success('Payment completed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Payment failed');
    },
  });
};
