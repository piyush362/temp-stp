import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SnackbarType } from '../../types/common.types';

export interface SnackbarState {
    visible: boolean;
    type: SnackbarType;
    message: string;
    duration?: number;
}

const initialState: SnackbarState = {
    visible: false,
    type: SnackbarType.success,
    message: '',
    duration: 2000,
};

export const SnackbarSlice = createSlice({
    name: 'snackbar',
    initialState,
    reducers: {
        showSnackbar: (state, action: PayloadAction<{ message: string; duration?: number, type?: SnackbarType }>) => {
            state.visible = true;
            state.message = action.payload.message;
            state.duration = action.payload.duration || initialState.duration;
            if (action.payload?.type) {   
                state.type = action.payload.type
            }
        },
        hideSnackbar: (state) => {
            state.visible = false;
            state.message = '';
        },
    },
});

export const { showSnackbar, hideSnackbar } = SnackbarSlice.actions;

