import {PayloadAction, createSlice} from '@reduxjs/toolkit';

interface userData {
  user_id: number;
  user_name: string | null;
  phone_number: number | null;
  email_id: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  pincode: string | null;
  address: string | null;
  alternative_number: string | null;
  photo: string | null;
  wallet_balance: number | null;
  referral_code: string | null;
}

interface CurrentLocation {
  mocked: boolean;
  timestamp: number;
  extras: {
    verticalAccuracy: number;
  };
  coords: {
    speed: number;
    heading: number;
    altitude: number;
    accuracy: number;
    longitude: number;
    latitude: number;
  };
}

interface PrintPrice {
  colored: number;
  black_and_white: number;
}

export interface PrintPriceV2 {
  print_price_id: number;
  name: string;
  print_colour: string;
  paper_type: string;
  print_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}
interface CurrentLocationDetails {
  city: string;
  locality: string;
  principalSubdivision: string;
}

export interface AuthState {
  initialized: boolean;
  isAuthenticated: boolean;
  isNewUser: boolean;
  userData?: userData | null;
  printPrice?: PrintPrice | null;
  printPriceV2?: PrintPriceV2[] | null;
  locationPermissionStatus?: boolean;
  currentLocation?: CurrentLocation | null;
  currentLocationDetails: CurrentLocationDetails | null;
  socket: {
    status: boolean | null;
    isLoading: boolean | null;
  } | null;
}

const initialState: AuthState = {
  initialized: false,
  isAuthenticated: false,
  isNewUser: false,
  userData: null,
  printPrice: {
    colored: 6,
    black_and_white: 3,
  },
  locationPermissionStatus: false,
  currentLocation: null,
  currentLocationDetails: null,
  socket: {
    status: null,
    isLoading: null,
  },
  printPriceV2: [] as PrintPriceV2[],
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setInitialized: (state: AuthState, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },

    setAuthorizationStatus: (
      state: AuthState,
      action: PayloadAction<boolean>,
    ) => {
      state.isAuthenticated = action.payload;
    },

    setUserData: (state: AuthState, action: PayloadAction<any>) => {
      state.userData = action.payload;
    },

    setPrintPrice: (state: AuthState, action: PayloadAction<any>) => {
      state.printPrice = action.payload;
    },

    setLocationPermissionStatus: (
      state: AuthState,
      action: PayloadAction<any>,
    ) => {
      state.locationPermissionStatus = action.payload;
    },

    setCurrentLocation: (state: AuthState, action: PayloadAction<any>) => {
      state.currentLocation = action.payload;
    },

    setCurrentLocationDetails: (
      state: AuthState,
      action: PayloadAction<CurrentLocationDetails>,
    ) => {
      state.currentLocationDetails = action.payload;
    },

    setSocketData: (
      state: AuthState,
      action: PayloadAction<{status: boolean; isLoading: boolean}>,
    ) => {
      state.socket = action.payload;
    },

    setPrintPriceV2: (state: AuthState, action: PayloadAction<any>) => {
      state.printPriceV2 = action.payload;
    },

    setIsNewUser: (state: AuthState, action: PayloadAction<boolean>) => {
      state.isNewUser = action.payload;
    },
  },
});

export const {
  setAuthorizationStatus,
  setInitialized,
  setUserData,
  setPrintPrice,
  setLocationPermissionStatus,
  setCurrentLocation,
  setCurrentLocationDetails,
  setSocketData,
  setPrintPriceV2,
  setIsNewUser,
} = authSlice.actions;
