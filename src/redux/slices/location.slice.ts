import {PayloadAction, createSlice} from '@reduxjs/toolkit';

export interface LocationState {
  currentLocation: string | null | undefined;
  currLatAndLong: {
    latitude: number | string | null | undefined;
    longitude: number |  string| null | undefined;
  };
}

const initialState: LocationState = {
  currentLocation: null,
  currLatAndLong: {latitude: null, longitude: null},
};

export const locationSlice = createSlice({
  name: 'locationSlice',
  initialState,
  reducers: {
    setCurrentLocation: (state: LocationState, action: PayloadAction<any>) => {
      state.currentLocation = action.payload;
    },

    setCurrLatAndLong: (state: LocationState, action: PayloadAction<any>) => {
      state.currLatAndLong = action.payload;
    },
  },
});

export const {setCurrentLocation, setCurrLatAndLong} = locationSlice.actions;
