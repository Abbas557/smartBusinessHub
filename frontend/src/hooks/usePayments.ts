import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import paymentApi from '../api/payment.api';

export const useDemoCheckout = () => {
  return useMutation({
    mutationFn: paymentApi.createDemoCheckout,
    onSuccess: () => {
      toast.success('Payment completed');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Payment failed');
    },
  });
};
