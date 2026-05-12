import { GOOGLE_API } from '../../app.env';
import {JSONOBJECTLOG} from './utils';

export interface AddressResult {
  formattedAddress: string | null;
  city: string | null;
  district: string | null;
  subLocality: string | null;
  state: string | null;
  pincode: string | null;
  country: string | null;
  location: {
    lat: number;
    lng: number;
  };
}

export const getAddressFromCoordinates = async (
  lat: number,
  lng: number,
): Promise<AddressResult | {error: true; message: string}> => {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data || data.status !== 'OK') {
      return {error: true, message: data.status || 'Failed to fetch'};
    }

    const result = data.results[0];
    if (!result) return {error: true, message: 'No results found'};

    const components: any[] = result.address_components;

    const get = (types: string[]): string | null => {
      const match =
        components.find(c => types.every(t => c.types.includes(t))) ?? null;

      if (!match) return null;
      return match.long_name || match.short_name || null;
    };

    const address: AddressResult = {
      formattedAddress: result.formatted_address || null,

      city:
        get(['locality']) ||
        get(['administrative_area_level_3']) ||
        get(['administrative_area_level_2']) ||
        null,

      district:
        get(['administrative_area_level_2']) ||
        get(['administrative_area_level_3']) ||
        null,

      subLocality:
        get(['sublocality']) ||
        get(['sublocality_level_1']) ||
        get(['neighborhood']) ||
        null,

      state: get(['administrative_area_level_1']) || null,

      pincode: get(['postal_code']) || null,

      country: get(['country']) || null,

      location: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
    };

    console.log('_________________________');
    JSONOBJECTLOG(address);
    console.log('_________________________');
    return address;
  } catch (error: any) {
    return {error: true, message: error.message};
  }
};
