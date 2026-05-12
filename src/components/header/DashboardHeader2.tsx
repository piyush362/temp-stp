import {
  Image,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../theme/colors';
import {ICONS} from '../../theme/icons';
import {REGULAR_TEXT} from '../../theme/styles.global';
import {useNavigation} from '@react-navigation/native';
import {RootState} from '../../redux/store';
import Geolocation from '@react-native-community/geolocation';
import {useDispatch, useSelector} from 'react-redux';
import {GOOGLE_API} from '../../../app.env';
import {
  askLocationPermission,
  isLocationPermissionGranted,
} from '../../utils/permission';
import {
  setCurrentLocation,
  setCurrLatAndLong,
} from '../../redux/slices/location.slice';
import { getAddressFromCoordinates } from '../../utils/locationUtil';

const GOOGLE_API_KEY = GOOGLE_API;

export default function DashboardHeader2() {
  const navigation = useNavigation();
  const {userData} = useSelector((state: RootState) => state.auth);
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
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`,
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
    <View style={styles.headerContainer}>
      {/* 📍 Location Section */}
      <TouchableOpacity
        onPress={() => {
          // if (locationText === 'Allow location') {
          //   navigation.navigate('LocationScreen' as never);
          // } else {
          //   getCurrentLocation();
          // }
          navigation.navigate('LocationScreen' as never);
        }}
        style={styles.locationContainer}>
        <View style={styles.iconCircle}>
          <Image
            source={ICONS.pin}
            style={{width: 20, height: 20, resizeMode: 'contain'}}
          />
        </View>
        {isLoading ? (
          <Text style={REGULAR_TEXT(14, '#333')}>Loading...</Text>
        ) : (
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={[REGULAR_TEXT(12, '#333'), {maxWidth: 180}]}>
            {currentLocation || 'Allow location'}
          </Text>
        )}
      </TouchableOpacity>

      {/* 💰 Wallet Section */}
      <TouchableOpacity
        onPress={() => navigation.navigate('WalletScreen' as never)}
        style={styles.walletContainer}>
        <Image
          source={ICONS.wallet}
          style={{width: 33, height: 33, resizeMode: 'contain'}}
        />
        <Text style={REGULAR_TEXT(14, '#333')}>
          ₹ {userData?.wallet_balance ?? 0}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    elevation: 2,
  },
  walletContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    elevation: 2,
  },
  iconCircle: {
    backgroundColor: COLORS.darkBlue,
    padding: 5,
    borderRadius: 50,
  },
});
