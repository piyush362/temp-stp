import {
  Image,
  StyleSheet,
  Text,
  TextInput as RNTextInput,
  View,
  Dimensions,
  Keyboard,
} from 'react-native';
import React from 'react';
import {ScreenWrapper} from '../../components/wrapper';
import {IMAGES} from '../../theme/images';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import {COLORS} from '../../theme/colors';
import {useNavigation} from '@react-navigation/native';
import Swiper from 'react-native-swiper';
import CustomGradientButton from '../../components/buttons/CustomGradientButton';
import {useDispatch} from 'react-redux';
import {
  setAuthorizationStatus,
  setIsNewUser,
} from '../../redux/slices/auth.slice';
import {showSnackbar} from '../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../types/common.types';
import {
  sentLoginOtpService,
  verifySignInOtpService,
} from '../../service/authService';
import {getErrorMessage, JSONOBJECTLOG, saveAccessTokenToAsyncStorage} from '../../utils/utils';

const {width, height} = Dimensions.get('window');

const swiperData = [
  {
    id: 1,
    title: 'Upload Your Documents & Make Payment',
    description:
      'Select files from your phone upload them securely, and complete your payment hassle-free.',
    image: IMAGES.authSlider1,
  },
  {
    id: 2,
    title: 'Choose Print Options',
    description:
      'Customize your print by choosing between A4 or A3 paper size and selecting color or black & white printing.',
    image: IMAGES.authSlider2,
  },
  {
    id: 3,
    title: 'Receive Your Printing Code',
    description:
      'After payment, get a unique code that you can use at any kiosk machine for printing.',
    image: IMAGES.authSlider3,
  },
  {
    id: 4,
    title: 'Find & Print at a Kiosk',
    description:
      ' Use the app to find the nearest kiosk, enter your unique code, and print your documents effortlessly..',
    image: IMAGES.authSlider4,
  },
];

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [tempOtp, setTempOtp] = React.useState('');
  const [otpSentStatus, setOtpSentStatus] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [resendTimer, setResendTimer] = React.useState(30);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpSentStatus && resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setIsResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [otpSentStatus, resendTimer]);

  const handleSentOtp = async () => {
    Keyboard.dismiss();
    if (phoneNumber.trim().length !== 10) {
      dispatch(
        showSnackbar({
          message: 'Please enter a valid mobile number',
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
      return;
    }
    try {
      setIsLoading(true);
      const response = await sentLoginOtpService(phoneNumber.trim());
      if (response?.success) {
        setTempOtp(response?.data?._otp);
        dispatch(
          showSnackbar({
            message: 'OTP sent successfully',
            type: SnackbarType.success,
            duration: 2000,
          }),
        );
        setOtpSentStatus(true);
        setResendTimer(30);
        setIsResendDisabled(true);
      }
    } catch (error: any) {
      JSONOBJECTLOG(error);
      const message = getErrorMessage(error);
      dispatch(
        showSnackbar({
          message: message,
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // otp

  const handleVerifyOtp = async () => {
    Keyboard.dismiss();
    if (otp?.length != 6) {
      dispatch(
        showSnackbar({
          message: 'OTP must be of 6 Digits',
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
      return;
    }
    try {
      setIsLoading(true);
      const response = await verifySignInOtpService({
        phone_number: phoneNumber.trim(),
        otp: otp,
      });
      if (response?.success) {
        dispatch(
          showSnackbar({
            message: 'OTP verified successfully',
            type: SnackbarType.success,
            duration: 2000,
          }),
        );
        const isNewUser =
          response?.data?.user_type === 'existing_user' ? false : true;
        dispatch(setIsNewUser(isNewUser));
        saveAccessTokenToAsyncStorage(response?.data?.accessToken);
        dispatch(setAuthorizationStatus(true));
      }
    } catch (error: any) {
      console.log('error', error);
      JSONOBJECTLOG(error);
      const message = getErrorMessage(error);
      dispatch(
        showSnackbar({
          message: message,
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendClicked = () => {
    handleSentOtp();
  };
  const renderSwiperListContent = () => {
    return (
      <View style={styles.swiperWrapper}>
        <Swiper
          // autoplay
          showsPagination
          activeDotColor={COLORS.primary}
          dotColor={COLORS.gray}
          paginationStyle={styles.pagination}>
          {swiperData.map(item => (
            <View key={item.id} style={styles.slide}>
              <Image source={item.image} style={styles.headerImage} />
              <Text style={[BOLD_TEXT(18, COLORS.darkBlue), styles.title]}>
                {item.title}
              </Text>
              <Text style={[REGULAR_TEXT(14, COLORS.gray), styles.description]}>
                {item.description}
              </Text>
            </View>
          ))}
        </Swiper>
      </View>
    );
  };

  const renderLoginContainer = () => {
    return (
      <View
        style={{
          height: height * 0.3,
          justifyContent: 'center',
          paddingHorizontal: 15,
        }}>
        <View style={styles.inputWrapper}>
          <View style={styles.inputBox}>
            <Text style={styles.countryCode}>+91</Text>
            <RNTextInput
              placeholder="Enter your mobile number"
              keyboardType="number-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.textInput}
              placeholderTextColor={COLORS.gray}
            />
          </View>
        </View>

        <View style={styles.buttonWrapper}>
          <CustomGradientButton
            title="Log In"
            onPress={handleSentOtp}
            isLoading={isLoading}
            isDisabled={isLoading}
          />
        </View>
      </View>
    );
  };

  const renderOtpContainer = () => {
    return (
      <View
        style={{
          height: height * 0.3,
          justifyContent: 'center',
          paddingHorizontal: 15,
        }}>
        <View style={styles.inputWrapper}>
          {phoneNumber == '9988776655' && (
            <Text
              style={[
                REGULAR_TEXT(12, COLORS.gray),
                {marginBottom: 10},
              ]}>{`OTP: ${tempOtp}`}</Text>
          )} 

          {/* <Text
              style={[
                REGULAR_TEXT(12, COLORS.gray),
                {marginBottom: 10},
              ]}>{`OTP: ${tempOtp}`}</Text> */}

          <View style={styles.inputBox}>
            <RNTextInput
              placeholder="Enter OTP"
              keyboardType="number-pad"
              maxLength={6}
              value={otp}
              onChangeText={setOtp}
              style={styles.textInput}
              placeholderTextColor={COLORS.gray}
            />
          </View>
        </View>

        {/* // re sent otp text */}

        <Text
          style={[
            REGULAR_TEXT(13, COLORS.gray),
            {marginTop: 15, textAlign: 'center'},
          ]}>
          {isResendDisabled
            ? `Resend OTP in ${resendTimer}s`
            : `Didn't receive OTP? `}
          {!isResendDisabled && (
            <Text
              style={{color: COLORS.primary, fontWeight: 'bold', fontSize: 13}}
              onPress={handleResendClicked}>
              Resend OTP
            </Text>
          )}
        </Text>

        <View style={styles.buttonWrapper}>
          <CustomGradientButton
            title="Verify OTP"
            onPress={handleVerifyOtp}
            isLoading={isLoading}
            isDisabled={isLoading}
          />
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper>
      {renderSwiperListContent()}
      {otpSentStatus ? renderOtpContainer() : renderLoginContainer()}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  swiperWrapper: {
    height: height * 0.6,
    justifyContent: 'center',
    paddingTop: 30,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerImage: {
    width: 260,
    height: height * 0.4,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    textAlign: 'center',
    color: COLORS.gray,
  },
  pagination: {
    bottom: -10,
  },
  inputWrapper: {
    marginTop: 10,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 30,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  countryCode: {
    fontSize: 16,
    color: COLORS.black,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  buttonWrapper: {
    marginTop: 20,
  },
});
