import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LocateFixed, MapPin } from 'lucide-react';
import { Button, Input } from '../ui';
import {
  getBrowserLocation,
  hasGoogleMapsKey,
  loadGoogleMaps,
  ParsedGoogleAddress,
  parseGooglePlace,
} from '../../lib/googleMaps';

interface Props {
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  onSelect: (result: ParsedGoogleAddress) => void;
}

const GoogleAddressAutocomplete: React.FC<Props> = ({
  label = 'Address search',
  placeholder = 'Search address, area, city, or pincode',
  defaultValue = '',
  onSelect,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [value, setValue] = useState(defaultValue);
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    if (!hasGoogleMapsKey() || !inputRef.current) return;

    let isMounted = true;
    setIsLoadingMaps(true);
    loadGoogleMaps()
      .then((google) => {
        if (!isMounted || !inputRef.current) return;
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
          types: ['geocode'],
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const place = autocompleteRef.current.getPlace();
          const parsed = parseGooglePlace(place);
          if (!parsed) {
            toast.error('Select an address from Google suggestions');
            return;
          }
          setValue(parsed.label);
          onSelect(parsed);
        });
      })
      .catch(() => toast.error('Google address search could not load'))
      .finally(() => {
        if (isMounted) setIsLoadingMaps(false);
      });

    return () => {
      isMounted = false;
    };
  }, [onSelect]);

  const useCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const location = await getBrowserLocation();
      const result: ParsedGoogleAddress = {
        label: 'Current location',
        ...location,
      };
      setValue(result.label);
      onSelect(result);
      toast.success('Current location selected');
    } catch {
      toast.error('Could not access current location');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="rounded-lg border border-brand-100 bg-white p-4">
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={hasGoogleMapsKey() ? placeholder : 'Add VITE_GOOGLE_MAPS_API_KEY to enable Google search'}
          leftIcon={<MapPin className="h-4 w-4" />}
          disabled={!hasGoogleMapsKey()}
        />
        <Button
          type="button"
          variant="secondary"
          isLoading={isLocating}
          leftIcon={<LocateFixed className="h-4 w-4" />}
          onClick={useCurrentLocation}
        >
          Use current
        </Button>
      </div>
      <p className="mt-2 text-xs text-brand-800/55">
        {hasGoogleMapsKey()
          ? isLoadingMaps
            ? 'Loading Google Places...'
            : 'Choose a suggestion to save precise coordinates.'
          : 'Google Places is disabled until the frontend environment key is added.'}
      </p>
    </div>
  );
};

export default GoogleAddressAutocomplete;
