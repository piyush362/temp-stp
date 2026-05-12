/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../../theme/styles.global';
import {COLORS, secondaryGradient} from '../../../../theme/colors';

export default function MultiDocPriceSummary({
  total,
  isPriceCalculating,
  onProceed,
}: any) {
  const safe = useSafeAreaInsets();

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={secondaryGradient}
      style={{borderRadius: 12, overflow: 'hidden', marginTop: 20}}>
      <View style={[styles.footer, {paddingBottom: safe.bottom + 10}]}>
        {isPriceCalculating ? (
          <View>
            <ActivityIndicator size="large" color={'gray'} />
          </View>
        ) : (
          <Text style={[REGULAR_TEXT(14, COLORS.gray)]}>
            Total{' '}
            <Text style={[BOLD_TEXT(16, COLORS.gray)]}>
              ₹{total ?? '00.00'}
            </Text>
          </Text>
        )}

        <TouchableOpacity
          onPress={onProceed}
          hitSlop={15}
          style={styles.payBtn}>
          <Text style={[BOLD_TEXT(14, COLORS.white)]}>Payment</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  payBtn: {
    backgroundColor: COLORS.splashBackground,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 10,
  },
});
