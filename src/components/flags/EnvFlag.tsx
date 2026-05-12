import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {BASEURL} from '../../../app.env';

interface EnvFlagProps {
  position?: 'left' | 'right';
}

const EnvFlag: React.FC<EnvFlagProps> = ({position = 'right'}) => {
  const isDisabledFlag = false;
  const isDev = BASEURL.includes('new-dev');
  const envLabel = isDev ? 'DEV' : 'PROD';
  const bgColor = isDev ? '#7c4d00ff' : '#00642aff';

  if (isDisabledFlag) return null;

  if (!isDev) return null;

  return (
    <View
      style={[
        styles.wrapper,
        position === 'left' ? styles.leftWrapper : styles.rightWrapper,
        {top: Platform.OS === 'ios' ? -5 : -10},
      ]}>
      <View
        style={[
          styles.container,
          {backgroundColor: bgColor},
          position === 'left' ? styles.left : styles.right,
        ]}>
        <Text style={styles.text}>{envLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    zIndex: 9999,
  },
  container: {
    width: 100,
    paddingVertical: 3,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{rotate: '45deg'}],
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rightWrapper: {
    right: -35,
  },
  leftWrapper: {
    left: -35,
  },
  right: {
    transform: [{rotate: '45deg'}],
    marginTop: 25,
  },
  left: {
    transform: [{rotate: '-45deg'}],
    marginTop: 25,
  },
});

export default EnvFlag;
