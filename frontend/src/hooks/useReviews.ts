import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import reviewApi, { CreateReviewPayload } from '../api/review.api';
import { QUERY_KEYS } from '../store/queryClient';

export const useMyReviews = (enabled = true) => {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.mine(),
    queryFn: reviewApi.listMine,
    enabled,
  });
};

export const useBusinessReviews = (businessId: string | undefined) => {
  return useQuery({
    queryKey: QUERY_KEYS.reviews.business(businessId || ''),
    queryFn: () => reviewApi.listForBusiness(businessId!),
    enabled: Boolean(businessId),
  });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateReviewPayload) => reviewApi.create(payload),
    onSuccess: (review) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.reviews.mine() });
      qc.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.business(review.businessId),
      });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.business.all() });
      toast.success('Review published');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Review failed');
    },
  });
};
