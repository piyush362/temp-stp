import axios from 'axios';
import {BASEURL} from '../../app.env';
import {getAccessTokenFromAsyncStorage, JSONOBJECTLOG} from '../utils/utils';

export const sentLoginOtpService = async (phone: string) => {
  console.log('Verify Password Status ...');
  const response = await axios.post(`${BASEURL}/api/login/v1/send-otp`, {
    phone_number: phone,
  });
  JSONOBJECTLOG(response.data);
  return response.data;
};

export const verifySignInOtpService = async (_payload: any) => {
  console.log('Verify Password Status ...');
  try {
    const response = await axios.post(
      `${BASEURL}/api/login/v1/verify-otp`,
      _payload,
    );
    JSONOBJECTLOG(response.data);
    return response.data;
  } catch (error: any) {
    JSONOBJECTLOG(error.response);
    throw new Error(error.response?.data?.msg || 'An error occurred');
  }
};

// export const uploadDocumentService = async (_payload: any) => {
//   console.log('Upload Document Status ...');
//   const response = await axios.post(
//     `${BASEURL}/api/public/upload-docs-to-print/create/v1/upload-docs`,
//     _payload,
//     {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     },
//   );

//   console.log('Upload Response:', response.data);
//   return response.data;
// };

export const uploadDocumentService = async (
  _payload: any,
  progressCallback?: (progress: number) => void,
) => {
  // console.log('Upload Document Status ...');
  console.log('Upload Document Status ... Normal');


  const response = await axios.post(
    `${BASEURL}/api/public/upload-docs-to-print/create/v1/upload-docs-v2`,
    _payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        const total =
          progressEvent.total ??
          progressEvent?.target?.getResponseHeader('content-length') ??
          1;
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / total,
        );
        if (progressCallback) progressCallback(percentCompleted);
      },
    },
  );

  // console.log('Upload Response:', response.data);
  return response.data;
};

export const uploadDocumentServiceV2 = async (
  _payload: any,
  progressCallback?: (progress: number) => void,
) => {
  console.log('Upload Document Status ... DOC file');

  const response = await axios.post(
    `${BASEURL}/api/public/upload-docs-to-print/create/v1/upload-docs-v2`,
    _payload,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        const total =
          progressEvent.total ??
          progressEvent?.target?.getResponseHeader('content-length') ??
          1;
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / total,
        );
        if (progressCallback) progressCallback(percentCompleted);
      },
    },
  );

  // console.log('Upload Response:', response.data);
  return response.data;
};

export const getUploadedDocumentListService = async ({
  // _payload,
  limit,
  offset,
}: {
  // _payload?: any;
  limit?: number;
  offset?: number;
}) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/auth/document-print/history/read/v1/list`,
    headers: {
      'x-access-token': accessToken,
      'x-limit': limit ?? 10,
      'x-offset': offset ?? 0,
      'x-payment-status': 'done',
    },
  });

  return response.data;
};
export const payDocViaWalletService = async (_payload: any) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    url: `${BASEURL}/api/auth/pay/vaya-wallet/mack-payment`,
    headers: {
      'x-access-token': accessToken,
    },
    data: _payload,
  });

  return response.data;
};

export const getNearestKioskService = async (_payload: any) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'POST',
    url: `${BASEURL}/api/public/kiosk/get/nearest-kiosk`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: _payload,
  });

  return response.data;
};

export const getDocWithKioskCodeService = async ({
  kioskCode,
}: {
  kioskCode: string;
}) => {
  const response = await axios({
    method: 'GET',
    url: `${BASEURL}/api/public/kiosk-document/get/get-document-vaya-kiosk-code`,
    headers: {
      'x-kiosk-code': kioskCode,
    },
  });
  return response.data;
};


export const editProfileService = async (payload: any) => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: "PATCH",
    url: `${BASEURL}/api/auth/profile/update/v1/update-profile`,
    headers: {
      "x-access-token": accessToken,
    },
    data: payload,
  });

  return response.data;
};


export const getPromotionVideoUrl = async () => {
  const response = await axios({
    method: "GET",
    url: `https://kiosk.alphaprotocall.com/api/media/promotional`,
  });
  return response.data;
};
