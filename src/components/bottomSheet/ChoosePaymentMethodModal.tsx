/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import {COLORS, primaryGradient, secondaryGradient} from '../../theme/colors';
import {RadioButton} from 'react-native-paper';
import CustomGradientButton from '../buttons/CustomGradientButton';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../theme/icons';
import {JSONOBJECTLOG} from '../../utils/utils';
import {payDocViaWalletService} from '../../service/authService';
import {
  createRazorpayOrderService,
  handleSubPaisaPaymentService,
  initiateSubPaisaPaymentService,
  verifyRazorpayPaymentService,
} from '../../service/paymentService';
// import SabPaisaCheckout, {
//   SabpaisaCheckoutOptions,
// } from 'sabpaisa-react-lib-lite';
import RazorpayCheckout from 'react-native-razorpay';
import {
  BASEURL,
  RAZORPAY_KEY,
  SUB_PAISA_AUTH_IV_KEY,
  SUB_PAISA_AUTH_KEY,
  SUB_PAISA_PASSWORD,
  SUB_PAISA_USERNAME,
} from '../../../app.env';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';

interface Props {
  visible: any; // kept same for compatibility
  onProceed: (kioskData: string) => void;
  amount?: number;
  paperSpecs: any;
  uploadedDocumentResponse: any;
  onCancel?: () => void;
}

export default function ChoosePaymentMethodModal({
  visible,
  onProceed,
  amount,
  paperSpecs,
  uploadedDocumentResponse,
  onCancel,
}: Props) {
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'other'>(
    'other',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaderActive, setIsLoaderActive] = useState(false);

  const [responseKioskData, setResponseKioskData] = useState('');

  const {userData} = useSelector((state: RootState) => state.auth);
  //   userData?.wallet_balance ?? 0

  const handleProceed = async () => {
    if (!paperSpecs || !uploadedDocumentResponse) {
      Alert.alert('Please select paper specs and upload document');
      return;
    }

    if (paymentMethod == 'other') {
      // handleSabPaisaPayment();
      createRazorPayOrder();
      return;
    }
    // print_type` enum('colored','black & white') DEFAULT NULL,
    const _payload = {
      print_price_id: paperSpecs?.priceCombination?.print_price_id,
      // paper_size: paperSpecs?.paperSize,
      // print_type: paperSpecs?.printType == 'bw' ? 'black & white' : 'colored',
      print_orientation: paperSpecs?.printOrientation,
      number_of_copies: paperSpecs?.numberOfCopies,
      number_of_pages: paperSpecs?.pageLength,
      document_token: uploadedDocumentResponse?.document_upload_token,
    };

    JSONOBJECTLOG(_payload);

    try {
      setIsLoading(true);
      const response = await payDocViaWalletService(_payload);
      // JSONOBJECTLOG(response);
      onProceed(response?.data);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.msg ||
        'An error occurred';
      Alert.alert(message);
      JSONOBJECTLOG(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySabPaisaPayment = async (data: any) => {
    try {
      setIsLoaderActive(true);
      console.log('verify payment apis');
      const response = await handleSubPaisaPaymentService({
        data: {id_mobile_app: true, pg_res: data},
      });
      console.log('success payment from handle sab paisa payment :✅');
      JSONOBJECTLOG(response);
      onProceed('');
    } catch (error: any) {
      console.log('error payment from handle sab paisa payment :❌');
      Alert.alert('Error', error?.message || 'Something went wrong');
    } finally {
      setIsLoaderActive(false);
    }
  };

  const handleSabPaisaPayment = async () => {
    try {
      setIsLoaderActive(true);
      const _payload = {
        print_price_id: paperSpecs?.priceCombination?.print_price_id,
        print_orientation: paperSpecs?.printOrientation,
        number_of_copies: paperSpecs?.numberOfCopies,
        document_token: uploadedDocumentResponse?.document_upload_token,
      };
      const response = await initiateSubPaisaPaymentService(_payload);
      console.log('response', response);

      const clientTxnId = response?.data?.clientTxnId || '231de53b1c1c2b1c5c32';
      const clientCode = response?.data?.clientCode || 'DJ020';

      // setResponseKioskData(response?.kiosk_data);

      // var options: SabpaisaCheckoutOptions = {
      //   // user data
      //   first_name: `${userData?.user_name ?? `UserId ${userData?.user_id}`}`,
      //   last_name: `${userData?.user_name ?? `UserId ${userData?.user_id}`}`,
      //   currency: 'INR',
      //   mobile_number: `${
      //     userData?.phone_number ?? `User: ${userData?.user_id}`
      //   }`,
      //   email_id: `${userData?.email_id ?? 'email@email.com'}`,

      //   // payment data
      //   client_code: clientCode,
      //   aes_iv: SUB_PAISA_AUTH_IV_KEY,
      //   aes_key: SUB_PAISA_AUTH_KEY,
      //   user_name: SUB_PAISA_USERNAME,
      //   password: SUB_PAISA_PASSWORD,
      //   env: 'prod', // staging/prod
      //   txn_id: clientTxnId,
      //   amount: paperSpecs?.calculatedPrice || 0,
      //   callback_url: BASEURL,
      //   udf1: '1',
      //   udf2: '2',
      //   udf3: '3',
      //   udf4: '4',
      //   udf5: '5',
      //   udf6: '6',
      //   udf7: '7',
      //   udf8: '8',
      //   udf9: '9',
      //   udf10: '10',
      //   udf11: '11',
      //   udf12: '12',
      //   udf13: '13',
      //   udf14: '14',
      //   udf15: '15',
      //   udf16: '16',
      //   udf17: '17',
      //   udf18: '18',
      //   udf19: '19',
      //   udf20: '20',
      // };
      // console.log('options');
      // JSONOBJECTLOG(options);
      // console.log('payment started');
      // SabPaisaCheckout.open(options)
      //   .then((data: any) => {
      //     console.log('success payment from sabpaisa :✅');
      //     handleVerifySabPaisaPayment(data);
      //   })
      //   .catch((error: any) => {
      //     console.log('error payment  from sabpaisa :❌');
      //     JSONOBJECTLOG(error);
      //     const message =
      //       error?.response?.data?.message ||
      //       error?.response?.data?.msg ||
      //       error?.message ||
      //       error?.data?.message ||
      //       'An error occurred';
      //     Alert.alert(message);
      //     JSONOBJECTLOG(error);
      //   });
    } catch (error: any) {
      JSONOBJECTLOG(error?.response?.data);
    } finally {
      setIsLoaderActive(false);
    }
  };

  const createRazorPayOrder = async () => {
    try {
      setIsLoaderActive(true);
      const _payload = {
        print_price_id: paperSpecs?.priceCombination?.print_price_id,
        print_orientation: paperSpecs?.printOrientation,
        number_of_copies: paperSpecs?.numberOfCopies,
        number_of_pages: paperSpecs?.pageLength,
        document_token: uploadedDocumentResponse?.document_upload_token,
      };
      JSONOBJECTLOG(_payload);
      const response = await createRazorpayOrderService(_payload);
      // JSONOBJECTLOG(response);
      // return;
      if (response.success) {
        const orderId = response?.data?.order_id;
        const amount = response?.data?.amount;
        if (orderId) {
          handleRazorPayPayment(orderId, amount);
        }
      }
    } catch (error: any) {
      JSONOBJECTLOG(error?.response?.data);
      setIsLoaderActive(false);
    }
  };

  const handleRazorPayPayment = async (orderId: any, amount: any) => {
    try {
      var options = {
        description: 'StapplesS',
        image: 'https://www.stapples.in/assets/brandLogo-6ZlFvf9O.png',
        currency: 'INR',
        key: RAZORPAY_KEY,
        order_id: orderId,
        amount: Number(amount) * 100,
        name: 'Stapples',
        prefill: {
          email: `${userData?.email_id ?? 'email@email.com'}`,
          contact: `${userData?.phone_number ?? `User: ${userData?.user_id}`}`,
          name: `${userData?.user_name ?? `UserId ${userData?.user_id}`}`,
        },
        notes: {},
        theme: {color: COLORS.primary},
      };

      RazorpayCheckout.open(options)
        .then(_payData => {
          const signature = _payData?.razorpay_signature;
          const payId = _payData?.razorpay_payment_id;
          const orderId = _payData?.razorpay_order_id;
          verifyRazorPayPayment(orderId, payId, signature);
        })
        .catch((error: any) => {
          console.log('ERROR IN INITIATE PAYMENT');
          console.log(error);
          const message =
            error?.description || 'Something went wrong! Try again.';
          setIsLoaderActive(false);
          Alert.alert('Error', 'Something went wrong');
        });
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
      setIsLoaderActive(false);
    }
  };

  const verifyRazorPayPayment = async (
    orderId: string,
    payId: string,
    signature: string,
  ) => {
    try {
      const response = await verifyRazorpayPaymentService({
        order_id: orderId,
        payment_id: payId,
        signature: signature,
      });
      console.log('response', response);
      if (response?.success) {
        onProceed('');
      }
    } catch (error: any) {
      console.log(error?.response?.data);
    } finally {
      setIsLoaderActive(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => {
        setPaymentMethod('other');
        onCancel?.();
      }}>
      <View style={styles.modalWrapper}>
        <View style={styles.modalContainer}>
          <View style={{flex: 1, justifyContent: 'space-between'}}>
            <View style={{padding: 20}}>
              <View style={styles.headerRow}>
                <Text
                  style={[REGULAR_TEXT(14, COLORS.gray), styles.subHeading]}>
                  Select Payment Method
                </Text>

                <TouchableOpacity
                  onPress={() => {
                    setPaymentMethod('other');
                    onCancel?.();
                  }}
                  hitSlop={20}
                  style={styles.closeButton}>
                  <Image
                    source={ICONS.cross}
                    style={styles.closeIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                <TouchableOpacity
                  hitSlop={10}
                  style={styles.radioOption}
                  onPress={() => setPaymentMethod('other')}>
                  <View
                    style={[
                      styles.outerCircle,
                      paymentMethod === 'other' && styles.outerCircleActive,
                    ]}>
                    {paymentMethod === 'other' && (
                      <View style={styles.innerCircle} />
                    )}
                  </View>
                  <TouchableOpacity
                    hitSlop={10}
                    onPress={() => setPaymentMethod('other')}>
                    <Text style={REGULAR_TEXT(13)}>Pay</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

                <TouchableOpacity
                  hitSlop={10}
                  style={styles.radioOption}
                  onPress={() => setPaymentMethod('wallet')}>
                  <View
                    style={[
                      styles.outerCircle,
                      paymentMethod === 'wallet' && styles.outerCircleActive,
                    ]}>
                    {paymentMethod === 'wallet' && (
                      <View style={styles.innerCircle} />
                    )}
                  </View>
                  <TouchableOpacity
                    hitSlop={10}
                    onPress={() => setPaymentMethod('wallet')}>
                    <Text style={REGULAR_TEXT(13)}>Wallet</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
              {paymentMethod === 'wallet' ? (
                <Text
                  style={[
                    REGULAR_TEXT(12, COLORS.gray),
                  ]}>{`Wallet Balance: Rs.${Number(
                  userData?.wallet_balance ?? 0,
                ).toFixed(2)}`}</Text>
              ) : (
                <Text style={[REGULAR_TEXT(12, COLORS.gray)]}> </Text>
              )}

              <Text style={[REGULAR_TEXT(15, COLORS.gray)]}>
                Payment Summary
              </Text>
              <View style={styles.amountContainer}>
                <Text style={[REGULAR_TEXT(14, COLORS.bg3), {width: '60%'}]}>
                  Amount
                </Text>
                <Text
                  style={[
                    BOLD_TEXT(14, 'rgba(54, 0, 125, 1)'),
                    {width: '40%', textAlign: 'right'},
                  ]}>
                  ₹{`${paperSpecs?.calculatedPrice || 0}`}
                </Text>
              </View>
              <View style={styles.amountContainer}>
                <Text style={[REGULAR_TEXT(14, COLORS.bg3), {width: '60%'}]}>
                  GST
                </Text>
                <Text
                  style={[
                    BOLD_TEXT(14, 'rgba(54, 0, 125, 1)'),
                    {width: '40%', textAlign: 'right'},
                  ]}>
                  RS. 0
                </Text>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder="Apply Coupon Code"
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => {}}>
                <LinearGradient
                  style={styles.arrowButton}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={primaryGradient}>
                  <Image
                    source={ICONS.arrowLeft}
                    style={{
                      width: 20,
                      height: 20,
                      tintColor: COLORS.white,
                      alignSelf: 'center',
                    }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <LinearGradient
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              colors={secondaryGradient}>
              <View style={styles.footer}>
                <Text style={[REGULAR_TEXT(14, COLORS.gray)]}>
                  Total{' '}
                  <Text style={[BOLD_TEXT(14, COLORS.gray)]}>
                    ₹{`${paperSpecs?.calculatedPrice || 0}`}
                  </Text>
                </Text>
                {/* <CustomGradientButton
                  onPress={handleProceed}
                  title="Continue"
                  isLoading={isLoading}
                  isDisabled={isLoading}
                  outerContainerStyle={{width: '40%', height: 40}}
                  labelStyle={{fontSize: 14}}
                  innerContainerStyle={{paddingVertical: 7}}
                /> */}
                <TouchableOpacity
                  onPress={handleProceed}
                  hitSlop={15}
                  style={{
                    backgroundColor: COLORS.splashBackground,
                    paddingHorizontal: 30,
                    paddingVertical: 10,
                    borderRadius: 10,
                  }}>
                  <Text style={[BOLD_TEXT(14, COLORS.white)]}>Continue</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          {isLoaderActive && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    height: 500,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: COLORS.mainBg,
    overflow: 'hidden',
  },
  heading: {marginBottom: 20, textAlign: 'center'},
  section: {flexDirection: 'row', marginBottom: 20, gap: 10},
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    padding: 20,
  },
  subHeading: {marginVertical: 10},
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderColor: COLORS.offGray,
    borderWidth: 1,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // keeps text left & cross right
    paddingHorizontal: 5,
  },
  closeButton: {
    padding: 4, // gives a decent touch target
  },
  closeIcon: {
    width: 20,
    height: 20,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  outerCircleActive: {
    borderColor: COLORS.bg2, // active border color
  },
  innerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.bg2, // fill color when selected
  },
});
