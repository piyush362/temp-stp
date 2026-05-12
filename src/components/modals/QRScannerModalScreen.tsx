import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
// import {
//   Camera,
//   useCameraDevice,
//   useCodeScanner,
// } from 'react-native-vision-camera';
import { BOLD_TEXT, REGULAR_TEXT } from '../../theme/styles.global';
import { COLORS } from '../../theme/colors';
import HeaderNavigation from '../header/HeaderNavigation1';
import { io } from 'socket.io-client';
import { BASEURL } from '../../../app.env';
import { JSONOBJECTLOG } from '../../utils/utils';
import FullScreenLoader from './FullScreenLoader';
import { getSocket } from '../../socket/socketService';
import { useDispatch } from 'react-redux';
import { showSnackbar } from '../../redux/slices/snackbar.slice';
import { SnackbarType } from '../../types/common.types';

const { width } = Dimensions.get('window');

export const parseQrPayload = (url: string) => {
  try {
    // Split the URL at the '?'
    const parts = url.split('?');
    if (parts.length < 2) {
      return { success: false, message: 'Invalid QR payload' };
    }

    const queryString = parts[1]; // topic=abc&track=xyz
    const paramsArray = queryString.split('&');

    let topicName = null;
    let kios_receiver_topic = null;

    paramsArray.forEach(pair => {
      const [key, value] = pair.split('=');
      if (key === 'topic') topicName = decodeURIComponent(value);
      if (key === 'track') kios_receiver_topic = decodeURIComponent(value);
    });

    return {
      topicName,
      kios_receiver_topic,
      success: !!(topicName && kios_receiver_topic),
    };
  } catch (err) {
    return { success: false, message: 'Invalid QR payload' };
  }
};

const QRScannerModalScreen = () => {
  const navigation = useNavigation();
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedCode, setScannedCode] = useState<any>('');
  const [socketConnection, setSocketConnection] = useState(false);
  const [isSocketLoading, setIsSocketLoading] = useState(true);

  const [qrScanningLoading, setQrScanningLoading] = useState(false);

  const route = useRoute();
  const { currentDocs = {} } = (route.params as any) || {};

  // const device = useCameraDevice('back');

  // const codeScanner = useCodeScanner({
  //   codeTypes: ['qr'],
  //   onCodeScanned: codes => {
  //     if (codes.length > 0 && !scannedCode) {
  //       const code = codes[0]?.value;
  //       // console.log('Scanned Code:', code);
  //       setScannedCode(code);
  //       emitSocket(code);
  //     }
  //   },
  // });

  const socket = getSocket();

  const dispatch = useDispatch();
  // const emitSocket = async (data: any) => {
  //   // data can be a url ( like:  `https://www.stapples.in/?topic=${topicName}&track=${kios_receiver_topic}`; // value will come)
  //   // or
  //   // json string like {topicName, kios_receiver_topic}
  //   try {
  //     setQrScanningLoading(true);
  //     // prev use for parting json
  //     // const parsedData = JSON.parse(data);
  //     // const {topicName, kios_receiver_topic} = result;

  //     // new flow with url
  //     const result = parseQrPayload(data); // return topicName, kios_receiver_topic
  //     const topicName = result.topicName;
  //     const kios_receiver_topic = result.kios_receiver_topic;

  //     console.log(
  //       'sokect emit',
  //       topicName,
  //       kios_receiver_topic,
  //       currentDocs?.kiosk_documents_id,
  //     );
  //     socket.emit(`${topicName}`, {
  //       kios_receiver_topic: `${kios_receiver_topic}`,
  //       document_id: Number(currentDocs?.kiosk_documents_id),
  //     });
  //     Alert.alert('QR Code Scanned Successfully');
  //   } catch (error) {
  //     console.log('❌ Failed to parse QR Code data:', error);
  //     dispatch(
  //       showSnackbar({
  //         message: 'Failed to parse QR Code data',
  //         type: SnackbarType.error,
  //       }),
  //     );
  //   } finally {
  //     setTimeout(() => {
  //       setQrScanningLoading(false);
  //       navigation.goBack();
  //     }, 1000);
  //   }
  // };

  const emitSocket = async (data: any) => {
    try {
      setQrScanningLoading(true);

      let topicName = '';
      let kios_receiver_topic = '';

      // ---------- CASE 1: URL using your parseQrPayload ----------
      const urlResult = await parseQrPayload(data);

      if (urlResult?.success) {
        topicName = urlResult.topicName || '';
        kios_receiver_topic = urlResult.kios_receiver_topic || '';
      } else {
        // ---------- CASE 2: JSON string ----------
        try {
          const parsed = JSON.parse(data);
          topicName = parsed.topicName;
          kios_receiver_topic = parsed.kios_receiver_topic;
        } catch (err) {
          console.log('Not a valid JSON string');
        }
      }

      // ---------- ERROR if both failed ----------
      if (!topicName || !kios_receiver_topic) {
        throw new Error('Invalid QR Code format');
      }

      console.log(
        'socket emit',
        topicName,
        kios_receiver_topic,
        currentDocs?.kiosk_documents_id,
      );

      socket.emit(`${topicName}`, {
        kios_receiver_topic: `${kios_receiver_topic}`,
        document_id: Number(currentDocs?.kiosk_documents_id),
      });

      Alert.alert('QR Code Scanned Successfully');
    } catch (error) {
      console.log('❌ Failed to parse QR Code data:', error);

      dispatch(
        showSnackbar({
          message: 'Failed to parse QR Code data',
          type: SnackbarType.error,
        }),
      );
    } finally {
      setTimeout(() => {
        setQrScanningLoading(false);
        navigation.goBack();
      }, 1000);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      setSocketConnection(true);
      setIsSocketLoading(false);
    }
  }, []);

  useEffect(() => {
    const requestPermission = async () => {
      console.log('Requesting Camera Permission...');
      // const permission = await Camera.requestCameraPermission();
      const permission = 'granted';
      console.log('Camera Permission:', permission);
      setHasPermission(permission === 'granted');
    };
    requestPermission();
  }, []);

  if (true) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={BOLD_TEXT(16, COLORS.black)}>
          Requesting Camera Permission...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Close button */}
      <View style={{ width: '100%' }}>
        <HeaderNavigation label="" />
      </View>
      {/* Title */}
      <Text style={[BOLD_TEXT(18, COLORS.black), { marginBottom: 20 }]}>
        Scan Kiosk QR Code
      </Text>

      {/* Small camera frame in center */}
      {/* <View style={styles.cameraFrame}>
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={!scannedCode && socketConnection} // ✅ socket check added
          codeScanner={codeScanner}
        />
      </View> */}

      {/* Socket Connection Status */}
      {isSocketLoading ? (
        <ActivityIndicator size="small" color={COLORS.primary} />
      ) : (
        <Text style={[REGULAR_TEXT(10, 'gray')]}>{`Socket Connection Status: ${
          socketConnection ? 'True ✅' : 'False ❌'
        }`}</Text>
      )}

      {/* Refresh Socket Button */}
      {!socketConnection && (
        <TouchableOpacity
          onPress={() => {
            // if (!isSocketLoading) connectSocket();
          }}
          disabled={isSocketLoading}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 10,
            backgroundColor: COLORS.primary,
            borderRadius: 10,
            marginTop: 10,
            opacity: isSocketLoading ? 0.6 : 1,
          }}
        >
          <Text style={[REGULAR_TEXT(10, 'black')]}>
            {isSocketLoading ? 'Connecting...' : 'Refresh Connection'}
          </Text>
        </TouchableOpacity>
      )}
      <FullScreenLoader visible={qrScanningLoading} />
    </View>
  );
};

export default QRScannerModalScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.mainBg,
    alignItems: 'center',
    paddingTop: 40,
  },
  cameraFrame: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary || '#7C2AE8',
    marginBottom: 30,
  },
  useButton: {
    backgroundColor: COLORS.primary || '#7C2AE8',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: COLORS.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    zIndex: 10,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
