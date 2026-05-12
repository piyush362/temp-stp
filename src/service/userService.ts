import axios from 'axios';
import {BASEURL} from '../../app.env';
import {getAccessTokenFromAsyncStorage, JSONOBJECTLOG} from '../utils/utils';

export const getUserProfileDataService = async () => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/profile/read/v1/profile-data`,
    headers: {
      'x-access-token': accessToken,
    },
  });

  return response.data;
};

export const getPrintPriceDataService = async () => {
  // const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/public/print-rates/get`,
    headers: {},
  });

  return response.data;
};

export const addMoneyToWalletService = async ({amount}: {amount: number}) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/add-amount-in-wallet`,
    headers: {
      'x-access-token': accessToken,
    },
    data: {
      amount: amount,
    },
  });

  return response.data;
};

// https://api-bdc.io/data/reverse-geocode-client?latitude=26.75&longitude=83.12&localityLanguage=en
export const getLocationViaCoordinateService = async (
  latitude: number,
  longitude: number,
  language: string = 'en',
) => {
  const response = await axios.get(
    `https://api-bdc.io/data/reverse-geocode-client`,
    {
      params: {
        latitude,
        longitude,
        localityLanguage: language,
      },
    },
  );

  return response.data;
};
