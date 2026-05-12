import {useState} from 'react';
import {Alert, Linking, Platform} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {isLocationPermissionGranted} from '../utils/permission';
import {
  setCurrentLocation,
  setCurrentLocationDetails,
  setLocationPermissionStatus,
} from '../redux/slices/auth.slice';
import {getLocationViaCoordinateService} from '../service/userService';

export default function useLocations() {
  const dispatch = useDispatch();

  const getLocationService = async () => {
    try {
      const granted = await isLocationPermissionGranted();
      if (!granted) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to find nearby kiosks.',
          [
            {text: 'Cancel', style: 'cancel'},
            {
              text: 'Allow',
              onPress: async () => {
                await Linking.openSettings();
              },
            },
          ],
          {cancelable: true},
        );
        return;
      }

      dispatch(setLocationPermissionStatus(true));

      Geolocation.getCurrentPosition(
        async info => {
          dispatch(setCurrentLocation(info));

          const response = await getLocationViaCoordinateService(
            info.coords.latitude,
            info.coords.longitude,
          );

          dispatch(
            setCurrentLocationDetails({
              city: response.city,
              locality: response.locality,
              principalSubdivision: response.principalSubdivision,
            }),
          );
        },
        error => {
          console.log('Location error:', error);
          Alert.alert('Error', 'Unable to fetch your location.');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        },
      );
    } catch (error) {
      console.log('getLocationService error:', error);
    }
  };

  return {getLocationService};
}
