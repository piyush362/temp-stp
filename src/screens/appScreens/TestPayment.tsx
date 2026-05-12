import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  BackHandler,
  NativeEventEmitter,
  NativeModules,
  TouchableOpacity,
} from 'react-native';
import {ScreenWrapper} from '../../components/wrapper';
import ApiClient from './ApiClient'; // Replace with your actual API client
import {initiateJuspayPaymentService} from '../../service/paymentService';
import {JSONOBJECTLOG} from '../../utils/utils';

export default function TestPayment() {
  const [isLoaderActive, setIsLoaderActive] = useState(false);

  useEffect(() => {}, []);

  const startPayment = async () => {
    setIsLoaderActive(true);
    const payload = {
      order_id: `test-${getRandomNumber()}`,
      amount: 1, // you can change this to dynamic value
    };

    try {
      const response = await initiateJuspayPaymentService(payload);
      //   JSONOBJECTLOG(response);
      //   const {sdk_payload} = JSON.parse(response);
    } catch (error: any) {
      JSONOBJECTLOG(error?.response?.data);
    } finally {
      setIsLoaderActive(false);
    }

    // ApiClient.sendPostRequest(
    //   'http://10.0.2.2:5000/initiateJuspayPayment', // or your actual API
    //   payload,
    //   {
    //     onResponseReceived: response => {
    //       const {sdkPayload} = JSON.parse(response);
    //       HyperSdkReact.openPaymentPage(JSON.stringify(sdkPayload));
    //     },
    //     onFailure: error => {
    //       setIsLoaderActive(false);
    //       console.error('Payment API failed:', error);
    //     },
    //   },
    // );
  };

  const getRandomNumber = () => Math.floor(Math.random() * 90000000) + 10000000;

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Juspay Test Payment</Text>
        <TouchableOpacity style={styles.payButton} onPress={startPayment}>
          <Text style={styles.buttonText}>Start Payment</Text>
        </TouchableOpacity>

        {isLoaderActive && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#115390',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
});
