import Geolocation from '@react-native-community/geolocation';
import {Alert, Linking, PermissionsAndroid, Platform} from 'react-native';

/**
 * Asks for location permission (Android only)
 * and opens settings if denied permanently.
 * @returns Promise<boolean> - whether permission was granted
 */
export const requestAndCheckLocationPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    return true; // iOS handles permission via system UI
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission Required',
        message: 'We need your location to find nearby kiosks.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    } else {
      Alert.alert(
        'Location Permission Denied',
        'Please enable location access from Settings to use this feature.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Open Settings',
            onPress: () => Linking.openSettings(),
          },
        ],
        {cancelable: true},
      );
      return false;
    }
  } catch (error) {
    console.warn('Permission error:', error);
    return false;
  }
};

export const isLocationPermissionGranted = async (): Promise<boolean> => {
  if (Platform.OS === 'ios') {
    // iOS handles it via system settings – assume true
    return true;
  }

  const granted = await PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );

  return granted;
};

export const askLocationPermission = async () => {
  if (Platform.OS === 'android') {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message:
          'This app needs access to your location to show your current position.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    // iOS
    const auth = await Geolocation.requestAuthorization();
  }

  return true;
};
