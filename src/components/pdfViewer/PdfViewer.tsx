// PdfViewer.tsx
import React from 'react';
import { View, Dimensions, StyleSheet } from 'react-native';
import Pdf from 'react-native-pdf';

interface PdfViewerProps {
  uri: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ uri }) => {
  const source = { uri, cache: true };

  return (
    <View style={styles.container}>
      <Pdf
        source={source}
        style={styles.pdf}
        onError={error => {
          console.log('PDF load error:', error);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
  },
});

export default PdfViewer;
