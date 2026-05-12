/* eslint-disable react-native/no-inline-styles */
import {Image, Keyboard, StyleSheet, Text, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import LinearGradient from 'react-native-linear-gradient';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {COLORS, primaryGradient} from '../../../theme/colors';
import {ICONS} from '../../../theme/icons';
import AddMoneyBottomSheet from './AddMoneyBottomSheet';
import SuccessModal from '../../../components/modals/SuccessModal';
import {
  addMoneyToWalletService,
  getUserProfileDataService,
} from '../../../service/userService';
import {getErrorMessage, JSONOBJECTLOG} from '../../../utils/utils';
import {useDispatch, useSelector} from 'react-redux';
import {setUserData} from '../../../redux/slices/auth.slice';
import {RootState} from '../../../redux/store';
import TransactionListContainer from './TransactionListContainer';
import {
  createRazorpayOrderForAddWalletService,
  getWalletTransactionListService,
  verifyRazorpayPaymentForAddWalletService,
} from '../../../service/walletService';
import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import {RAZORPAY_KEY} from '../../../../app.env';
import RazorpayCheckout from 'react-native-razorpay';
import AddMoneyBottomModal from './AddMoneyBottomModal';

export default function WalletScreen() {
  const bottomSheetRef = useRef<any>(null);
  const [isAddMoneySuccessModalVisible, setIsAddMoneySuccessModalVisible] =
    useState(false);

  const [isAddMoneyModalVisible, setIsAddMoneyModalVisible] = useState(false);

  const dispatch = useDispatch();
  const {userData} = useSelector((state: RootState) => state.auth);

  const [transactions, setTransactions] = useState([]);
  const [transactionLoading, setTransactionLoading] = useState(false);

  const openBottomSheet = () => {
    // bottomSheetRef.current?.open();
    setIsAddMoneyModalVisible(true);
  };

  const getUserData = async () => {
    const response = await getUserProfileDataService();
    if (response?.data?.profileDAta) {
      dispatch(setUserData(response?.data?.profileDAta));
    }
  };

  const addMoneyHandler = async (amount: number) => {
    createRazorPayOrder(amount);
    return;
    try {
      // const response = await addMoneyToWalletService({amount: amount});
      // JSONOBJECTLOG(response);
      setIsAddMoneySuccessModalVisible(true);
    } catch (error) {
      console.log(error);
    } finally {
      getUserData();
      setIsAddMoneySuccessModalVisible(true);
    }
  };

  const createRazorPayOrder = async (amount: number) => {
    Keyboard.dismiss();
    try {
      const _payload = {amount: amount};
      const response = await createRazorpayOrderForAddWalletService(_payload);
      if (response.success) {
        const orderId = response?.data?.order?.id;
        const amount = response?.data?.order?.amount;
        if (orderId) {
          handleRazorPayPayment(orderId, amount);
        }
      }
    } catch (error: any) {
      JSONOBJECTLOG(error?.response?.data);
      const message = getErrorMessage(error);
      // bottomSheetRef.current?.close();
      setIsAddMoneyModalVisible(false);
      dispatch(showSnackbar({message, type: SnackbarType.error}));
    }
  };

  const handleRazorPayPayment = async (orderId: any, amount: any) => {
    // console.log('orderId', orderId);
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
          setIsAddMoneyModalVisible(false);
          const message =
            error?.description || 'Something went wrong! Try again.';
          // bottomSheetRef.current?.close();
        });
    } catch (error) {
      // bottomSheetRef.current?.close();
      setIsAddMoneyModalVisible(false);
    }
  };

  const verifyRazorPayPayment = async (
    orderId: string,
    payId: string,
    signature: string,
  ) => {
    try {
      const response = await verifyRazorpayPaymentForAddWalletService({
        razorpay_order_id: orderId,
        razorpay_payment_id: payId,
        razorpay_signature: signature,
      });
      console.log('response', response);
      if (response?.success) {
        setIsAddMoneySuccessModalVisible(true);
      }
    } catch (error: any) {
      console.log(error?.response?.data);
      // bottomSheetRef.current?.close();
    } finally {
      getUserData();
      // bottomSheetRef.current?.close();
      setIsAddMoneyModalVisible(false);
    }
  };

  const getTransactions = async () => {
    try {
      setTransactionLoading(true);
      const response = await getWalletTransactionListService();
      const transactions = response?.data?.truncation?.data ?? [];
      JSONOBJECTLOG(transactions);
      setTransactions(transactions);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: 'Something went wrong',
          type: SnackbarType.error,
        }),
      );
    } finally {
      setTransactionLoading(false);
    }
  };

  useEffect(() => {
    getTransactions();
  }, []);

  const renderWalletCard = () => {
    return (
      <View style={styles.simpleWalletCard}>
        <Text style={REGULAR_TEXT(18, COLORS.white)}>Balance</Text>
        <View style={styles.walletCardDown}>
          <Text style={[BOLD_TEXT(18), {color: '#fff'}]}>
            {`₹ ${userData?.wallet_balance ?? 0}`}
          </Text>
          {/* <CustomGradientButton
            onPress={openBottomSheet}
            title="Add Money"
            outerContainerStyle={styles.addMoneyButtonOuter}
            innerContainerStyle={styles.addMoneyButtonInner}
            labelStyle={styles.addMoneyButtonLabel}
          /> */}
        </View>
      </View>
    );
  };

  const renderTransactionHistoryList = () => {
    return (
      <View>
        <TransactionListContainer
          transactions={transactions}
          isLoading={transactionLoading}
        />
      </View>
    );
  };

  return (
    <ScreenWrapper headerComponent={<HeaderNavigation label="Wallet" />}>
      <View style={{flex: 1, paddingHorizontal: 15}}>
        {renderWalletCard()}
        {renderTransactionHistoryList()}
      </View>
      {/* <AddMoneyBottomSheet
        bottomSheetRef={bottomSheetRef}
        onAddMoney={amount => {
          // setIsAddMoneySuccessModalVisible(true);
          addMoneyHandler(amount);
        }}
      /> */}
      <AddMoneyBottomModal
        // bottomSheetRef={bottomSheetRef}
        isVisible={isAddMoneyModalVisible}
        onClose={() => {
          setIsAddMoneyModalVisible(false);
        }}
        onAddMoney={amount => {
          // setIsAddMoneySuccessModalVisible(true);
          addMoneyHandler(amount);
        }}
      />
      {/* Add Money Success Modal */}
      <SuccessModal
        visible={isAddMoneySuccessModalVisible}
        onClose={() => {
          setIsAddMoneySuccessModalVisible(false);
        }}
        title="Success"
        description="Your money has been added successfully"
        buttonTitle="OK"
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  borderWrapper: {
    borderRadius: 30,
    padding: 2,
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  // walletCardDown: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   marginTop: 10,
  // },
  transactionContainer: {
    marginTop: 20,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  transactionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: '15%',
  },
  mapButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '30%',
    gap: 3,
  },

  simpleWalletCard: {
    backgroundColor: '#7C2AE8', // solid purple background
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginVertical: 10,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Android shadow
    elevation: 6,
  },
  walletCardDown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  addMoneyButtonOuter: {
    width: 120,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  addMoneyButtonInner: {
    backgroundColor: 'rgba(124, 42, 232, 0.7)',
    borderRadius: 30,
    paddingVertical: 8,
  },
  addMoneyButtonLabel: {
    fontSize: 12,
    color: '#fff',
  },
});
