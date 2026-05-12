/* eslint-disable react-native/no-inline-styles */
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React, {useEffect} from 'react';
import {COLORS} from '../../../theme/colors';
import DashboardHeader from '../../../components/header/DashboardHeader';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import {IMAGES} from '../../../theme/images';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {useNavigation, useRoute} from '@react-navigation/native';
import {JSONOBJECTLOG} from '../../../utils/utils';
import {getDocWithKioskCodeService} from '../../../service/authService';
import DashboardHeader2 from '../../../components/header/DashboardHeader2';
import {SafeAreaView} from 'react-native-safe-area-context';

const {width} = Dimensions.get('window');

export default function CodeGeneratedScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const {document = {document_link: ''}, kioskData = {}} =
    (route.params as any) || {};

  const [currentDocs, setCurrentDocs] = React.useState<any>([]);
  const [loading, setLoading] = React.useState(false);

  const getDocs = async () => {
    if (!kioskData?.kiosk_code) return;
    try {
      setLoading(true);
      const response = await getDocWithKioskCodeService({
        kioskCode: kioskData?.kiosk_code,
      });
      JSONOBJECTLOG(response);
      setCurrentDocs(response?.data?.document_data);
      // console.log(response?.data); print_status
    } catch (error) {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDocs();
  }, [kioskData]);

  const renderCodeContainer = () => {
    return (
      <View style={styles.codeContainer}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '95%',
            marginBottom: 10,
          }}>
          <Text style={[BOLD_TEXT(17, COLORS.black), {textAlign: 'center'}]}>
            Code
          </Text>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: COLORS.white,
              paddingHorizontal: 20,
              paddingVertical: 8,
              borderRadius: 20,
              boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.10)',
            }}
            onPress={() => {
              // Handle help support action
              navigation.navigate({
                name: 'DocSupportScreen',
                params: {documentId: currentDocs?.kiosk_documents_id},
              } as never);
            }}>
            <MaterialIcons name="help-outline" size={20} color={COLORS.bg2} />
            <Text style={[BOLD_TEXT(12, COLORS.bg2)]}>Help</Text>
          </TouchableOpacity>
        </View>
        <Text
          style={[
            REGULAR_TEXT(13, COLORS.gray),
            {textAlign: 'center', marginBottom: 16},
          ]}>
          Upload PDFs, Word, Excel, and images for quick and convenient kiosk
          printing.
        </Text>

        {currentDocs?.print_status != 'not done' && !loading && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingVertical: 8,
              backgroundColor: '#f4ddddff',
              borderRadius: 8,
              marginBottom: 10,
              borderColor: '#e07070ff',
              borderWidth: 1,
            }}>
            <Text
              style={{fontSize: 12, color: '#ff0400ff', textAlign: 'center'}}>
              Documented Already Printed
            </Text>
          </View>
        )}

        {kioskData?.kiosk_code ? (
          <View style={styles.codeBoxWrapper}>
            {`${kioskData?.kiosk_code}`.split('').map((digit, index) => (
              <View key={index} style={styles.codeBox}>
                <Text style={[BOLD_TEXT(16, COLORS.black)]}>{digit}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.codeBoxWrapper}>
            {['-', '-', '-', '-', '-'].map((digit, index) => (
              <View key={index} style={styles.codeBox}>
                <Text style={[BOLD_TEXT(16, COLORS.black)]}>{digit}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.orText}>OR</Text>
      </View>
    );
  };

  const renderQRCodeContainer = () => {
    return (
      <View style={styles.qrCodeContainer}>
        <TouchableOpacity
          onPress={() => {
            // navigation.navigate('QRScannerModalScreen' as never)
            navigation.navigate({
              name: 'QRScannerModalScreen',
              params: {
                currentDocs: currentDocs ? currentDocs : document,
              },
            } as never);
          }}>
          <Image source={IMAGES.QR} style={styles.qrImage} />
        </TouchableOpacity>
        <Text style={[BOLD_TEXT(17, COLORS.black), {textAlign: 'center'}]}>
          Scan QR Code
        </Text>
        <Text
          style={[
            REGULAR_TEXT(13, COLORS.gray),
            {textAlign: 'center', marginBottom: 16},
          ]}>
          Upload PDFs, Word, and images for quick and convenient kiosk printing.
        </Text>

        <View>
          {currentDocs.paper_size && (
            <Text
              style={[
                REGULAR_TEXT(13, COLORS.gray),
                {textAlign: 'center', marginBottom: 6},
              ]}>{`Paper Size : ${currentDocs?.paper_size}`}</Text>
          )}
          {currentDocs?.print_orientation && (
            <Text
              style={[
                REGULAR_TEXT(13, COLORS.gray),
                {textAlign: 'center', marginBottom: 6},
              ]}>{`Orientation : ${currentDocs?.print_orientation}`}</Text>
          )}
          {currentDocs?.print_type && (
            <Text
              style={[
                REGULAR_TEXT(13, COLORS.gray),
                {textAlign: 'center', marginBottom: 6},
              ]}>{`Print Type : ${currentDocs?.print_type}`}</Text>
          )}
          {currentDocs?.number_of_copies && (
            <Text
              style={[
                REGULAR_TEXT(13, COLORS.gray),
                {textAlign: 'center', marginBottom: 6},
              ]}>{`No of Copies : ${currentDocs?.number_of_copies}`}</Text>
          )}
          {currentDocs?.charges && (
            <Text
              style={[
                REGULAR_TEXT(13, COLORS.gray),
                {textAlign: 'center', marginBottom: 6},
              ]}>{`Total Price : Rs.${currentDocs?.charges}`}</Text>
          )}
        </View>
      </View>
    );
  };

  const renderButtonContainer = () => {
    return (
      <View style={styles.buttonContainer}>
        <CustomGradientButton
          title="Preview Documents"
          onPress={() => {
            navigation.navigate({
              name: 'PreviewDocScreen',
              params: {
                document: currentDocs ? currentDocs : document,
              },
            } as never);
          }}
          outerContainerStyle={{
            width: 'auto',
          }}
          innerContainerStyle={{
            backgroundColor: 'white',
          }}
          labelStyle={{
            fontSize: 12,
            color: 'rgba(124, 42, 232, 1)',
            fontWeight: '700',
          }}
        />
        <CustomGradientButton
          title="Find Nearest Kiosk"
          onPress={() => navigation.navigate('FindKioskScreen' as never)}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.mainBg} />
      <DashboardHeader2 />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        {renderCodeContainer()}
        {renderQRCodeContainer()}
      </ScrollView>
      {renderButtonContainer()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {flex: 1, backgroundColor: COLORS.mainBg, padding: 15},
  container: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subText: {
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  codeContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  codeBoxWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  codeBox: {
    width: 40,
    height: 50,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: '#888',
  },
  codeDigit: {
    fontSize: 20,
    fontWeight: '600',
  },
  orText: {
    marginVertical: 10,
    fontWeight: 'bold',
    color: '#999',
  },
  qrCodeContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  qrGradientBox: {
    width: 100,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  scanTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  buttonContainer: {
    paddingTop: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
    borderRadius: 30,
    marginBottom: 16,
    gap: 10,
  },
  qrImage: {
    width: width * 0.9,
    height: 100,
    objectFit: 'contain',
    marginBottom: 16,
    marginTop: 16,
  },
});
