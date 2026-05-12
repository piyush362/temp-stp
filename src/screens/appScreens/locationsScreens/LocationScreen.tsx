import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, View, ActivityIndicator, Alert} from 'react-native';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../../../redux/store';
import Geolocation from '@react-native-community/geolocation';
import {isLocationPermissionGranted} from '../../../utils/permission';
import {
  setCurrentLocation,
  setCurrLatAndLong,
} from '../../../redux/slices/location.slice';
import {GOOGLE_API} from '../../../../app.env';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';

const GOOGLE_API_KEY = GOOGLE_API;

export default function LocationScreen() {
  const {currLatAndLong, currentLocation} = useSelector(
    (state: RootState) => state.locationSlice,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState<any>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    // fetch location on mount
    // getCurrentLocation();
  }, []);

  // 🔄 Refresh location
  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const granted = await isLocationPermissionGranted();
      if (!granted) {
        setIsLoading(false);
        Alert.alert('Permission Denied', 'Please enable location permission');
        return;
      }

      Geolocation.getCurrentPosition(
        async position => {
          const {latitude, longitude} = position.coords;
          dispatch(setCurrLatAndLong({latitude, longitude}));
          await fetchAddressFromCoords(latitude, longitude);
          setIsLoading(false);
        },
        error => {
          console.log('Location error:', error);
          setIsLoading(false);
          Alert.alert('Error', 'Unable to fetch location');
        },
        {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
      );
    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  };

  // 📍 Fetch address + details from Google API
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
      );
      const data = await response.json();

      if (data.status === 'OK') {
        const formattedAddress =
          data.results[3]?.formatted_address || 'Unknown';
        dispatch(setCurrentLocation(formattedAddress));

        // save address string in redux
        dispatch(setCurrentLocation(formattedAddress));

        // extract details
        const components = data.results[3]?.address_components || [];
        const city =
          components.find((c: any) => c.types.includes('locality'))
            ?.long_name || '';
        const locality =
          components.find((c: any) =>
            c.types.includes('administrative_area_level_2'),
          )?.long_name || '';
        const principalSubdivision =
          components.find((c: any) =>
            c.types.includes('administrative_area_level_1'),
          )?.long_name || '';

        const postalCode =
          components.find((c: any) => c.types.includes('postal_code'))
            ?.long_name || '';

        setLocationDetails({
          city,
          locality,
          principalSubdivision,
          postalCode,
        });
      } else {
        dispatch(setCurrentLocation('Unknown address'));
        setLocationDetails(null);
      }
    } catch (error) {
      console.log(error);
      dispatch(setCurrentLocation('Unknown address'));
      setLocationDetails(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label="Location" />}
      disableScroll={true}>
      <SafeAreaView style={styles.container}>
        <View style={styles.infoBox}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007bff" />
          ) : currLatAndLong?.latitude ? (
            <>
              <Text style={styles.label}>
                Latitude: {currLatAndLong.latitude}
              </Text>
              <Text style={styles.label}>
                Longitude: {currLatAndLong.longitude}
              </Text>
              <Text style={[styles.label, {marginTop: 10}]}>
                Address: {currentLocation || 'Fetching...'}
              </Text>
            </>
          ) : (
            <Text style={styles.label}>Location not available</Text>
          )}

          {locationDetails && (
            <View style={{alignItems: 'center', marginTop: 15}}>
              <Text style={styles.label}>City: {locationDetails.city}</Text>
              <Text style={styles.label}>
                Locality: {locationDetails.locality}
              </Text>
              <Text style={styles.label}>
                State: {locationDetails.principalSubdivision}
              </Text>
              <Text style={styles.label}>
                Postal Code: {locationDetails.postalCode}
              </Text>
            </View>
          )}
        </View>

        <CustomGradientButton
          title="Refresh Location"
          onPress={getCurrentLocation}
          isDisabled={isLoading}
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  infoBox: {
    marginBottom: 20,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginVertical: 5,
  },
});
