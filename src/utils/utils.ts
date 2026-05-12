/* eslint-disable prettier/prettier */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Alert, Linking, Platform, Share} from 'react-native';

export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export const saveAccessTokenToAsyncStorage = async (accessToken: string) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  console.log('✅ access token saved');
};

export const saveRefreshTokenToAsyncStorage = async (refreshToken: string) => {
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const SaveTokensToAsyncStorage = async (
  accessToken: string,
  refreshToken: string,
) => {
  await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const removeTokensFromAsyncStorage = async () => {
  await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
  await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
  console.log('✅ tokens removed');
};

export const getAccessTokenFromAsyncStorage = async () => {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  return accessToken;
};

export const getRefreshTokenFromAsyncStorage = async () => {
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  return refreshToken;
};

export const JSONOBJECTLOG = (value: any) => {
  console.log(JSON.stringify(value, null, 2));
};

export function metersToKilometers(meters: number | string): string {
  try {
    const numericValue = parseFloat(meters as string);
    if (isNaN(numericValue) || numericValue < 0) {
      throw new Error('Invalid input');
    }
    return `${(numericValue / 1000).toFixed(2)} km`;
  } catch (error) {
    return '0.00 km';
  }
}

export function isPDFfile(url: string) {
  if (typeof url !== 'string') return false;

  // Remove query parameters or hash
  const cleanUrl = url.split('?')[0].split('#')[0];

  // Check file extension
  return cleanUrl.toLowerCase().endsWith('.pdf');
}

export const openInGoogleMaps = ({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) => {
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  Linking.openURL(url);
};

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return ''; // return empty if null/undefined

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return ''; // invalid date fallback

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  // Format hours & minutes with AM/PM
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // convert to 12-hour format

  return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
}

export function truncateString(
  str: string | null | undefined,
  maxLength: number,
  suffix: string = '...',
): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.substring(0, maxLength) + suffix;
}

export const getErrorMessage = (error: any) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.msg ||
    'Internal Server Error';
  return message;
};

export const getErrors = (error: any) => {
  const errors = error?.response?.data;
  return errors;
};

export const handleReferralCodeShare = async (referralCode?: string) => {
  try {
    const message = `🎉 Join *Stapples App* and earn exciting rewards!  
Use my referral code: *${referralCode || 'YOURCODE'}*  

💰 Get bonus coins and exclusive offers when you sign up using this code!  

📲 Download now:  
👉 Google Play: https://play.google.com/store/apps/details?id=com.kiosk_user  
🍎 App Store: https://apps.apple.com/in/app/stapples/id6752280756  
🌐 Visit our website: https://www.stapples.in/  

Let's Print together! 🚀`;

    await Share.share({
      title: 'Stapples App – Refer & Earn',
      message,
      url: 'https://www.stapples.in/',
    });
  } catch (error) {
    console.log('Error sharing:', error);
  }
};
export function getFirstVideoUrl(data: any) {
  // Check if data is a valid array and not empty
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }

  // Find the first item with media_type === "video"
  const videoItem = data.find(item => item?.media_type === 'video');

  // Return file_path if found, else null
  return videoItem?.file_path || null;
}


export const getMediaType = (url: string | null) => {
  if (!url) return null;

  const imageExt = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'];
  const videoExt = ['mp4', 'mov', 'avi', 'webm', 'mkv'];

  const ext = url.split('.').pop()?.toLowerCase();

  if (!ext) return null;

  if (imageExt.includes(ext)) return 'image';
  if (videoExt.includes(ext)) return 'video';

  return null;
};

