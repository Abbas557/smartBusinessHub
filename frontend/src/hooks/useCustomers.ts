import { useQuery } from '@tanstack/react-query';
import customerApi from '../api/customer.api';
import { QUERY_KEYS } from '../store/queryClient';

export const useCustomers = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.customers.all(),
    queryFn: customerApi.list,
    enabled,
  });
};
