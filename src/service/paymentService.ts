import axios from 'axios';
import {BASEURL} from '../../app.env';
import {getAccessTokenFromAsyncStorage, JSONOBJECTLOG} from '../utils/utils';

export const initiateJuspayPaymentService = async (_payload: any) => {
  const accessToken = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'POST',
    url: `${BASEURL}/api/auth/pay/vaya-pg/initiateJuspayPayment`,
    headers: {
      'x-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    data: _payload,
  });
  return response.data;
};

export const initiateSubPaisaPaymentService = async (_payload: any) => {
  try {
    const accessToken = await getAccessTokenFromAsyncStorage();
    const response = await axios({
      method: 'POST',
      url: `${BASEURL}/api/auth/pay/subpaisa/initPgReq`,
      headers: {
        'x-access-token': accessToken,
        'Content-Type': 'application/json',
      },
      data: _payload,
    });
    return response.data;
  } catch (error) {
    console.log('error');
    console.log(error);
  }
};

export const handleSubPaisaPaymentService = async ({
  data,
}: {
  data: {
    id_mobile_app: boolean;
    pg_res: any;
  };
}) => {
  const accessToken = await getAccessTokenFromAsyncStorage();

  const response = await axios({
    method: 'PATCH',
    url: `${BASEURL}/api/auth/pay/subpaisa/getPgRes`,
    headers: {
      'x-access-token': accessToken,
      'Content-Type': 'application/json',
    },
    data: data,
  });
  return response.data;
};

// razorpay

export const createRazorpayOrderService = async (_payload: any) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    headers: {
        'x-access-token': accessToken,
      },
    url: `${BASEURL}/api/auth/pay/razorpay/create-order`,
    data: _payload,
  });
  return response.data;
};

// 5 verify razorpay payment
export const verifyRazorpayPaymentService = async (data: {
  order_id: string | number;
  payment_id: string | number;
  signature: string;
}) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    headers: {
        'x-access-token': accessToken,
    },
    url: `${BASEURL}/api/auth/pay/razorpay/verify-payment`,
    data: data,
  });
  return response.data;
};
