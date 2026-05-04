import { useCallback } from 'react';
import customerEventApi from '../api/customerEvent.api';
import { CustomerEventPayload } from '../types';

export const useCustomerEvents = (isCustomer: boolean) => {
  const trackEvent = useCallback(
    (payload: CustomerEventPayload) => {
      const request = isCustomer
        ? customerEventApi.trackMe(payload)
        : customerEventApi.trackPublic(payload);

      request.catch(() => {
        // Customer discovery events should never block browsing or booking.
      });
    },
    [isCustomer],
  );

  return { trackEvent };
};
