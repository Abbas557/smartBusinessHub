import { QueryClient } from '@tanstack/react-query';

// ─── Query Client ─────────────────────────────────────────────────────────────
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes before refetch
      retry: 1,                       // Retry once on failure
      refetchOnWindowFocus: false,    // Don't refetch on tab switch
    },
    mutations: {
      retry: 0,
    },
  },
});

// ─── Query Keys ───────────────────────────────────────────────────────────────
// Centralised keys prevent typos and make cache invalidation easy:
// queryClient.invalidateQueries({ queryKey: QUERY_KEYS.business.me() })

export const QUERY_KEYS = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  business: {
    all: () => ['business'] as const,
    me: () => ['business', 'me'] as const,
    public: (slug: string) => ['business', 'public', slug] as const,
    marketplace: (params: Record<string, string | number | undefined>) =>
      ['business', 'marketplace', params] as const,
  },
  bookings: {
    all: () => ['bookings'] as const,
    mine: () => ['bookings', 'mine'] as const,
    slots: (businessId: string, serviceId: string, date: string) =>
      ['bookings', 'slots', businessId, serviceId, date] as const,
  },
  customers: {
    all: () => ['customers'] as const,
  },
  reviews: {
    mine: () => ['reviews', 'mine'] as const,
    business: (businessId: string) => ['reviews', 'business', businessId] as const,
  },
};
