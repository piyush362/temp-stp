import {
  Image,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {useRoute} from '@react-navigation/native';
import {downloadAndConvertPdfToImagesV3} from '../../../utils/pdftoimage';
import {Grayscale} from 'react-native-color-matrix-image-filters';
import {JSONOBJECTLOG} from '../../../utils/utils';
import {COLORS} from '../../../theme/colors';
import {getFileTypeFromUrl} from '../../../utils/uploadDocUtils';
import {REGULAR_TEXT} from '../../../theme/styles.global';

const {width} = Dimensions.get('window');

export default function PreviewDocScreen() {
  const route = useRoute();
  const {document} = route.params as any;
  console.log('document', document);
  JSONOBJECTLOG(document);

  const [pageImage, setPageImage] = useState<string | null>(null);
  const [allPageImages, setAllPageImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isBW, setIsBW] = useState(false);
  const [documentType, setDocumentType] = useState<string | null>('');

  const getPdfImage = async () => {
    const documentType = getFileTypeFromUrl(document?.document_link);
    setDocumentType(documentType);
    if (documentType !== 'pdf') return;
    setLoading(true);
    const result = await downloadAndConvertPdfToImagesV3(
      document?.document_link,
    );
    if (result?.imageFile?.uri) {
      setPageImage(result?.imageFile?.uri);
    }
    setAllPageImages(result?.allImages ?? []);
    setLoading(false);
  };

  useEffect(() => {
    getPdfImage();
  }, []);

  useEffect(() => {
    if (document?.print_type == 'colored') {
      setIsBW(false);
    } else {
      setIsBW(true);
    }
  }, [document]);

  const getImageContainerStyle = () => {
    const isPortrait =
      document?.print_orientation?.toLowerCase() === 'portrait';

    if (isPortrait) {
      return {
        width: width * 0.85,
        height: width * 1.1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        overflow: 'hidden' as const,
      };
    } else {
      // Container should be square to accommodate rotated image
      return {
        width: width * 0.85,
        height: width * 0.85,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        overflow: 'hidden' as const,
      };
    }


  };
  const getImageStyle = () => {
    const isPortrait =
      document?.print_orientation?.toLowerCase() === 'portrait';

    if (!isPortrait) {
      return {
        width: '100%' as const,
        height: '100%' as const,
        resizeMode: 'contain' as const,
        transform: [{rotate: '90deg'}],
      };
    }

    return {
      width: '100%' as const,
      height: '100%' as const,
      resizeMode: 'contain' as const,
    };
  };

  const renderPreviewContainer = () => {
    return (
      <View style={{marginTop: 10, flex: 1}}>
        <View style={{flex: 1, marginHorizontal: 15}}>
          {allPageImages?.length > 0 && documentType === 'pdf' && (
            <FlatList
              data={allPageImages}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({item, index}) => (
                <View
                  style={{
                    marginBottom: 20,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderColor: '#E1EBFF',
                    borderWidth: 1,
                    borderRadius: 10,
                    padding: 10,
                    backgroundColor: '#fff',
                  }}>
                  {isBW ? (
                    <Grayscale>
                      <View style={getImageContainerStyle()}>
                        <Image
                          source={{uri: item?.uri}}
                          style={getImageStyle()}
                        />
                      </View>
                    </Grayscale>
                  ) : (
                    <View style={getImageContainerStyle()}>
                      <Image
                        source={{uri: item?.uri}}
                        style={getImageStyle()}
                      />
                    </View>
                  )}
                  <Text
                    style={[
                      REGULAR_TEXT(10, '#7A7A7A'),
                      {textAlign: 'center', marginTop: 5},
                    ]}>
                    {`Page no. ${index + 1}`}
                  </Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}

          {documentType === 'image' && (
            <View style={{alignItems: 'center'}}>
              {isBW ? (
                <Grayscale>
                  <View style={getImageContainerStyle()}>
                    <Image
                      source={{uri: document?.document_link}}
                      style={getImageStyle()}
                    />
                  </View>
                </Grayscale>
              ) : (
                <View style={getImageContainerStyle()}>
                  <Image
                    source={{uri: document?.document_link}}
                    style={getImageStyle()}
                  />
                </View>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScreenWrapper
      disableScroll={true}
      headerComponent={<HeaderNavigation label="Preview Documents" />}
      backgroundColor={COLORS.mainBg}>
      {loading && (
        <View>
          <ActivityIndicator size={'large'} color={COLORS.primary} />
          <Text
            style={[
              REGULAR_TEXT(12, COLORS.primary),
              {marginTop: 10, textAlign: 'center'},
            ]}>
            Preparing your preview...
          </Text>
          <Text
            style={[
              REGULAR_TEXT(12, COLORS.primary),
              {marginTop: 10, textAlign: 'center'},
            ]}>
            This may take a moment, especially for larger files. Thanks for your
            patience!
          </Text>
        </View>
      )}
      {!loading && renderPreviewContainer()}
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  previewContainer: {
    height: 550,
    borderRadius: 10,
    overflow: 'hidden',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIconContainer: {
    alignItems: 'flex-end',
    padding: 10,
    width: '100%',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  closeIcon: {
    width: 22,
    height: 22,
  },
  imageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfImage: {
    width: '100%',
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  button: {
    marginHorizontal: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6A5ACD',
  },
  buttonActive: {
    backgroundColor: '#6A5ACD',
  },
  buttonText: {
    color: '#6A5ACD',
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: 'white',
  },
  noImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageImage: {
    width: width * 0.85,
    height: width * 1.2, // maintain aspect ratio for vertical view
    borderRadius: 8,
  },
});
