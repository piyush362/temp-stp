import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { launchScanner } from '@dariyd/react-native-document-scanner';
import { useDispatch } from 'react-redux';

import { COLORS } from '../../theme/colors';
import { BOLD_TEXT, REGULAR_TEXT } from '../../theme/styles.global';
import { showSnackbar } from '../../redux/slices/snackbar.slice';
import { SnackbarType } from '../../types/common.types';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentScanner() {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [hasLaunched, setHasLaunched] = useState(false);

  // If coming from MultiDocPrintSpecScreen, we pass returnTo so ScannerPreview
  // knows to upload + navigate back there after saving
  const returnTo = (route.params as any)?.returnTo;

  const startScanning = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await launchScanner({
        quality: 0.9,
        includeBase64: false, // keep it false for better memory performance, we will read base64 from file when compiling to PDF
      });

      if (result.didCancel) {
        // User cancelled, navigate back to previous screen
        navigation.goBack();
        return;
      }

      if (result.error) {
        Alert.alert(
          'Scanner Error',
          result.errorMessage || 'An error occurred during scanning',
        );
        navigation.goBack();
        return;
      }

      if (result.images && result.images.length > 0) {
        // Navigate to preview screen with scanned images
        (navigation.navigate as any)('ScannerPreview', {
          images: result.images,
          returnTo: returnTo,
        });
      } else {
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error starting scanner:', error);
      dispatch(
        showSnackbar({
          message: 'Failed to start scanner camera',
          type: SnackbarType.error,
        }),
      );
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={'white'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          hitSlop={15}
        >
          <MaterialIcons name="arrow-back-ios" size={22} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={[BOLD_TEXT(18, '#1C1C1E'), styles.headerTitle]}>
          Document Scanner
        </Text>
        <TouchableOpacity
          onPress={() => (navigation.navigate as any)('DocumentListScreen')}
          style={styles.listHeaderButton}
          hitSlop={15}
        >
          <MaterialCommunityIcons
            name="file-document-multiple-outline"
            size={24}
            color={COLORS.darkBlue}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconBg}>
          <MaterialCommunityIcons
            name="scanner"
            size={80}
            color={COLORS.darkBlue}
          />
        </View>

        <Text
          style={[
            BOLD_TEXT(20, '#1C1C1E'),
            { marginTop: 30, textAlign: 'center' },
          ]}
        >
          Document Scanner Engine
        </Text>
        <Text style={[REGULAR_TEXT(14, '#8E8E93'), styles.subtitle]}>
          Align your paper or document inside the camera frame. The automatic
          detector will auto-crop, adjust edges, and correct perspective
          instantly.
        </Text>

        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={COLORS.bg2} />
            <Text style={[REGULAR_TEXT(13, COLORS.gray), { marginTop: 10 }]}>
              Initializing Camera...
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.scanBtn}
            onPress={startScanning}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="camera"
              size={24}
              color="white"
              style={{ marginRight: 8 }}
            />
            <Text style={BOLD_TEXT(16, 'white')}>Start Scanning</Text>
          </TouchableOpacity>
        )}

        {!loading && (
          <TouchableOpacity
            style={styles.listBtn}
            onPress={() => (navigation.navigate as any)('DocumentListScreen')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="file-document-multiple-outline"
              size={20}
              color={COLORS.darkBlue}
              style={{ marginRight: 8 }}
            />
            <Text style={BOLD_TEXT(16, COLORS.darkBlue)}>
              View Saved Documents
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    // backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(124, 42, 232, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 15px rgba(124, 42, 232, 0.1)',
    elevation: 2,
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
    lineHeight: 22,
  },
  scanBtn: {
    backgroundColor: COLORS.bg2,
    flexDirection: 'row',
    height: 52,
    width: '100%',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 14px rgba(124, 42, 232, 0.3)',
    elevation: 3,
  },
  listHeaderButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listBtn: {
    flexDirection: 'row',
    height: 52,
    width: '100%',
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: COLORS.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  loadingWrapper: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
  },
});
