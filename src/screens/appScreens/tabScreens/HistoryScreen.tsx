import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {COLORS} from '../../../theme/colors';
import {ICONS} from '../../../theme/icons';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {SafeAreaView} from 'react-native-safe-area-context';
import DashboardHeader from '../../../components/header/DashboardHeader';
import {getUploadedDocumentListService} from '../../../service/authService';
import {
  formatDateTime,
  JSONOBJECTLOG,
  truncateString,
} from '../../../utils/utils';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import DashboardHeader2 from '../../../components/header/DashboardHeader2';

export default function HistoryScreen() {
  const [uploadDocList, setUploadDocList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const getUploadedDocumentList = async () => {
    console.log('getUploadedDocumentList');
    try {
      setLoading(true);
      const response = await getUploadedDocumentListService({
        limit: 50,
        offset: 0,
      });
      // JSONOBJECTLOG(response);
      setUploadDocList(response?.data?.data ?? []);
      JSONOBJECTLOG(response?.data?.data ?? []);
    } catch (error) {
      JSONOBJECTLOG(error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getUploadedDocumentList();
    }, []),
  );

  const handleNavigation = (kioskCode: any) => {
    if (!kioskCode) {
      dispatch(
        showSnackbar({
          message: 'Kiosk code not found',
          type: SnackbarType.error,
        }),
      );
    }
    navigation.navigate({
      name: 'CodeGeneratedScreen',
      params: {
        kioskData: {
          kiosk_code: kioskCode,
        },
      },
    } as never);
  };

  const renderHistoryList = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[REGULAR_TEXT(14, COLORS.primary), {marginTop: 10}]}>
            Loading history...
          </Text>
        </View>
      );
    }

    if (uploadDocList.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={REGULAR_TEXT(14, COLORS.gray)}>
            No document history found.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.kioskContainer}>
        <View style={styles.kioskHeader}>
          <Text style={BOLD_TEXT(15)}>History</Text>
        </View>

        {uploadDocList.map(kiosk => (
          <TouchableOpacity
            onPress={() => {
              // handleNavigation(kiosk?.kiosk_code);
              if (kiosk?.print_status == 'not done') {
                handleNavigation(kiosk?.kiosk_code);
              } else {
                dispatch(
                  showSnackbar({
                    message: 'Document already printed',
                    type: SnackbarType.error,
                  }),
                );
                handleNavigation(kiosk?.kiosk_code);
              }
            }}
            key={kiosk?.kiosk_documents_id}
            style={styles.kioskItem}>
            <View style={styles.kioskIcon}>
              <Image
                source={ICONS.kiosk}
                style={{width: 40, height: 40, objectFit: 'contain'}}
              />
            </View>
            <View style={{flex: 1}}>
              <Text style={[REGULAR_TEXT(13), {width: '70%'}]}>
                {`${truncateString(
                  kiosk?.document_name ?? 'Document Name',
                  20,
                )}`}
              </Text>
              <Text style={[REGULAR_TEXT(9, COLORS.gray)]}>
                {`Uploaded at: ${formatDateTime(kiosk?.updated_at)}`}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => {
                // handleNavigation(kiosk?.kiosk_code);
                if (kiosk?.print_status == 'not done') {
                  handleNavigation(kiosk?.kiosk_code);
                } else {
                  dispatch(
                    showSnackbar({
                      message: 'Document already printed',
                      type: SnackbarType.error,
                    }),
                  );
                }
              }}
              hitSlop={10}
              style={styles.mapButton}>
              <Text style={[BOLD_TEXT(13, COLORS.gray), {textAlign: 'right'}]}>
                {`Rs. ${Number(kiosk?.charges ?? 0).toFixed(2)}`}
              </Text>
              {/* <Text style={REGULAR_TEXT(12, '#6C63FF')}>View Details</Text> */}
              {kiosk?.print_status == 'not done' ? (
                <Text style={[REGULAR_TEXT(12, '#ff3b65')]}>Not Printed</Text>
              ) : (
                <Text style={[REGULAR_TEXT(12, '#1fd122')]}>Printed</Text>
              )}
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: COLORS.mainBg, padding: 15}}>
      <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.mainBg} />
      <DashboardHeader2 />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {renderHistoryList()}
      </ScrollView>
      <View style={{height: 60}} />
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
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50,
  },
});
