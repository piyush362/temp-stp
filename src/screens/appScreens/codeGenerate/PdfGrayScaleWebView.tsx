import React from 'react';
import {View, StyleSheet} from 'react-native';
import {WebView} from 'react-native-webview';

const PdfGrayScaleWebView = ({pdfUrl}: {pdfUrl: string}) => {
  const html = `
  <html>
    <head>
      <style>
        html, body {
          margin: 0; padding: 0; height: 100%;
          filter: grayscale(100%);
        }
        iframe {
          width: 100%; height: 100%; border: none;
        }
      </style>
    </head>
    <body>
      <iframe src="${pdfUrl}"></iframe>
    </body>
  </html>`;

  return (
    <View style={{flex: 1}}>
      <WebView originWhitelist={['*']} source={{html}} style={{flex: 1}} />
    </View>
  );
};

export default PdfGrayScaleWebView;
