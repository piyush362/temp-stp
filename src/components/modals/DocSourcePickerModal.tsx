import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../../theme/colors';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';

const {width} = Dimensions.get('window');

interface DocSourcePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onPickGallery: () => void;
  onPickScannedDocs: () => void;
  onScanNewDoc: () => void;
}

export default function DocSourcePickerModal({
  visible,
  onClose,
  onPickGallery,
  onPickScannedDocs,
  onScanNewDoc,
}: DocSourcePickerModalProps) {
  const options = [
    {
      id: 'gallery',
      icon: 'image-multiple-outline',
      title: 'From Gallery',
      subtitle: 'Pick PDFs, images or docs from your device',
      color: '#FF9500',
      bgColor: 'rgba(255, 149, 0, 0.08)',
      onPress: onPickGallery,
    },
    {
      id: 'scanned',
      icon: 'file-document-multiple-outline',
      title: 'From Scanned Docs',
      subtitle: 'Choose from your previously scanned documents',
      color: COLORS.darkBlue,
      bgColor: 'rgba(99, 57, 249, 0.08)',
      onPress: onPickScannedDocs,
    },
    {
      id: 'scan',
      icon: 'camera-plus-outline',
      title: 'Scan New Document',
      subtitle: 'Use camera to scan and add pages on the go',
      color: '#34C759',
      bgColor: 'rgba(52, 199, 89, 0.08)',
      onPress: onScanNewDoc,
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.sheet} onStartShouldSetResponder={() => true}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          <Text style={[BOLD_TEXT(20, '#1C1C1E'), styles.title]}>
            Add Document
          </Text>
          <Text style={[REGULAR_TEXT(13, '#8E8E93'), styles.subtitle]}>
            Choose where you want to pick your document from
          </Text>

          {options.map(opt => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionRow}
              onPress={() => {
                onClose();
                // Small delay so modal closes smoothly before next action
                setTimeout(opt.onPress, 300);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, {backgroundColor: opt.bgColor}]}>
                <MaterialCommunityIcons
                  name={opt.icon}
                  size={26}
                  color={opt.color}
                />
              </View>
              <View style={styles.optionText}>
                <Text style={BOLD_TEXT(15, '#1C1C1E')}>{opt.title}</Text>
                <Text
                  style={[REGULAR_TEXT(12, '#8E8E93'), {marginTop: 2}]}
                  numberOfLines={1}
                >
                  {opt.subtitle}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color="#C7C7CC"
              />
            </TouchableOpacity>
          ))}

          {/* Cancel button */}
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={BOLD_TEXT(15, COLORS.gray)}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D1D6',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9FB',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  optionText: {
    flex: 1,
  },
  cancelBtn: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 30,
    marginTop: 6,
  },
});
