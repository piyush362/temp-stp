import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  Alert,
  Platform,
  DeviceEventEmitter,
} from 'react-native';
import {useDispatch} from 'react-redux';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {showSnackbar} from '../../redux/slices/snackbar.slice';
import {COLORS} from '../../theme/colors';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import {SnackbarType} from '../../types/common.types';
import {SafeAreaView} from 'react-native-safe-area-context';
import {getScannedDocs, ScannedDocItem} from '../../utils/scannedDocsStorage';
import {uploadDocumentServiceV2} from '../../service/authService';
import {getFileTypeFromUrl} from '../../utils/uploadDocUtils';
import {getErrorMessage} from '../../utils/utils';
import {MultiProgressModal} from '../../components/modals/MultiProgressModal';

export default function ScannedDocPickerScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const [scannedPdfs, setScannedPdfs] = useState<ScannedDocItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  // Upload progress
  const [showProgress, setShowProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadDocs();
    }, []),
  );

  const loadDocs = async () => {
    const docs = await getScannedDocs();
    setScannedPdfs(docs);
  };

  const handlePickDoc = async (pdf: ScannedDocItem) => {
    if (uploading) return;

    try {
      setUploading(true);
      setUploadingId(pdf.id);

      // Build file URI
      const cleanPath = pdf.path.startsWith('file://')
        ? pdf.path
        : `file://${pdf.path}`;

      // Build FormData
      const formData = new FormData();
      formData.append('document', {
        uri: cleanPath,
        name: pdf.name,
        type: 'application/pdf',
      } as any);
      formData.append('document_name', pdf.name);

      // Show progress
      setShowProgress(true);
      setUploadProgress(0);
      setTotalFiles(1);
      setCurrentFile(1);

      const response = await uploadDocumentServiceV2(
        formData,
        (progress: number) => setUploadProgress(progress),
      );

      const docData = response?.data;

      const newDoc = {
        id: Date.now().toString(),
        ...docData,
        uri: docData.preview_link,
        fileName: docData.document_name || pdf.name,
        fileType: docData.file_type,
        processFileType: getFileTypeFromUrl(docData.document_link),
        number_of_pages: docData.number_of_copies,
      };

      setShowProgress(false);

      // Emit event so MultiDocPreviewCarousel picks it up, then go back
      DeviceEventEmitter.emit('ADD_SCANNED_DOC_TO_PRINT', newDoc);
      navigation.goBack();
    } catch (error) {
      console.error('Error uploading scanned PDF:', error);
      setShowProgress(false);
      const msg = getErrorMessage(error);
      dispatch(showSnackbar({message: msg, type: SnackbarType.error}));
    } finally {
      setUploading(false);
      setUploadingId(null);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  };

  const renderItem = ({item}: {item: ScannedDocItem}) => (
    <TouchableOpacity
      style={[
        styles.card,
        uploadingId === item.id && styles.cardActive,
      ]}
      onPress={() => handlePickDoc(item)}
      activeOpacity={0.7}
      disabled={uploading}
    >
      <View style={styles.pdfIconContainer}>
        <MaterialCommunityIcons
          name="file-pdf-box"
          size={36}
          color="#FF3B30"
        />
      </View>
      <View style={styles.cardDetails}>
        <Text
          style={[BOLD_TEXT(14, '#1C1C1E'), styles.docName]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text style={REGULAR_TEXT(11, '#8E8E93')}>{item.date}</Text>
        <View style={styles.metaRow}>
          <Text style={REGULAR_TEXT(10, COLORS.darkBlue)}>
            {formatSize(item.size)}
          </Text>
          {item.pageCount && (
            <Text style={[REGULAR_TEXT(10, '#8E8E93'), {marginLeft: 10}]}>
              {item.pageCount} {item.pageCount === 1 ? 'page' : 'pages'}
            </Text>
          )}
        </View>
      </View>
      {uploadingId === item.id ? (
        <ActivityIndicator size="small" color={COLORS.bg2} />
      ) : (
        <View style={styles.selectBadge}>
          <Text style={BOLD_TEXT(11, COLORS.darkBlue)}>Select</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.mainBg} />

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
          Pick Scanned Doc
        </Text>
        <View style={{width: 40}} />
      </View>

      {scannedPdfs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons
              name="file-document-multiple-outline"
              size={60}
              color={COLORS.darkBlue}
            />
          </View>
          <Text style={[BOLD_TEXT(17, '#1C1C1E'), {marginTop: 18}]}>
            No scanned documents
          </Text>
          <Text style={[REGULAR_TEXT(13, '#8E8E93'), styles.emptySubtitle]}>
            You haven't scanned any documents yet. Go back and use "Scan New
            Document" to create one.
          </Text>
          <TouchableOpacity
            style={styles.goBackBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={BOLD_TEXT(14, 'white')}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={[REGULAR_TEXT(13, '#8E8E93'), styles.hint]}>
            Tap on a document to upload and add it to your print job
          </Text>
          <FlatList
            data={scannedPdfs}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      <MultiProgressModal
        visible={showProgress}
        currentFile={currentFile}
        totalFiles={totalFiles}
        progress={uploadProgress}
        onCancel={() => setShowProgress(false)}
      />
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
  hint: {
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  cardActive: {
    borderWidth: 1.5,
    borderColor: COLORS.bg2,
  },
  pdfIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
  },
  docName: {
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  selectBadge: {
    borderWidth: 1.5,
    borderColor: COLORS.darkBlue,
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99, 57, 249, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    lineHeight: 20,
  },
  goBackBtn: {
    backgroundColor: COLORS.bg2,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 24,
  },
});
