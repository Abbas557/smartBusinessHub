import { useQuery } from '@tanstack/react-query';
import discoveryApi, { RecommendationParams } from '../api/discovery.api';
import { QUERY_KEYS } from '../store/queryClient';

export const useExploreHome = () => {
  return useQuery({
    queryKey: QUERY_KEYS.discovery.home(),
    queryFn: discoveryApi.getExploreHome,
  });
};

export const useRecommendations = (
  params: RecommendationParams,
  isCustomer: boolean,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.discovery.recommendations({ ...params }, isCustomer),
    queryFn: () =>
      isCustomer
        ? discoveryApi.getCustomerRecommendations(params)
        : discoveryApi.getPublicRecommendations(params),
  });
};
