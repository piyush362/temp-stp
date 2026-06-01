import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { BOLD_TEXT, REGULAR_TEXT } from '../../../theme/styles.global';
import { COLORS } from '../../../theme/colors';
import { ICONS } from '../../../theme/icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  formatDateTime,
  getErrorMessage,
  getFirstVideoUrl,
  JSONOBJECTLOG,
  metersToKilometers,
  openInGoogleMaps,
  truncateString,
} from '../../../utils/utils';
import {
  getNearestKioskService,
  getPromotionVideoUrl,
  getUploadedDocumentListService,
  uploadDocumentServiceV2,
} from '../../../service/authService';
import { Kiosk } from '../kiosk/FindKioskScreen';
import Geolocation from '@react-native-community/geolocation';
import { useDispatch, useSelector } from 'react-redux';
import { showSnackbar } from '../../../redux/slices/snackbar.slice';
import { SnackbarType } from '../../../types/common.types';
import { handleGenericMultiDocumentPicker } from '../../../utils/uploadDocUtils';
import { generatePdfFromImagesV2 } from '../../documentScaner/pdfGenerator';
import {
  getPrintPriceDataService,
  getUserProfileDataService,
} from '../../../service/userService';
import { setPrintPriceV2, setUserData } from '../../../redux/slices/auth.slice';
import { RootState } from '../../../redux/store';
import DashboardHeader2 from '../../../components/header/DashboardHeader2';
import HowToUseCard from '../../../components/cards/HowToUseCard';
import ReferralAnnouncementCard from '../../../components/cards/ReferralAnnouncementContainer';
import { MultiProgressModal } from '../../../components/modals/MultiProgressModal';
import DocScannerBetaInfoModal from '../../../components/modals/DocScannerBetaInfoModal';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [showProgress, setShowProgress] = useState(false);
  const [uploadedDocumentResponse, setUploadedDocumentResponse] = useState({});
  const [uploadDocList, setUploadDocList] = useState<any[]>([]);
  const [kioskList, setKioskList] = useState<Kiosk[]>([]);

  const [uploadProgress, setUploadProgress] = useState(0);

  const [currentFile, setCurrentFile] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);

  const [refreshing, setRefreshing] = React.useState(false);

  const [howToUseVideoLink, setHowToUseVideoLink] = useState<any>(null);

  const { userData, currentLocation } = useSelector(
    (state: RootState) => state.auth,
  );

  const [_showInCompleteProfileModal, setShowInCompleteProfileModal] =
    useState(false);
  const [showScannerBetaInfoModal, setShowScannerBetaInfoModal] =
    useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const checkProfileCompleteStatus = async () => {
    if (userData?.phone_number) {
      if (!userData?.user_name || !userData?.email_id) {
        setShowInCompleteProfileModal(true);
      }
    }
  };

  const getHowToUseVideoLink = async () => {
    const response = await getPromotionVideoUrl();
    if (response) {
      const url = getFirstVideoUrl(response?.data);
      if (url) {
        setHowToUseVideoLink(url);
      }
    }
  };

  useEffect(() => {
    getHowToUseVideoLink();
    getUserData();
    getPrintPrice();
  }, []);

  useEffect(() => {
    checkProfileCompleteStatus();
  }, [userData]);

  useEffect(() => {
    console.log('currentLocation fetch nearest kiosk');
    Geolocation.getCurrentPosition(info => getNearestKiosk(info));
  }, [currentLocation]);

  useFocusEffect(
    useCallback(() => {
      getUploadedDocumentList();
    }, []),
  );

  const getUserData = async () => {
    const response = await getUserProfileDataService();
    if (response?.data?.profileDAta) {
      dispatch(setUserData(response?.data?.profileDAta));
    }
  };

  const getPrintPrice = async () => {
    const response = await getPrintPriceDataService();
    if (response?.data?.list) {
      dispatch(setPrintPriceV2(response?.data?.list));
    }
  };
  const getNearestKiosk = async (info: any) => {
    const payload = {
      latitude: info.coords.latitude,
      longitude: info.coords.longitude,
      distance_in_meters: 1000000,
    };
    try {
      const response = await getNearestKioskService(payload);
      const data = response?.data?.data ?? [];
      setKioskList(data);
    } catch (error) {
      JSONOBJECTLOG(error);
    }
  };

  const getUploadedDocumentList = async () => {
    try {
      const response = await getUploadedDocumentListService({
        limit: 2,
        offset: 0,
      });
      // JSONOBJECTLOG(response);
      setUploadDocList(response?.data?.data ?? []);
    } catch (error) {
      JSONOBJECTLOG(error);
    }
  };

  // UI Functions - start with render

  const handleDocumentPicker = async () => {
    let hasError = false;
    try {
      const results = await handleGenericMultiDocumentPicker();

      if (!results || results.length === 0) {
        dispatch(
          showSnackbar({
            message: 'No document selected',
            type: SnackbarType.error,
          }),
        );
        return;
      }

      let finalResults = [...results];
      const imagesToCombine = results.filter(r => r.fileType === 'image');

      if (imagesToCombine.length > 1) {
        const shouldCombine = await new Promise<boolean>((resolve) => {
          Alert.alert(
            'Combine Images',
            'Do you want to combine all images in 1 pdf to get single staples code?\n\nThis combination applies only on images, not pdf.',
            [
              {
                text: 'No',
                onPress: () => resolve(false),
                style: 'cancel',
              },
              {
                text: 'Yes',
                onPress: () => resolve(true),
              },
            ],
            { cancelable: false },
          );
        });

        if (shouldCombine) {
          try {
            const dateStr = new Date().toLocaleDateString().replace(/\//g, '-');
            const timeStr = new Date()
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              .replace(/:/g, '-');
            const combinedPdfName = `Combined_Images_${dateStr}_${timeStr.replace(/\s+/g, '')}.pdf`;

            const scannedImages = imagesToCombine.map(img => ({
              uri: img.uri,
              width: 0,
              height: 0,
            }));

            const combinedPdfPath = await generatePdfFromImagesV2(
              scannedImages,
              combinedPdfName,
            );

            const combinedPdfUri = combinedPdfPath.startsWith('file://')
              ? combinedPdfPath
              : `file://${combinedPdfPath}`;

            const combinedFormData = new FormData();
            combinedFormData.append('document', {
              uri: combinedPdfUri,
              name: combinedPdfName,
              type: 'application/pdf',
            } as any);

            const combinedResultEntry = {
              formData: combinedFormData,
              fileType: 'pdf',
              fileName: combinedPdfName,
              uri: combinedPdfUri,
              mimeType: 'application/pdf',
            };

            const otherResults = results.filter(r => r.fileType !== 'image');
            finalResults = [combinedResultEntry, ...otherResults];
          } catch (pdfError) {
            console.error('Failed to combine images into PDF', pdfError);
            Alert.alert(
              'Error',
              'Failed to combine images. Uploading files individually.',
            );
          }
        }
      }

      // PROGRESS SETUP
      setUploadedDocumentResponse([]); // 👈 make array
      setShowProgress(true);
      setUploadProgress(0);
      setTotalFiles(finalResults.length);
      setCurrentFile(1);

      const uploadedDocs: any[] = [];

      // LOOP THROUGH FILES
      for (let i = 0; i < finalResults.length; i++) {
        const { formData, fileType, fileName } = finalResults[i];

        formData.append('document_name', fileName);

        try {
          const response = await uploadDocumentServiceV2(
            formData,
            (progress: number) => setUploadProgress(progress),
          );

          uploadedDocs.push({
            id: Date.now().toString(),
            ...response.data,
            fileType,
          });
        } catch (err) {
          hasError = true;
          Alert.alert(`Upload failed for ${fileName}`);
        }

        // move to next file
        setCurrentFile(prev => prev + 1);
        setUploadProgress(0);
      }

      if (hasError) {
        setShowProgress(false);
        return;
      }
      // SAVE FINAL
      setUploadedDocumentResponse(uploadedDocs);

      // NAVIGATE WITH ARRAY
      navigation.navigate({
        name: 'MultiDocPrintSpecScreen',
        params: {
          uploadedDocumentResponse: uploadedDocs,
        },
      } as never);
    } catch (error) {
      console.log(error);
      const msg = getErrorMessage(error);
      dispatch(showSnackbar({ message: msg, type: SnackbarType.error }));
    } finally {
      setShowProgress(false);
    }
  };

  const renderUploadContainer = () => (
    <View style={styles.uploadContainer}>
      <Text style={BOLD_TEXT(18)}>Upload Documents to Print</Text>
      <Text style={[REGULAR_TEXT(13, '#7A7A7A'), styles.centeredText]}>
        Upload PDFs, images and word for quick and convenient kiosk printing.
      </Text>

      <TouchableOpacity
        style={styles.uploadCircle}
        onPress={handleDocumentPicker}
      >
        <Image
          source={ICONS.upload}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </TouchableOpacity>

      <Text style={REGULAR_TEXT(12, '#888')}>
        Files up to 50 MB can be uploaded.
      </Text>
    </View>
  );

  const renderScannerCard = () => (
    <TouchableOpacity
      style={styles.scannerCard}
      onPress={() => navigation.navigate('DocumentScanner' as never)}
      activeOpacity={0.8}
    >
      <View style={styles.scannerCardLeft}>
        <View style={styles.scannerIconBg}>
          <MaterialCommunityIcons name="scanner" size={26} color="white" />
        </View>
        <View style={styles.scannerTextContainer}>
          <View style={styles.titleRow}>
            <Text style={BOLD_TEXT(15, 'white')}>Document Scanner</Text>
            <View style={styles.betaBadge}>
              <Text style={BOLD_TEXT(9, COLORS.bg2)}>BETA</Text>
            </View>
          </View>
          <Text
            style={[
              REGULAR_TEXT(11, 'rgba(255, 255, 255, 0.8)'),
              { marginTop: 2, marginBottom: 4 },
            ]}
          >
            Scan sheets into clean PDFs instantly
          </Text>
          <TouchableOpacity
            style={styles.knowMoreButton}
            onPress={() => setShowScannerBetaInfoModal(true)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="information-outline" size={14} color="white" />
            <Text style={[BOLD_TEXT(11, 'white'), { marginLeft: 4 }]}>
              Know More
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color="white" />
    </TouchableOpacity>
  );

  // UI Functions - start with render
  const renderUploadDocumentList = () => {
    return (
      <View style={styles.kioskContainer}>
        <View style={styles.kioskHeader}>
          <Text style={BOLD_TEXT(15, COLORS.gray)}>Uploaded Documents</Text>
          <TouchableOpacity
            hitSlop={15}
            onPress={() => {
              navigation.navigate('HistoryTabScreen' as never);
            }}
          >
            <Text style={BOLD_TEXT(13, COLORS.darkBlue)}>View All</Text>
          </TouchableOpacity>
        </View>

        {uploadDocList.map(docs => (
          <View key={docs.kiosk_documents_id} style={styles.kioskItem}>
            <View style={styles.kioskIcon}>
              <Image
                source={ICONS.uploadIcon}
                style={{ width: 40, height: 40, objectFit: 'contain' }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[REGULAR_TEXT(13), { width: '70%' }]}>
                {`${truncateString(
                  docs?.document_name ?? 'Document Name',
                  20,
                )}`}
              </Text>
              <Text style={[REGULAR_TEXT(9, COLORS.gray)]}>
                {`Uploaded at: ${formatDateTime(docs?.updated_at)}`}
              </Text>
              {docs?.print_status == 'not done' ? (
                <Text style={[REGULAR_TEXT(10, '#ff3b65')]}>Not Printed</Text>
              ) : (
                <Text style={[REGULAR_TEXT(10, '#1fd122')]}>Printed</Text>
              )}
            </View>
            <CustomGradientButton
              onPress={() => {
                if (docs?.print_status == 'not done') {
                  navigation.navigate({
                    name: 'CodeGeneratedScreen',
                    params: {
                      kioskData: {
                        kiosk_code: docs.kiosk_code,
                      },
                    },
                  } as never);
                } else {
                  dispatch(
                    showSnackbar({
                      message: 'Document already printed',
                      type: SnackbarType.error,
                    }),
                  );
                  navigation.navigate({
                    name: 'CodeGeneratedScreen',
                    params: {
                      kioskData: {
                        kiosk_code: docs.kiosk_code,
                      },
                    },
                  } as never);
                }
              }}
              title="Get Code"
              outerContainerStyle={{
                width: 'auto',
              }}
              innerContainerStyle={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                backgroundColor: 'white',
              }}
              labelStyle={{
                fontSize: 11,
                color: 'black',
                fontWeight: 'normal',
              }}
            />
          </View>
        ))}
      </View>
    );
  };

  // UI Functions - start with render
  const renderKiosksList = () => {
    return (
      <View style={styles.kioskContainer}>
        <View style={styles.kioskHeader}>
          <Text style={BOLD_TEXT(15, COLORS.gray)}>Nearest Kiosk</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('FindKioskScreen' as never)}
          >
            <Text style={BOLD_TEXT(14, COLORS.darkBlue)}>View more</Text>
          </TouchableOpacity>
        </View>

        {kioskList &&
          Array.isArray(kioskList) &&
          kioskList?.slice(0, 7)?.map(kiosk => (
            <View key={kiosk.kiosk_id} style={styles.kioskItem}>
              <View style={styles.kioskIcon}>
                <Image
                  source={ICONS.kiosk}
                  style={{ width: 40, height: 40, objectFit: 'contain' }}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[REGULAR_TEXT(13), { flex: 1 }]}>
                  {kiosk.kiosk_name}
                </Text>
                <Text style={[REGULAR_TEXT(11, COLORS.gray), { flex: 1 }]}>
                  {kiosk.kiosk_address}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Image
                    source={ICONS.pin}
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: 'contain',
                      tintColor: COLORS.bg2,
                    }}
                  />
                  <Text
                    style={[REGULAR_TEXT(12, COLORS.gray), { marginLeft: 5 }]}
                  >
                    {metersToKilometers(kiosk?.distance_in_meters ?? 0)}
                  </Text>
                </View>
              </View>
              <CustomGradientButton
                onPress={() => {
                  openInGoogleMaps({
                    latitude: kiosk?.kiosk_latitude,
                    longitude: kiosk?.kiosk_longitude,
                  });
                }}
                title="View on map"
                outerContainerStyle={{
                  width: 'auto',
                }}
                innerContainerStyle={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: 'white',
                }}
                labelStyle={{
                  fontSize: 11,
                  color: 'black',
                  fontWeight: 'normal',
                }}
              />
            </View>
          ))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: COLORS.mainBg, padding: 15 }}
    >
      <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.mainBg} />
      <DashboardHeader2 />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              getUploadedDocumentList();
            }}
          />
        }
      >
        {renderUploadContainer()}
        {renderScannerCard()}
        <HowToUseCard howToUseVideoLink={howToUseVideoLink} />
        <ReferralAnnouncementCard />
        {renderUploadDocumentList()}
        {renderKiosksList()}
      </ScrollView>
      <View style={{ height: 60 }} />

      <MultiProgressModal
        visible={showProgress}
        currentFile={currentFile}
        totalFiles={totalFiles}
        progress={uploadProgress}
        onCancel={() => setShowProgress(false)}
      />

      <DocScannerBetaInfoModal
        visible={showScannerBetaInfoModal}
        onClose={() => setShowScannerBetaInfoModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {},
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  walletContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  uploadContainer: {
    alignItems: 'center',
    marginBottom: 30,
    // backgroundColor: 'red',
    maxHeight: 500,
  },
  centeredText: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  uploadCircle: {
    width: width / 1.3,
    height: width / 1.3,
    maxWidth: 300,
    maxHeight: 300,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  kioskContainer: {
    marginBottom: 20,
  },
  kioskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  kioskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    padding: 12,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  kioskIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mapButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6C63FF',
  },
  offerCard: {
    backgroundColor: COLORS.bg3,
    padding: 15,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    gap: 5,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  claimButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  scannerCard: {
    backgroundColor: COLORS.bg2,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    boxShadow: '0px 4px 10px rgba(124, 42, 232, 0.2)',
    elevation: 3,
  },
  scannerCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  scannerIconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  scannerTextContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  betaBadge: {
    backgroundColor: 'white',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  knowMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
});
