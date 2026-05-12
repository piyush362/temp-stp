import {Image, Modal, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import CustomGradientButton from '../buttons/CustomGradientButton';
import {COLORS} from '../../theme/colors';

interface Props {
  visible: boolean;
  onClose: () => void;
  image?: any;
  title: string;
  description: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export default function SuccessDocUploadModal({
  visible,
  onClose,
  image,
  title,
  description,
  buttonTitle = 'Continue',
  onButtonPress,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {image && (
            <Image source={image} style={styles.image} resizeMode="contain" />
          )}

          <Text style={[BOLD_TEXT(20), styles.title]}>{title}</Text>

          <Text style={[REGULAR_TEXT(14, 'green'), styles.description]}>
            {description}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
            }}>
            <CustomGradientButton
              title={'Next'}
              onPress={() => {
                onButtonPress?.();
              }}
              outerContainerStyle={{
                width: '48%',
              }}
            />
            <CustomGradientButton
              onPress={() => {
                onClose();
              }}
              title="Cancel"
              outerContainerStyle={{
                width: '50%',
                borderColor: COLORS.bg2,
                borderWidth: 2,
              }}
              gradientColors={['white', 'white']}
              innerContainerStyle={{
                backgroundColor: 'white',
              }}
              labelStyle={{fontSize: 12, color: 'black', fontWeight: '700'}}
            />
          </View>
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
