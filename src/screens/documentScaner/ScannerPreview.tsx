import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchScanner } from '@dariyd/react-native-document-scanner';
import ReactNativeBlobUtil from 'react-native-blob-util';

import { addScannedPdf } from '../../redux/slices/auth.slice';
import { showSnackbar } from '../../redux/slices/snackbar.slice';
import { COLORS } from '../../theme/colors';
import { BOLD_TEXT, REGULAR_TEXT } from '../../theme/styles.global';
import { SnackbarType } from '../../types/common.types';
import { generatePdfFromImages } from './pdfGenerator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addScannedDoc } from '../../utils/scannedDocsStorage';
import { uploadDocumentServiceV2 } from '../../service/authService';
import { getFileTypeFromUrl } from '../../utils/uploadDocUtils';
import { getErrorMessage } from '../../utils/utils';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2; // 2 column grid

export default function ScannerPreview() {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Initial scanned images passed from DocumentScanner screen
  const initialImages = (route.params as any)?.images || [];
  const returnTo = (route.params as any)?.returnTo;
  const [images, setImages] = useState<any[]>(initialImages);

  // States
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [docName, setDocName] = useState(() => {
    const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
    const timeStr = new Date()
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      .replace(/:/g, '-');
    return `Scanned_Doc_${dateStr}_${timeStr.replace(/\s+/g, '')}`;
  });

  const handleAddMore = async () => {
    try {
      const result = await launchScanner({
        quality: 0.9,
      });

      if (result.didCancel) return;
      if (result.error) {
        Alert.alert(
          'Scanner Error',
          result.errorMessage || 'An error occurred during scanning',
        );
        return;
      }

      if (result.images && result.images.length > 0) {
        setImages(prev => [...prev, ...result.images!]);
        dispatch(
          showSnackbar({
            message: `Added ${result.images.length} page(s)`,
            type: SnackbarType.success,
          }),
        );
      }
    } catch (err) {
      console.error('Error adding more pages:', err);
      dispatch(
        showSnackbar({
          message: 'Failed to launch camera',
          type: SnackbarType.error,
        }),
      );
    }
  };

  const handleDeleteImage = (index: number) => {
    Alert.alert(
      'Delete Page',
      'Are you sure you want to remove this scanned page?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const updated = [...images];
            updated.splice(index, 1);
            setImages(updated);

            // Go back if no images left
            if (updated.length === 0) {
              navigation.goBack();
            }
          },
        },
      ],
    );
  };

  const handleSavePdf = async () => {
    if (!docName.trim()) {
      Alert.alert('Validation Error', 'Please enter a document name.');
      return;
    }

    setShowSaveModal(false);
    setIsSaving(true);

    try {
      const finalDocName = docName.endsWith('.pdf')
        ? docName
        : `${docName}.pdf`;

      // Compile PDF locally in pure JS
      const path = await generatePdfFromImages(images, finalDocName);

      // Get file details for Redux
      const cleanPath = path.startsWith('file://')
        ? path.replace('file://', '')
        : path;
      const decodedPath = decodeURIComponent(cleanPath);
      const stat = await ReactNativeBlobUtil.fs.stat(decodedPath);

      const newPdfItem = {
        id: Date.now().toString(),
        name: finalDocName,
        path: path,
        size: stat.size,
        date: new Date().toLocaleString(),
        pageCount: images.length,
      };

      // Add to Redux
      dispatch(addScannedPdf(newPdfItem));

      // Persist to AsyncStorage so it survives app restarts
      await addScannedDoc(newPdfItem);

      dispatch(
        showSnackbar({
          message: 'Document saved successfully as PDF',
          type: SnackbarType.success,
        }),
      );

      if (returnTo) {
        // Coming from MultiDocPrintSpecScreen — upload PDF to server, then pop back
        try {
          const fileUri = path.startsWith('file://') ? path : `file://${path}`;

          const formData = new FormData();
          formData.append('document', {
            uri: fileUri,
            name: finalDocName,
            type: 'application/pdf',
          } as any);
          formData.append('document_name', finalDocName);

          const response = await uploadDocumentServiceV2(formData);
          const docData = response?.data;

          const newDoc = {
            id: Date.now().toString(),
            ...docData,
            uri: docData.preview_link,
            fileName: docData.document_name || finalDocName,
            fileType: docData.file_type,
            processFileType: getFileTypeFromUrl(docData.document_link),
            number_of_pages: docData.number_of_copies,
          };

          // Emit event so MultiDocPreviewCarousel picks it up, then pop back
          // Pop 2 screens: ScannerPreview → DocumentScanner → MultiDocPrintSpecScreen
          DeviceEventEmitter.emit('ADD_SCANNED_DOC_TO_PRINT', newDoc);
          navigation.pop(2);
        } catch (uploadError) {
          console.error('Error uploading scanned PDF:', uploadError);
          const msg = getErrorMessage(uploadError);
          dispatch(
            showSnackbar({
              message: `Saved locally but upload failed: ${msg}`,
              type: SnackbarType.error,
            }),
          );
          navigation.navigate('DocumentListScreen' as never);
        }
      } else {
        // Normal flow — go to Scanned Documents List Screen
        navigation.navigate('DocumentListScreen' as never);
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      dispatch(
        showSnackbar({
          message: 'Failed to generate PDF',
          type: SnackbarType.error,
        }),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const renderGridItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.gridCard}>
      <TouchableOpacity
        style={styles.imageWrapper}
        onPress={() => setActiveImageIndex(index)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.uri }} style={styles.thumbnail} />
        <View style={styles.badge}>
          <Text style={BOLD_TEXT(10, 'white')}>{index + 1}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <Text
          style={[REGULAR_TEXT(11, '#6B6B6B'), { flex: 1 }]}
          numberOfLines={1}
        >
          Page {index + 1}
        </Text>
        <TouchableOpacity
          onPress={() => handleDeleteImage(index)}
          hitSlop={10}
          style={styles.deleteBtn}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={18}
            color="#FF3B30"
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />

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
          Scanned Pages ({images.length})
        </Text>
        <TouchableOpacity
          onPress={handleAddMore}
          style={styles.addMoreBtn}
          hitSlop={15}
        >
          <MaterialIcons name="add-a-photo" size={24} color={COLORS.darkBlue} />
        </TouchableOpacity>
      </View>

      {/* Grid of scanned pages */}
      <FlatList
        data={images}
        keyExtractor={(item, index) => `${item.uri}-${index}`}
        renderItem={renderGridItem}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Save bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.addPageBtn}
          onPress={handleAddMore}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons
            name="camera-plus-outline"
            size={20}
            color={COLORS.darkBlue}
            style={{ marginRight: 6 }}
          />
          <Text style={BOLD_TEXT(14, COLORS.darkBlue)}>Add Pages</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => setShowSaveModal(true)}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="file-pdf-box"
            size={22}
            color="white"
            style={{ marginRight: 6 }}
          />
          <Text style={BOLD_TEXT(14, 'white')}>Save PDF</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Viewer Modal */}
      <Modal
        visible={activeImageIndex !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setActiveImageIndex(null)}
      >
        <View style={styles.fullscreenBg}>
          <SafeAreaView style={styles.fullscreenHeader}>
            <TouchableOpacity
              onPress={() => setActiveImageIndex(null)}
              style={styles.closeFullBtn}
              hitSlop={15}
            >
              <MaterialIcons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={BOLD_TEXT(16, 'white')}>
              Page {(activeImageIndex ?? 0) + 1} of {images.length}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (activeImageIndex !== null) {
                  const idx = activeImageIndex;
                  setActiveImageIndex(null);
                  handleDeleteImage(idx);
                }
              }}
              style={styles.deleteFullBtn}
              hitSlop={15}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={26}
                color="#FF3B30"
              />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.fullscreenBody}>
            {activeImageIndex !== null && (
              <Image
                source={{ uri: images[activeImageIndex].uri }}
                style={styles.fullscreenImage}
                resizeMode="contain"
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Saving PDF overlay spinner */}
      {isSaving && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.bg2} />
            <Text style={[BOLD_TEXT(14, '#1C1C1E'), { marginTop: 15 }]}>
              Compiling Document...
            </Text>
            <Text
              style={[
                REGULAR_TEXT(12, '#8E8E93'),
                { marginTop: 5, textAlign: 'center' },
              ]}
            >
              Building high-quality PDF from scanned sheets in pure JS
            </Text>
          </View>
        </View>
      )}

      {/* Save Filename Modal Prompt */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={BOLD_TEXT(18, '#1C1C1E')}>Save Document</Text>
            <Text
              style={[
                REGULAR_TEXT(13, '#8E8E93'),
                { marginTop: 4, marginBottom: 15 },
              ]}
            >
              Enter a name to save your document as a PDF.
            </Text>

            <TextInput
              value={docName}
              onChangeText={setDocName}
              style={styles.textInput}
              placeholder="Document Name"
              placeholderTextColor="#AEAEB2"
              autoFocus={true}
              clearButtonMode="while-editing"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowSaveModal(false)}
              >
                <Text style={BOLD_TEXT(14, COLORS.gray)}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSavePdf}
              >
                <Text style={BOLD_TEXT(14, 'white')}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
    backgroundColor: 'white',
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
  addMoreBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridContent: {
    padding: 16,
    paddingBottom: 90,
  },
  gridCard: {
    width: COLUMN_WIDTH,
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 16,
    marginHorizontal: 8,
    overflow: 'hidden',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  imageWrapper: {
    width: '100%',
    height: COLUMN_WIDTH * 1.3,
    backgroundColor: '#E5E5EA',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  badge: {
    position: 'absolute',
    left: 8,
    top: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 1px 3px rgba(0,0,0,0.15)',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  deleteBtn: {
    padding: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 75,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  addPageBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.darkBlue,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginRight: 12,
  },
  saveBtn: {
    flex: 1.2,
    height: 48,
    backgroundColor: COLORS.bg2,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    boxShadow: '0px 4px 10px rgba(124, 42, 232, 0.25)',
    elevation: 3,
  },
  fullscreenBg: {
    flex: 1,
    backgroundColor: 'black',
  },
  fullscreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  closeFullBtn: {
    padding: 6,
  },
  deleteFullBtn: {
    padding: 6,
  },
  fullscreenBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  loadingBox: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    width: width * 0.8,
    alignItems: 'center',
    boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    width: width * 0.85,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.15)',
    elevation: 5,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D1D6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#1C1C1E',
    marginBottom: 20,
    backgroundColor: '#F2F2F7',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalCancel: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
  },
  modalSave: {
    backgroundColor: COLORS.bg2,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});
