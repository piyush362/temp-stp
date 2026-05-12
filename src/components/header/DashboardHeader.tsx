import {
  Alert,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {COLORS} from '../../theme/colors';
import {ICONS} from '../../theme/icons';
import {REGULAR_TEXT} from '../../theme/styles.global';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {
  isLocationPermissionGranted,
  requestAndCheckLocationPermission,
} from '../../utils/permission';
import {
  setCurrentLocation,
  setLocationPermissionStatus,
} from '../../redux/slices/auth.slice';
import Geolocation from '@react-native-community/geolocation';
import {JSONOBJECTLOG} from '../../utils/utils';

export default function DashboardHeader() {
  const navigation = useNavigation();
  const {
    userData,
    locationPermissionStatus,
    currentLocation,
    currentLocationDetails,
  } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = React.useState(false);

  const dispatch = useDispatch();
  // JSONOBJECTLOG(currentLocation);

  const updateLocationStatus = async () => {
    setIsLoading(true);
    const granted = await isLocationPermissionGranted();
    if (granted) {
      dispatch(setLocationPermissionStatus(true));
      Geolocation.getCurrentPosition(info => {
        dispatch(setCurrentLocation(info));
      });
    }
    setIsLoading(false);
  };

  const getCurrentLocation = async () => {
    try {
      setIsLoading(true);
      const position = await new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => resolve(position),
          error => reject(error),
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      });
      dispatch(setLocationPermissionStatus(true));
      dispatch(setCurrentLocation(position));
      updateLocationStatus();
    } catch (error: any) {
      console.log('Location error:', error);

      Alert.alert(
        'Location Permission Required',
        'To find nearby kiosks, please enable location access in settings.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Allow',
            onPress: async () => {
              // await requestAndCheckLocationPermission();
              await Linking.openSettings();
              updateLocationStatus();
            },
          },
        ],
        {cancelable: true},
      );
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      updateLocationStatus();
    }, []),
  );

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        onPress={() => {
          // if (!locationPermissionStatus) {
          //   getCurrentLocation();
          // }
          navigation.navigate('LocationScreen' as never);
        }}
        style={styles.locationContainer}>
        <View
          style={{
            backgroundColor: COLORS.darkBlue,
            padding: 5,
            borderRadius: 50,
          }}>
          <Image
            source={ICONS.pin}
            style={{width: 20, height: 20, objectFit: 'contain'}}
          />
        </View>
        {isLoading ? (
          <Text style={REGULAR_TEXT(14, '#333')}>Loading...</Text>
        ) : (
          <Text style={REGULAR_TEXT(14, '#333')}>
            {currentLocationDetails
              ? `${currentLocationDetails?.locality || 'Unknown'}`
              : 'Please Allow Location'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('WalletScreen' as never)}
        style={styles.walletContainer}>
        <View style={{}}>
          <Image
            source={ICONS.wallet}
            style={{width: 33, height: 33, objectFit: 'contain'}}
          />
        </View>
        <Text style={REGULAR_TEXT(14, '#333')}>{`₹ ${
          userData?.wallet_balance ?? 0
        }`}</Text>
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
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  walletContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
});
