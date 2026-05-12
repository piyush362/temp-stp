import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {COLORS} from '../../../theme/colors';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import {editProfileService} from '../../../service/authService';
import {getUserProfileDataService} from '../../../service/userService';
import {setIsNewUser, setUserData} from '../../../redux/slices/auth.slice';
import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import {useNavigation} from '@react-navigation/native';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import ReferralRedeemModal from '../../../components/modals/ReferralRedeemModal';
import {getErrorMessage, JSONOBJECTLOG} from '../../../utils/utils';
import {validateEmail} from '../../../utils/validation';

export default function ProfileScreen() {
  const {userData} = useSelector((state: RootState) => state.auth);

  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {isNewUser} = useSelector((state: RootState) => state.auth);

  const [isReferralModalVisible, setReferralModalVisible] = useState(false);
  const [isReferralFlowActive, setReferralFlowActive] = useState(false);
  const [isReferralFlowSuccess, setReferralFlowSuccess] = useState(false);

  useEffect(() => {
    getUserData();
    if (isNewUser) {
      setReferralFlowActive(true);
      setReferralFlowSuccess(false);
    }
  }, []);

  useEffect(() => {
    setPhoneNumber(userData?.phone_number?.toString() ?? '');
    setEmail(userData?.email_id ?? '');
    setName(userData?.user_name ?? '');
  }, [userData]);

  const renderInput = (
    label: string,
    placeholder: string,
    value: string,
    onChangeText: (t: string) => void,
    keyboardType: 'default' | 'email-address' | 'number-pad' = 'default',
    maxLength?: number,
    isEditable?: boolean,
  ) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>
        {label} <Text style={styles.asterisk}>*</Text>
      </Text>
      <TextInput
        placeholder={placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        value={value}
        onChangeText={onChangeText}
        editable={isEditable}
        style={styles.textInput}
        placeholderTextColor={COLORS.gray}
      />
    </View>
  );

  const getUserData = async () => {
    const response = await getUserProfileDataService();
    if (response?.data?.profileDAta) {
      dispatch(setUserData(response?.data?.profileDAta));
    }
  };

  const handleSave = async () => {
    Keyboard.dismiss();
    if (name.length <= 0 || email.length <= 0) {
      dispatch(
        showSnackbar({
          message: 'Please enter name and email',
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
      return;
    }

    if (!validateEmail(email)) {
      dispatch(
        showSnackbar({
          message: 'Please enter a valid email',
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
      return;
    }

    setIsLoading(true);
    try {
      let formData = new FormData();
      formData.append('user_name', name);
      formData.append('email_id', email);

      // const response = await editProfileService(formData);
      const response = await editProfileService({
        user_name: name,
        email_id: email,
      });
      if (response) {
        dispatch(
          showSnackbar({
            message: 'Profile updated successfully',
            type: SnackbarType.success,
            duration: 2000,
          }),
        );

        if (isNewUser) {
          dispatch(setIsNewUser(false));
          navigation.reset({
            index: 0,
            routes: [{name: 'RootBottomNavigation'} as never],
          });
        }
      }
    } catch (e: any) {
      console.log('Error saving profile:');
      JSONOBJECTLOG(e?.response?.data);
      const message = getErrorMessage(e);
      dispatch(showSnackbar({message, type: SnackbarType.error}));
    } finally {
      setIsLoading(false);
      getUserData();
      navigation.reset({
        index: 0,
        routes: [{name: 'RootBottomNavigation'} as never],
      });
    }
  };

  const renderReferralCard = () => {
    if (!isReferralFlowActive) return null;
    return (
      <View
        style={{
          marginVertical: 10,
          marginBottom: 20,
          borderRadius: 20,
          backgroundColor: COLORS.white,
          padding: 16,
          borderColor: '#cbdaf8ff',
          borderWidth: 1,
        }}>
        <Text style={BOLD_TEXT(16, COLORS.darkBlue)}>
          Get up to ₹20 on your Referral!
        </Text>

        <Text style={[REGULAR_TEXT(14, COLORS.gray), {marginTop: 6}]}>
          Do you have a referral code? Redeem it now and earn exciting rewards.
        </Text>

        <TouchableOpacity
          onPress={() => {
            setReferralModalVisible(true);
          }}
          style={{
            marginTop: 14,
            backgroundColor: 'rgba(124,42,232,1)',
            paddingVertical: 10,
            borderRadius: 20,
            alignItems: 'center',
          }}>
          <Text style={BOLD_TEXT(14, COLORS.white)}>Redeem Now</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderReferralSuccessCard = () => {
    if (!isReferralFlowSuccess) return null;
    return (
      <View
        style={{
          marginVertical: 10,
          marginBottom: 20,
          borderRadius: 20,
          backgroundColor: COLORS.white,
          padding: 16,
          borderColor: '#b8e2c6',
          borderWidth: 1,
          alignItems: 'center',
        }}>
        <View
          style={{
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#d4f7dc',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 12,
          }}>
          <Text style={BOLD_TEXT(28, '#22c55e')}>✓</Text>
        </View>

        <Text style={BOLD_TEXT(16, COLORS.darkBlue)}>
          Referral Code Redeemed!
        </Text>

        <Text
          style={[
            REGULAR_TEXT(14, COLORS.gray),
            {marginTop: 6, textAlign: 'center'},
          ]}>
          You have successfully redeemed your referral code. 🎉
        </Text>
        <Text
          style={[
            REGULAR_TEXT(14, COLORS.gray),
            {marginTop: 4, textAlign: 'center'},
          ]}>
          Your reward will be credited to your account soon.
        </Text>
      </View>
    );
  };

  return (
    <ScreenWrapper
      headerComponent={
        <HeaderNavigation
          label="Profile"
          disableBack={isNewUser ? true : false}
        />
      }>
      <ScrollView style={styles.container}>
        {renderInput(
          'Name',
          'Enter your name',
          name,
          setName,
          'default',
          50,
          true,
        )}
        {renderInput(
          'Email',
          'Enter your email',
          email,
          setEmail,
          'email-address',
        )}
        {renderInput(
          'Mobile Number ( not editable )',
          'Enter your mobile number',
          phoneNumber,
          setPhoneNumber,
          'number-pad',
          10,
          false,
        )}
      </ScrollView>
      <View style={styles.buttonWrapper}>
        {renderReferralCard()}
        {renderReferralSuccessCard()}
        <CustomGradientButton
          title="Save"
          onPress={handleSave}
          isLoading={isLoading}
          isDisabled={isLoading}
        />
      </View>

      <ReferralRedeemModal
        visible={isReferralModalVisible}
        onClose={() => {
          setReferralModalVisible(false);
        }}
        onRedeem={() => {
          setReferralModalVisible(false);
          setReferralFlowActive(false);
          setReferralFlowSuccess(true);
        }}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  inputWrapper: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.gray,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  buttonWrapper: {
    marginBottom: 30,
    marginHorizontal: 15,
    marginTop: 10,
  },
  asterisk: {
    fontSize: 14,
    fontWeight: '600',
    color: 'red',
  },
});
