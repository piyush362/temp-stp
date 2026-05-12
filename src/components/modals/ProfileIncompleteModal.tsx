import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import CustomGradientButton from '../buttons/CustomGradientButton';

interface Props {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
}

export default function ProfileIncompleteModal({
  visible,
  onClose,
  onProceed,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Optional – Use your preferred icon */}
          {/* <Image
            source={require('../../assets/images/profile_warning.png')}
            style={styles.image}
            resizeMode="contain"
          /> */}

          <Text style={[BOLD_TEXT(20), styles.title]}>Profile Incomplete</Text>

          <Text style={[REGULAR_TEXT(14), styles.description]}>
            Your profile is incomplete. Please update your details to continue.
          </Text>

          <CustomGradientButton
            title="Complete Profile"
            onPress={() => {
              onProceed();
              onClose();
            }}
            outerContainerStyle={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    maxWidth: 500,
  },
  image: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    width: '100%',
  },
});
