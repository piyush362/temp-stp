import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { ICONS } from '../../theme/icons';
import VersionCheck from 'react-native-version-check';
import CustomGradientButton from '../buttons/CustomGradientButton';
import { COLORS } from '../../theme/colors';

interface AppUpdateModalProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onUpdate: () => void;
}

const AppUpdateModal = ({
  visible,
  setVisible,
  onUpdate,
}: AppUpdateModalProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = () => {
    setVisible(false);
  };

  const handleUpdate = () => {
    navigateToStore();
  };

  const navigateToStore = async () => {
    try {
      setIsLoading(true);
      const url = await VersionCheck.getStoreUrl();
      Linking.openURL(url);
    } catch (error) {
      Alert.alert('Error', 'Unable to open the app store.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={{ alignItems: 'center' }}>
            <Image
              source={ICONS.brandLogo}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Stapples</Text>
          </View>
          <Text style={styles.message}>
            A new version of the app is available. Update now to enjoy the
            latest features and improvements.
          </Text>
          <View style={styles.buttonContainer}>
            <CustomGradientButton
              title="Maybe Later"
              onPress={handleCancel}
              innerContainerStyle={{ backgroundColor: '#fff' }}
              labelStyle={{ color: COLORS.darkBlue }}
              outerContainerStyle={{ width: '45%' }}
            />

            <CustomGradientButton
              title="Update Now"
              onPress={handleUpdate}
              isLoading={isLoading}
              outerContainerStyle={{ width: '45%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    gap: 15,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: '#ccc',
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#29297C',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#333',
    fontWeight: '600',
  },
  updateText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default AppUpdateModal;
