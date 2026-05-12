import {
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import {ScreenWrapper} from '../../components/wrapper';
import {IMAGES} from '../../theme/images';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  BOLD_TEXT,
  BUTTON_CONTAINER_STYLES,
  INPUT_CONTAINER_STYLES,
  REGULAR_TEXT,
  STYLES,
} from '../../theme/styles.global';
import {COLORS} from '../../theme/colors';
import {Button, TextInput} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';
import {OtpInput} from 'react-native-otp-entry';
import {scale} from 'react-native-size-matters';
import {useDispatch} from 'react-redux';
import {setAuthorizationStatus} from '../../redux/slices/auth.slice';

export default function VerifyOtpScreen() {
  const [phoneOtp, setPhoneOTP] = React.useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const handleVerifyOtp = async () => {
    dispatch(setAuthorizationStatus(true));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text
        allowFontScaling={false}
        style={[BOLD_TEXT(30), {textAlign: 'center', marginTop: 20}]}>
        Verify OTP
      </Text>

      <TouchableOpacity onPress={handleVerifyOtp}>
        <Text style={[BOLD_TEXT(30), {textAlign: 'center', marginTop: 20}]}>
          Veerify OTP
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg1,
    justifyContent: 'space-between',
  },
  headerImage: {
    width: '95%',
    height: 320,
    objectFit: 'contain',
  },
  imageBackground: {
    width: '100%',
    flex: 1,
    resizeMode: 'contain',
  },
});
