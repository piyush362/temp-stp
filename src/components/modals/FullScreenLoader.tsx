import React from 'react';
import {Modal, View, ActivityIndicator, StyleSheet, Text} from 'react-native';
import {COLORS} from '../../theme/colors';
import {REGULAR_TEXT} from '../../theme/styles.global';

type Props = {
  visible: boolean;
};

const FullScreenLoader = ({visible}: Props) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: 'white',
            width: '80%',
            height: 200,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ActivityIndicator
            size="large"
            color={COLORS.splashBackground || '#ffffff'}
          />
          <Text style={[REGULAR_TEXT(16, COLORS.primary), {marginTop: 10}]}>
            Please wait
          </Text>
        </View>
      </View>
    </Modal>
  );
};

export default FullScreenLoader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)', // semi-transparent dark background
    justifyContent: 'center',
    alignItems: 'center',
  },
});
