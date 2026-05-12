import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {WebView} from 'react-native-webview';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScreenWrapper} from '../wrapper';
import HeaderNavigation from '../header/HeaderNavigation1';
import {RouteProp, useRoute} from '@react-navigation/native';

const {width, height} = Dimensions.get('window');

type RootStackParamList = {
  MapWebView: {
    url: string;
    headerLabel?: string;
  };
};

type MapWebViewRouteProp = RouteProp<RootStackParamList, 'MapWebView'>;

export default function MapWebViewComponent() {
  const route = useRoute<MapWebViewRouteProp>();
  const {url, headerLabel = 'Map View'} = route.params;

  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label={headerLabel} />}
      disableScroll={true}>
      <SafeAreaView style={styles.container}>
        <WebView
          source={{uri: url}}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
        />
      </SafeAreaView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    height,
  },
  webview: {
    flex: 1,
  },
});
