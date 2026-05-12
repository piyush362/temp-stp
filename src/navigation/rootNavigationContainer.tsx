import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {StyleSheet, Text} from 'react-native';
import SplashScreen from '../screens/SplashScreen';
import {AppStack} from './appStack';
import {UnAuthStack} from './unAuthStack';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {Snackbar} from 'react-native-paper';
import {SnackbarType} from '../types/common.types';
import {hideSnackbar} from '../redux/slices/snackbar.slice';
import {getAccessTokenFromAsyncStorage} from '../utils/utils';
import {
  setAuthorizationStatus,
  setCurrentLocation,
  setCurrentLocationDetails,
  setLocationPermissionStatus,
} from '../redux/slices/auth.slice';
import {getLocationViaCoordinateService} from '../service/userService';
import {isLocationPermissionGranted} from '../utils/permission';
import Geolocation from '@react-native-community/geolocation';

export function RootNavigationContainer() {
  const [isSplashVisible, setSplashVisible] = useState(true);
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);
  const {visible, message, duration, type} = useSelector(
    (state: RootState) => state.snackbar,
  );

  const dispatch = useDispatch();

  const getLocationDetails = async (info: any) => {
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
  };

  const updateLocationStatus = async () => {
    try {
      const granted = await isLocationPermissionGranted();
      if (granted) {
        dispatch(setLocationPermissionStatus(true));
        Geolocation.getCurrentPosition(info => {
          dispatch(setCurrentLocation(info));
          getLocationDetails(info);
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    updateLocationStatus();
  }, []);

  const init = async () => {
    const token = await getAccessTokenFromAsyncStorage();
    if (token) {
      dispatch(setAuthorizationStatus(true));
    }
  };

  useEffect(() => {
    init();
    const splashTimeout = setTimeout(() => {
      setSplashVisible(false);
    }, 3000);

    return () => clearTimeout(splashTimeout);
  }, []);

  if (isSplashVisible) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <UnAuthStack />}
      <Snackbar
        style={
          type === SnackbarType.error
            ? styles.snackbarError
            : styles.snackbarSuccess
        }
        visible={visible}
        onDismiss={() => dispatch(hideSnackbar())}
        duration={duration}
        action={{
          label: 'X',
          onPress: () => {
            dispatch(hideSnackbar());
          },
        }}>
        {/* {message} */}
        <Text style={{color: type === SnackbarType.error ? 'white' : 'black'}}>
          {message}
        </Text>
      </Snackbar>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  snackbarError: {
    backgroundColor: '#ee5d4a',
    color: 'white',
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  snackbarSuccess: {
    backgroundColor: '#52bb76',
    color: 'white',
    flexDirection: 'row',
  },
});
