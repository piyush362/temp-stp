import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  StatusBar,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { viewDocument } from '@react-native-documents/viewer';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Pdf from 'react-native-pdf';

import { RootState } from '../../redux/store';
import { deleteScannedPdf } from '../../redux/slices/auth.slice';
import { showSnackbar } from '../../redux/slices/snackbar.slice';
import { COLORS } from '../../theme/colors';
import { BOLD_TEXT, REGULAR_TEXT } from '../../theme/styles.global';
import { SnackbarType } from '../../types/common.types';

export default function DocumentListScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const scannedPdfs = useSelector((state: RootState) => state.auth.scannedPdfs) || [];

  // PDF Viewer Modal States
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; path: string } | null>(null);
  const [isViewerVisible, setIsViewerVisible] = useState(false);

  const handleOpenScanner = () => {
    // Navigate to DocumentScanner orchestrator
    navigation.navigate('DocumentScanner' as never);
  };

  const handleViewPdf = (pdf: any) => {
    setSelectedPdf(pdf);
    setIsViewerVisible(true);
  };

  const handleDeletePdf = (pdf: any) => {
    Alert.alert(
      'Delete Document',
      `Are you sure you want to delete "${pdf.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete local file
              const cleanPath = pdf.path.startsWith('file://')
                ? pdf.path.replace('file://', '')
                : pdf.path;
              const decodedPath = decodeURIComponent(cleanPath);
              
              const exists = await ReactNativeBlobUtil.fs.exists(decodedPath);
              if (exists) {
                await ReactNativeBlobUtil.fs.unlink(decodedPath);
              }
              
              // Remove from Redux
              dispatch(deleteScannedPdf(pdf.id));
              dispatch(
                showSnackbar({
                  message: 'Document deleted successfully',
                  type: SnackbarType.success,
                })
              );
            } catch (error) {
              console.error('Error deleting PDF file:', error);
              dispatch(
                showSnackbar({
                  message: 'Failed to delete file',
                  type: SnackbarType.error,
                })
              );
            }
          },
        },
      ]
    );
  };

  const handleSharePdf = async (pdf: any) => {
    try {
      const cleanPath = pdf.path.startsWith('file://')
        ? pdf.path.replace('file://', '')
        : pdf.path;
      const decodedPath = decodeURIComponent(cleanPath);
      const platformPath = Platform.OS === 'android' ? `file://${decodedPath}` : decodedPath;

      if (Platform.OS === 'ios') {
        await Share.share({
          url: platformPath,
          title: pdf.name,
        });
      } else {
        // For Android: open in system previewer which has native share/print triggers built-in
        try {
          await viewDocument({
            uri: platformPath,
            mimeType: 'application/pdf',
            headerTitle: pdf.name,
          });
        } catch (err) {
          // Fallback to launching an ACTION_VIEW chooser intent
          await ReactNativeBlobUtil.android.actionViewIntent(decodedPath, 'application/pdf');
        }
      }
    } catch (error) {
      console.error('Error sharing PDF:', error);
      dispatch(
        showSnackbar({
          message: 'Failed to share document',
          type: SnackbarType.error,
        })
      );
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

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardMain}
        onPress={() => handleViewPdf(item)}
        activeOpacity={0.7}
      >
        <View style={styles.pdfIconContainer}>
          <MaterialCommunityIcons name="file-pdf-box" size={40} color="#FF3B30" />
        </View>
        <View style={styles.cardDetails}>
          <Text style={[BOLD_TEXT(15, '#1C1C1E'), styles.docName]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={REGULAR_TEXT(12, '#8E8E93')}>
            {item.date}
          </Text>
          <Text style={[REGULAR_TEXT(11, COLORS.darkBlue), { marginTop: 2 }]}>
            {formatSize(item.size)}
          </Text>
        </View>
      </TouchableOpacity>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleSharePdf(item)}
          hitSlop={10}
        >
          <MaterialIcons name="share" size={22} color={COLORS.gray} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => handleDeletePdf(item)}
          hitSlop={10}
        >
          <MaterialCommunityIcons name="delete-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.mainBg} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('HomeTabScreen' as never)}
          style={styles.backButton}
          hitSlop={15}
        >
          <MaterialIcons name="arrow-back-ios" size={22} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={[BOLD_TEXT(18, '#1C1C1E'), styles.headerTitle]}>
          Scanned Documents
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Document List or Empty State */}
      {scannedPdfs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBg}>
            <MaterialCommunityIcons name="scanner" size={70} color={COLORS.darkBlue} />
          </View>
          <Text style={[BOLD_TEXT(18, '#1C1C1E'), { marginTop: 20 }]}>
            No scanned documents yet
          </Text>
          <Text style={[REGULAR_TEXT(14, '#8E8E93'), styles.emptySubtitle]}>
            Scan and organize your physical sheets, receipts, or bills into clean PDFs in seconds.
          </Text>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={handleOpenScanner}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="camera-plus" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={BOLD_TEXT(15, 'white')}>Open Scanner</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={scannedPdfs}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Action Button */}
      {scannedPdfs.length > 0 && (
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleOpenScanner}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="camera-plus" size={26} color="white" />
        </TouchableOpacity>
      )}

      {/* Fullscreen PDF Viewer Modal */}
      <Modal
        visible={isViewerVisible}
        animationType="slide"
        onRequestClose={() => setIsViewerVisible(false)}
      >
        <SafeAreaView style={styles.viewerContainer}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity 
              onPress={() => setIsViewerVisible(false)}
              style={styles.closeBtn}
              hitSlop={15}
            >
              <MaterialIcons name="close" size={24} color="#1C1C1E" />
            </TouchableOpacity>
            <Text style={[BOLD_TEXT(16, '#1C1C1E'), styles.viewerTitle]} numberOfLines={1}>
              {selectedPdf?.name}
            </Text>
            <TouchableOpacity 
              onPress={() => selectedPdf && handleSharePdf(selectedPdf)}
              style={styles.shareBtn}
              hitSlop={15}
            >
              <MaterialIcons name="share" size={22} color="#1C1C1E" />
            </TouchableOpacity>
          </View>
          
          {selectedPdf ? (
            <Pdf
              source={{ uri: selectedPdf.path }}
              style={styles.pdfViewer}
              onError={(error) => {
                console.error('PDF view error:', error);
                Alert.alert('Error', 'Unable to display PDF file.');
              }}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={REGULAR_TEXT(14)}>Loading document...</Text>
            </View>
          )}
        </SafeAreaView>
      </Modal>
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
  listContent: {
    padding: 16,
    paddingBottom: 100, // extra spacing for FAB
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
    elevation: 2,
  },
  cardMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pdfIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardDetails: {
    flex: 1,
    paddingRight: 10,
  },
  docName: {
    marginBottom: 2,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.05)',
    paddingLeft: 8,
  },
  actionBtn: {
    padding: 8,
    marginLeft: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.bg2,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 12px rgba(124, 42, 232, 0.35)',
    elevation: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: COLORS.mainBg,
  },
  emptyIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(124, 42, 232, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  emptySubtitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 20,
  },
  primaryBtn: {
    backgroundColor: COLORS.bg2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    boxShadow: '0px 4px 12px rgba(124, 42, 232, 0.25)',
    elevation: 3,
  },
  viewerContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  closeBtn: {
    padding: 6,
  },
  shareBtn: {
    padding: 6,
  },
  viewerTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  pdfViewer: {
    flex: 1,
    width: '100%',
    backgroundColor: COLORS.mainBg,
  },
});
