import React, { useEffect, useRef, useState } from 'react';
import { Business } from '../../types';
import { hasGoogleMapsKey, loadGoogleMaps } from '../../lib/googleMaps';

interface Props {
  businesses: Business[];
  customerCoordinates?: [number, number];
  className?: string;
}

const GoogleVendorMap: React.FC<Props> = ({
  businesses,
  customerCoordinates,
  className = 'min-h-[280px]',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasGoogleMapsKey() || !containerRef.current) return;

    let map: any;
    const markers: any[] = [];
    let errorCheckTimer: number | undefined;

    loadGoogleMaps()
      .then((google) => {
        if (!containerRef.current) return;
        const firstBusiness = businesses.find(
          (business) => business.location?.coordinates?.length === 2,
        );
        const center = customerCoordinates
          ? { lat: customerCoordinates[1], lng: customerCoordinates[0] }
          : firstBusiness
            ? {
                lat: firstBusiness.location!.coordinates[1],
                lng: firstBusiness.location!.coordinates[0],
              }
            : { lat: 26.8467, lng: 80.9462 };

        map = new google.maps.Map(containerRef.current, {
          center,
          zoom: customerCoordinates ? 13 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const bounds = new google.maps.LatLngBounds();
        if (customerCoordinates) {
          const customerPosition = {
            lat: customerCoordinates[1],
            lng: customerCoordinates[0],
          };
          markers.push(
            new google.maps.Marker({
              position: customerPosition,
              map,
              title: 'You',
              label: 'Y',
            }),
          );
          bounds.extend(customerPosition);
        }

        businesses.forEach((business) => {
          if (!business.location?.coordinates?.length) return;
          const position = {
            lat: business.location.coordinates[1],
            lng: business.location.coordinates[0],
          };
          markers.push(
            new google.maps.Marker({
              position,
              map,
              title: business.name,
            }),
          );
          bounds.extend(position);
        });

        if (!bounds.isEmpty()) map.fitBounds(bounds, 56);

        errorCheckTimer = window.setTimeout(() => {
          const hasGoogleError = containerRef.current?.querySelector(
            '.gm-err-container, .gm-err-title, .gm-err-message',
          );
          if (hasGoogleError) setFailed(true);
        }, 1200);
      })
      .catch(() => setFailed(true));

    return () => {
      if (errorCheckTimer) window.clearTimeout(errorCheckTimer);
      markers.forEach((marker) => marker.setMap(null));
      map = null;
    };
  }, [businesses, customerCoordinates]);

  if (!hasGoogleMapsKey() || failed) {
    return (
      <div className={`flex items-center justify-center bg-brand-100 p-6 ${className}`}>
        <div className="max-w-md text-center">
          <p className="font-display text-2xl font-semibold text-brand-900">
            Map preview unavailable
          </p>
          <p className="mt-2 text-sm leading-6 text-brand-800/65">
            Google Maps rejected the current browser key configuration. Vendor
            coordinates are still saved, and the map will appear after the API
            key restrictions are corrected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden bg-brand-100 ${className}`}
      aria-label="Vendor map"
    />
  );
};

export default GoogleVendorMap;
