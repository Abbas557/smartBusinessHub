export interface GeocodingResult {
  label: string;
  lat: number;
  lng: number;
  city?: string;
  area?: string;
  pincode?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    suburb?: string;
    neighbourhood?: string;
    postcode?: string;
  };
}

export const searchAddresses = async (
  query: string,
): Promise<GeocodingResult[]> => {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');
  url.searchParams.set('q', trimmed);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error('Address search failed');

  const results = (await response.json()) as NominatimResult[];
  return results.map((result) => ({
    label: result.display_name,
    lat: Number(result.lat),
    lng: Number(result.lon),
    city: result.address?.city || result.address?.town || result.address?.village,
    area: result.address?.suburb || result.address?.neighbourhood,
    pincode: result.address?.postcode,
  }));
};
