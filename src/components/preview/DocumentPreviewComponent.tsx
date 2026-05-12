import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  ViewStyle,
  ImageStyle,
  Platform,
} from 'react-native';
import {
  ColorMatrix,
  concatColorMatrices,
  grayscale,
  contrast,
  Matrix,
} from 'react-native-color-matrix-image-filters';
import {REGULAR_TEXT} from '../../theme/styles.global';
import {COLORS} from '../../theme/colors';

const identityMatrix: Matrix = [
  1,
  0,
  0,
  0,
  0, //
  0,
  1,
  0,
  0,
  0, //
  0,
  0,
  1,
  0,
  0, //
  0,
  0,
  0,
  1,
  0,
];

interface DocumentPreviewProps {
  loading?: boolean;
  allPageImages?: {uri?: string | null}[] | null;
  uploadedDocumentType?: 'pdf' | 'image' | string | null;
  uploadedDocumentResponse?: {document_link?: string | null} | null;
  printType?: 'bw' | 'color' | string | null;
  pageLength?: number | null;
  getImageContainerStyle?: () => ViewStyle;
  getImageStyle?: () => ImageStyle;
}

const DocumentPreviewComponent: React.FC<DocumentPreviewProps> = ({
  loading = false,
  allPageImages = [],
  uploadedDocumentType = '',
  uploadedDocumentResponse = null,
  printType = 'color',
  pageLength = null,
  getImageContainerStyle,
  getImageStyle,
}) => {
  const [uniqueKey, setUniqueKey] = useState(Date.now());

  // 🔄 Force refresh on printType or link change
  // useEffect(() => {
  //   setUniqueKey(Date.now());
  // }, [printType, uploadedDocumentResponse?.document_link]);

  const cacheParam = '10';
  //  = useMemo(
  //   () => `${uniqueKey}_${printType}`,
  //   [uniqueKey, printType],
  // );

  // 🧩 Loading state
  if (loading) {
    return (
      <View style={styles.swiperContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text
          style={[
            REGULAR_TEXT(12, COLORS.primary),
            {marginTop: 10, textAlign: 'center'},
          ]}>
          Preparing your preview...
        </Text>
      </View>
    );
  }

  // 🧾 PDF file → show all pages
  if (Array.isArray(allPageImages) && allPageImages.length > 0) {
    const validPages = allPageImages.filter(item => !!item?.uri);
    if (validPages.length === 0) {
      return (
        <View style={styles.swiperContainer}>
          <Text
            style={[
              REGULAR_TEXT(12, '#7A7A7A'),
              {textAlign: 'center', marginTop: 20},
            ]}>
            No valid PDF pages found.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.swiperContainer} key={`pdf_${cacheParam}`}>
        <Text
          style={[
            REGULAR_TEXT(10, '#7A7A7A'),
            {textAlign: 'center', marginBottom: 8},
          ]}>
          {`No. of pages: ${pageLength ?? validPages.length}`}
        </Text>

        <FlatList
          horizontal
          data={validPages}
          keyExtractor={(_, index) => `${index}_${cacheParam}`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingHorizontal: 8}}
          renderItem={({item, index}) => (
            <View
              style={{
                marginHorizontal: 5,
                justifyContent: 'center',
                alignItems: 'center',
                borderColor: '#E1EBFF',
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
                backgroundColor: '#FFF',
              }}>
              <ColorMatrix
                key={`pdf_page_${index}_${cacheParam}`}
                matrix={
                  printType === 'bw'
                    ? concatColorMatrices(grayscale(), contrast(1.1))
                    : identityMatrix
                }>
                <View style={getImageContainerStyle?.()}>
                  <Image
                    key={`pdf_img_${index}_${cacheParam}`}
                    source={{
                      uri: `${item.uri}?${cacheParam}`,
                    }}
                    style={getImageStyle?.()}
                    resizeMode="contain"
                  />
                </View>
              </ColorMatrix>
              <Text
                style={[
                  REGULAR_TEXT(8, '#7A7A7A'),
                  {textAlign: 'center', marginTop: 6},
                ]}>{`Page ${index + 1}`}</Text>
            </View>
          )}
        />
      </View>
    );
  }

  // 🖼️ Image file → single preview
  if (
    uploadedDocumentType === 'image' &&
    uploadedDocumentResponse?.document_link
  ) {
    const link = uploadedDocumentResponse.document_link;

    return (
      <View
        key={`image_${cacheParam}`}
        style={[
          styles.swiperContainer,
          {justifyContent: 'center', alignItems: 'center'},
        ]}>
        <ColorMatrix
          key={`matrix_${cacheParam}`}
          matrix={
            printType === 'bw'
              ? concatColorMatrices(grayscale(), contrast(1.1))
              : identityMatrix
          }>
          <View style={getImageContainerStyle?.()}>
            <Image
              key={`img_${cacheParam}`}
              source={{
                uri: `${link}?${cacheParam}`,
              }}
              style={getImageStyle?.()}
              resizeMode="contain"
            />
          </View>
        </ColorMatrix>
      </View>
    );
  }

  // ❌ Fallback
  return (
    <View style={styles.swiperContainer}>
      <Text
        style={[
          REGULAR_TEXT(12, '#7A7A7A'),
          {textAlign: 'center', marginTop: 20},
        ]}>
        No preview available.
      </Text>
    </View>
  );
};

export default React.memo(DocumentPreviewComponent);

const styles = StyleSheet.create({
  swiperContainer: {
    height: 400,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
});
