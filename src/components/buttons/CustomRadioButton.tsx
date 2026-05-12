import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {COLORS} from '../../theme/colors';

interface Props {
  value: string;
  status: 'checked' | 'unchecked';
  onPress: () => void;
  color?: string;
  label?: string;
}

export default function CustomRadioButton({
  value,
  status,
  onPress,
  color = '#000',
  label,
}: Props) {
  const isChecked = status === 'checked';
  const borderColor = isChecked ? color : COLORS.gray;
  const textColor = isChecked ? color : COLORS.gray;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.container}
      activeOpacity={0.7}>
      <View style={[styles.radioOuter, {borderColor: borderColor}]}>
        {isChecked && (
          <View style={[styles.radioInner, {backgroundColor: color}]} />
        )}
      </View>
      {label && (
        <Text
          style={[
            styles.label,
            {color: textColor, fontWeight: isChecked ? 'bold' : 'normal'},
          ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  label: {
    fontSize: 14,
  },
});
