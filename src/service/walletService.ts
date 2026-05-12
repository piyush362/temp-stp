import axios from 'axios';
import {BASEURL} from '../../app.env';
import {getAccessTokenFromAsyncStorage, JSONOBJECTLOG} from '../utils/utils';

// razorpay

export const createRazorpayOrderForAddWalletService = async (_payload: any) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    headers: {
      'x-access-token': accessToken,
    },
    url: `${BASEURL}/api/auth/add-amount-in-wallet/razorpay/create-order`,
    data: _payload,
  });
  return response.data;
};

// 5 verify razorpay payment
export const verifyRazorpayPaymentForAddWalletService = async (data: {
  razorpay_order_id: string | number;
  razorpay_payment_id: string | number;
  razorpay_signature: string;
}) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    headers: {
      'x-access-token': accessToken,
    },
    url: `${BASEURL}/api/auth/add-amount-in-wallet/razorpay/verify-payment`,
    data: data,
  });
  return response.data;
};

// transactions

// api/auth/truncation/get/list?limit=200&offset=1
export const getWalletTransactionListService = async (
  limit: number = 200,
  offset: number = 0,
) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/truncation/get/list`,
    headers: {
      'x-access-token': accessToken,
    },
    params: {
      limit,
      offset,
    },
  });
  return response.data;
};
