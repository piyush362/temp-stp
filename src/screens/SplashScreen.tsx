import {Dimensions, Image, StatusBar, StyleSheet, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../theme/colors';
import {IMAGES} from '../theme/images';
import {ICONS} from '../theme/icons';
import {
  askLocationPermission,
  isLocationPermissionGranted,
} from '../utils/permission';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import Geolocation from '@react-native-community/geolocation';
import {setCurrLatAndLong} from '../redux/slices/location.slice';
import {setCurrentLocation} from '../redux/slices/auth.slice';
import {GOOGLE_API} from '../../app.env';

const {width} = Dimensions.get('window');

export const SplashScreen = () => {
  // const checkAndRequestPermission = async () => {
  //   // setIsLoading(true);
  //   const res = await askLocationPermission();
  //   const granted = await isLocationPermissionGranted();
  //   if (granted || res) {
  //   }
  //   // setIsLoading(false);
  // };

  // useEffect(() => {
  //   checkAndRequestPermission();
  // }, []);

  const {currentLocation} = useSelector(
    (state: RootState) => state.locationSlice,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [locationText, setLocationText] = useState<string>('');

  const dispatch = useDispatch();

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  // ✅ Check + Request permissions properly
  const checkAndRequestPermission = async () => {
    // setIsLoading(true);
    const res = await askLocationPermission();
    const granted = await isLocationPermissionGranted();
    if (granted || res) {
      if (currentLocation) {
        setLocationText(currentLocation);
      } else {
        getCurrentLocation();
      }
    }
    // setIsLoading(false);
  };

  // ✅ Get current coordinates
  const getCurrentLocation = () => {
    setIsLoading(true);
    Geolocation.getCurrentPosition(
      async position => {
        const {latitude, longitude} = position.coords;
        dispatch(setCurrLatAndLong({latitude, longitude}));
        await fetchAddressFromCoords(latitude, longitude);
        // await getAddressFromCoordinates(latitude, longitude);
        setIsLoading(false);
      },
      error => {
        console.log('Location error:', error);
        setIsLoading(false);
        setLocationText('Allow location');
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // ✅ Get address from Google Geocoding API
  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      // const value = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`;
      // console.log(value);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API}`,
      );
      const data = await response.json();
      if (data) {
        const formattedAddress =
          data.results[3]?.formatted_address || 'Unknown';
        dispatch(setCurrentLocation(formattedAddress));
        setLocationText(formattedAddress);
      } else {
        setLocationText('Allow location');
      }
    } catch (error) {
      console.log(error);
      setLocationText('Allow location');
    }
  };

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.detailsContainer}>
        <Image
          source={ICONS.brandLogo}
          style={{width: width / 2, height: width, objectFit: 'contain'}}
        />
        {/* <Image source={IMAGES.splash3} style={{ width: width, height: width, objectFit: 'contain' }} /> */}
      </View>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  detailsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
