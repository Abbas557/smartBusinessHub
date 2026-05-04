import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { LocateFixed, MapPin, X } from 'lucide-react';
import { Button, Input } from '../ui';
import {
  getBrowserLocation,
  hasGoogleMapsKey,
  loadGoogleMaps,
  ParsedGoogleAddress,
  parseGooglePlace,
} from '../../lib/googleMaps';

interface Props {
  value?: string;
  placeholder?: string;
  onSelect: (result: ParsedGoogleAddress) => void;
  onClear: () => void;
}

const GooglePlaceLocationInput: React.FC<Props> = ({
  value = '',
  placeholder = 'Choose your area from Google Places',
  onSelect,
  onClear,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<any>(null);
  const [displayValue, setDisplayValue] = useState(value);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  useEffect(() => {
    if (!hasGoogleMapsKey() || !inputRef.current) return;

    let isMounted = true;
    loadGoogleMaps()
      .then((google) => {
        if (!isMounted || !inputRef.current) return;
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ['address_components', 'formatted_address', 'geometry', 'name', 'place_id'],
          types: ['geocode'],
        });
        autocompleteRef.current.addListener('place_changed', () => {
          const parsed = parseGooglePlace(autocompleteRef.current.getPlace());
          if (!parsed?.placeId) {
            toast.error('Please select a Google Places suggestion');
            return;
          }
          setDisplayValue(parsed.label);
          onSelect(parsed);
        });
      })
      .catch(() => toast.error('Google Places could not load'));

    return () => {
      isMounted = false;
    };
  }, [onSelect]);

  const handleClear = () => {
    setDisplayValue('');
    onClear();
  };

  const useCurrentLocation = async () => {
    try {
      setIsLocating(true);
      const location = await getBrowserLocation();
      const result: ParsedGoogleAddress = {
        label: 'Current location',
        ...location,
      };
      setDisplayValue(result.label);
      onSelect(result);
    } catch {
      toast.error('Could not access current location');
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={(event) => setDisplayValue(event.target.value)}
        placeholder={
          hasGoogleMapsKey()
            ? placeholder
            : 'Add Google Maps key to use place dropdown'
        }
        leftIcon={<MapPin className="h-4 w-4" />}
        disabled={!hasGoogleMapsKey()}
      />
      <Button
        type="button"
        variant="secondary"
        leftIcon={<LocateFixed className="h-4 w-4" />}
        isLoading={isLocating}
        onClick={useCurrentLocation}
      >
        Current
      </Button>
      <Button
        type="button"
        variant="ghost"
        leftIcon={<X className="h-4 w-4" />}
        onClick={handleClear}
      >
        Clear
      </Button>
    </div>
  );
};

export default GooglePlaceLocationInput;
