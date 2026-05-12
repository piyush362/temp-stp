import React, {useState} from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {COLORS} from '../../theme/colors';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import CustomGradientButton from '../buttons/CustomGradientButton';
import {
  getAccessTokenFromAsyncStorage,
  getErrorMessage,
  JSONOBJECTLOG,
} from '../../utils/utils';
import axios from 'axios';
import {BASEURL} from '../../../app.env';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../types/common.types';

const verifyReferralCodeService = async (payload: {referral_code: string}) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'PATCH',
    headers: {
      'x-access-token': accessToken,
    },
    url: `${BASEURL}/api/auth/referral/verify-referral-code`,
    data: payload,
  });
  return response.data;
};

interface ReferralRedeemModalProps {
  visible: boolean;
  onClose: () => void;
  onRedeem: (code: string) => void;
  isLoading?: boolean;
}

const ReferralRedeemModal: React.FC<ReferralRedeemModalProps> = ({
  visible,
  onClose,
  onRedeem,
  //   isLoading = false,
}) => {
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleRedeem = async () => {
    const parseCode = referralCode.trim();
    if (!parseCode || parseCode.length <= 0) {
      dispatch(
        showSnackbar({
          message: 'Please enter a valid code',
          type: SnackbarType.error,
          duration: 2000,
        }),
      );
      return;
    }

    try {
      Keyboard.dismiss();
      setIsLoading(true);
      const response = await verifyReferralCodeService({
        referral_code: parseCode,
      });
      console.log('response');
      JSONOBJECTLOG(response);
      if (response?.success) {
        const message = response?.data?.message || 'Code verified successfully';
        dispatch(showSnackbar({message, type: SnackbarType.success}));
        onRedeem(parseCode);
      }
    } catch (error: any) {
      JSONOBJECTLOG(error?.response?.data);
      const message = getErrorMessage(error);
      dispatch(showSnackbar({message, type: SnackbarType.error}));
      onClose();
    } finally {
      setIsLoading(false);
      setReferralCode('');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'position'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
          style={{width: '100%'}}>
          <ScrollView
            contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              {/* 🌈 Hero Banner */}
              <LinearGradient
                colors={['#7c2ae8', '#a460ff']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 1}}
                style={styles.heroContainer}>
                <Text style={BOLD_TEXT(20, COLORS.white)}>
                  🎁 Earn Rewards!
                </Text>
                <Text
                  style={[
                    REGULAR_TEXT(14, COLORS.white),
                    {marginTop: 6, textAlign: 'center'},
                  ]}>
                  Get up to ₹20 on your Referral!
                </Text>
              </LinearGradient>

              {/* 🔤 Input Field */}
              <View style={{marginTop: 20, width: '100%', padding: 15}}>
                <Text style={styles.label}>Referral Code</Text>
                <TextInput
                  placeholder="Enter your referral code"
                  placeholderTextColor={COLORS.gray}
                  value={referralCode}
                  onChangeText={setReferralCode}
                  style={styles.textInput}
                  returnKeyType="done"
                />
              </View>

              {/* 🎁 Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  onPress={onClose}
                  style={[styles.outlineButton]}>
                  <Text style={BOLD_TEXT(14, COLORS.gray)}>Cancel</Text>
                </TouchableOpacity>

                <View style={{flex: 1, marginLeft: 10}}>
                  <CustomGradientButton
                    title="Redeem"
                    onPress={handleRedeem}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

export default ReferralRedeemModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: {width: 0, height: 3},
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
    width: '100%',
  },
  heroContainer: {
    width: '100%',
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 8,
    marginLeft: 4,
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
    width: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 24,
    paddingHorizontal: 15,
  },
  outlineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
