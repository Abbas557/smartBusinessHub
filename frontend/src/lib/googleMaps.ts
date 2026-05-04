export interface ParsedGoogleAddress {
  label: string;
  lat: number;
  lng: number;
  placeId?: string;
  city?: string;
  area?: string;
  pincode?: string;
}

declare global {
  interface Window {
    google?: any;
    initSmartHubGoogleMaps?: () => void;
  }
}

let loaderPromise: Promise<any> | null = null;

export const getGoogleMapsApiKey = () =>
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export const hasGoogleMapsKey = () => Boolean(getGoogleMapsApiKey());

export const loadGoogleMaps = () => {
  if (window.google?.maps?.places) return Promise.resolve(window.google);
  if (loaderPromise) return loaderPromise;

  const apiKey = getGoogleMapsApiKey();
  if (!apiKey) {
    return Promise.reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'));
  }

  loaderPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-smart-hub-google-maps="true"]',
    );

    window.initSmartHubGoogleMaps = () => resolve(window.google);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.google));
      existingScript.addEventListener('error', () =>
        reject(new Error('Google Maps failed to load')),
      );
      return;
    }

    const script = document.createElement('script');
    script.dataset.smartHubGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}` +
      '&libraries=places&loading=async&callback=initSmartHubGoogleMaps';
    script.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.appendChild(script);
  });

  return loaderPromise;
};

export const parseGooglePlace = (place: any): ParsedGoogleAddress | null => {
  const location = place.geometry?.location;
  if (!location) return null;

  const components = place.address_components || [];
  const findComponent = (types: string[]) =>
    components.find((component: any) =>
      types.some((type) => component.types?.includes(type)),
    )?.long_name;

  const city =
    findComponent(['locality']) ||
    findComponent(['administrative_area_level_3']) ||
    findComponent(['postal_town']);
  const area =
    findComponent(['sublocality_level_1']) ||
    findComponent(['sublocality']) ||
    findComponent(['neighborhood']) ||
    findComponent(['route']);
  const pincode = findComponent(['postal_code']);

  return {
    label: place.formatted_address || place.name || '',
    lat: typeof location.lat === 'function' ? location.lat() : location.lat,
    lng: typeof location.lng === 'function' ? location.lng() : location.lng,
    placeId: place.place_id,
    city,
    area,
    pincode,
  };
};

export const getBrowserLocation = () =>
  new Promise<{ lat: number; lng: number }>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 1000 * 60 * 5,
      },
    );
  });
