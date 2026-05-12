import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const PdfViewerScreen = ({pdfUrl}: {pdfUrl: string}) => {
  return (
    <View style={styles.container}>
      <WebView
        source={{
          uri: `https://docs.google.com/gview?embedded=true&url=${pdfUrl}`,
        }}
        style={{flex: 1}}
        startInLoadingState
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
});

export default PdfViewerScreen;
