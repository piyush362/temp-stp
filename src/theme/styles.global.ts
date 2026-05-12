import {StyleSheet} from 'react-native';
import {FONTS} from './fonts';
import {scale} from 'react-native-size-matters';
import {COLORS} from './colors';

// for react native paper component ( Text Input )
export const BASE_CONTAINER_HEIGHT = 50;

export const BOLD_TEXT = (size?: number, color?: string) => {
  return {
    fontFamily: FONTS.BOLD,
    fontSize: size ?? 12,
    color: color ?? '#060602',
  };
};

export const REGULAR_TEXT = (size?: number, color?: string) => {
  return {
    fontFamily: FONTS.REGULAR,
    fontSize: size ?? 12,
    color: color ?? '#060602',
  };
};

export const STYLES = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
});

export const INPUT_CONTAINER_STYLES = {
  placeholderTextColor: COLORS.darkGray,
  activeOutlineColor: COLORS.black,
  outlineColor: COLORS.offGray,
  outlineStyle: {
    borderRadius: 10,
  },
  contentStyle: {
    paddingHorizontal: 20,
    fontSize: scale(13),
    color: COLORS.darkGray,
    height: BASE_CONTAINER_HEIGHT,
  },
  style: {
    backgroundColor: COLORS.white,
    height: BASE_CONTAINER_HEIGHT,
  },
};

export const BUTTON_CONTAINER_STYLES = {
  labelStyle: {
    color: COLORS.white,
    fontFamily: FONTS.MEDIUM,
  },
  contentStyle: {
    backgroundColor: COLORS.black,
    height: BASE_CONTAINER_HEIGHT,
    borderRadius: 10,
  },
  style: {
    borderRadius: 15,
  },
};
