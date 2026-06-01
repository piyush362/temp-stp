import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../../theme/colors';
import { BOLD_TEXT, REGULAR_TEXT } from '../../theme/styles.global';

const { width } = Dimensions.get('window');

interface DocScannerBetaInfoModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DocScannerBetaInfoModal({
  visible,
  onClose,
}: DocScannerBetaInfoModalProps) {
  const features = [
    {
      icon: 'camera-outline',
      title: 'Camera Document Scanning',
      description: 'Capture pages dynamically with perspective auto-detection.',
      color: COLORS.darkBlue,
      bgColor: 'rgba(99, 57, 249, 0.08)',
    },
    {
      icon: 'file-pdf-box',
      title: 'Multi-Page PDF Compiler',
      description: 'Combine crop, rotate and re-order pages into a clean PDF.',
      color: '#FF3B30',
      bgColor: 'rgba(255, 59, 48, 0.08)',
    },
    {
      icon: 'database-outline',
      title: 'Durable Local Storage',
      description: 'Scanned files remain stored on your device across sessions.',
      color: '#34C759',
      bgColor: 'rgba(52, 199, 89, 0.08)',
    },
    {
      icon: 'cloud-upload-outline',
      title: 'Direct Print Code Generation',
      description: 'Upload directly from your scan history to get print codes.',
      color: '#FF9500',
      bgColor: 'rgba(255, 149, 0, 0.08)',
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          {/* Header Icon */}
          <View style={styles.headerIconContainer}>
            <View style={styles.betaBadge}>
              <Text style={BOLD_TEXT(10, 'white')}>BETA</Text>
            </View>
            <MaterialCommunityIcons
              name="scanner"
              size={48}
              color={COLORS.bg2}
            />
          </View>

          {/* Title */}
          <Text style={[BOLD_TEXT(20, '#1C1C1E'), styles.title]}>
            Document Scanner
          </Text>
          <Text style={[REGULAR_TEXT(13, '#636366'), styles.subtitle]}>
            Scan physical sheets, receipts, or notes into premium print-ready PDFs in seconds.
          </Text>

          {/* Features list */}
          <View style={styles.featuresList}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.iconCircle,
                    { backgroundColor: item.bgColor },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={22}
                    color={item.color}
                  />
                </View>
                <View style={styles.featureText}>
                  <Text style={BOLD_TEXT(14, '#1C1C1E')}>{item.title}</Text>
                  <Text style={[REGULAR_TEXT(12, '#8E8E93'), { marginTop: 2 }]}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Got it button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={BOLD_TEXT(15, 'white')}>Got it, Let's Go!</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: width - 40,
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.15)',
    elevation: 5,
  },
  headerIconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(124, 42, 232, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  betaBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: COLORS.bg2,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'white',
    boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featuresList: {
    width: '100%',
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  featureText: {
    flex: 1,
  },
  closeBtn: {
    width: '100%',
    backgroundColor: COLORS.bg2,
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(124, 42, 232, 0.3)',
    elevation: 3,
  },
});
