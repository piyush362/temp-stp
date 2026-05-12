import {configureStore} from '@reduxjs/toolkit';
import {authSlice} from './slices/auth.slice';
import {SnackbarSlice} from './slices/snackbar.slice';
import { locationSlice } from './slices/location.slice';

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    locationSlice: locationSlice.reducer,
    snackbar: SnackbarSlice.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
