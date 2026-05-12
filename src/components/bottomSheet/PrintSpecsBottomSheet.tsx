/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import {COLORS, secondaryGradient} from '../../theme/colors';
import {RadioButton} from 'react-native-paper';
import CustomGradientButton from '../buttons/CustomGradientButton';
import LinearGradient from 'react-native-linear-gradient';
import {IMAGES} from '../../theme/images';
import Swiper from 'react-native-swiper';
import {ICONS} from '../../theme/icons';
import {viewDocument} from '@react-native-documents/viewer';
import {JSONOBJECTLOG} from '../../utils/utils';
import PdfViewerScreen from '../pdfViewer/PdfViewerWebView';
import {
  calculatePrintPrice,
  calculatePrintPriceV2,
  downloadAndConvertPdfToImages,
  downloadAndConvertPdfToImagesV3,
  getPrintingCombination,
} from '../../utils/pdftoimage';
import {Grayscale} from 'react-native-color-matrix-image-filters';
import {useFocusEffect} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {PrintPriceV2} from '../../redux/slices/auth.slice';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const {height, width} = Dimensions.get('window');

const DUMMY_PAGES = [IMAGES.page, IMAGES.page, IMAGES.page];

interface Props {
  bottomSheetRef: any;
  onProceed: (specs: {
    paperSize: string;
    printType: string;
    printOrientation: string;
    numberOfCopies: string | number;
    calculatedPrice: string | number;
    priceCombination: PrintPriceV2 | null;
  }) => void;
  uploadedDocumentResponse: any;
  uploadedDocumentType: string | null;
  amount: number;
  onCancel?: () => void;
}

export default function PrintSpecsBottomSheet({
  bottomSheetRef,
  onProceed,
  uploadedDocumentResponse,
  uploadedDocumentType = null,
  amount,
  onCancel,
}: Props) {
  const [paperSize, setPaperSize] = useState('A4');
  const [printType, setPrintType] = useState('bw');
  const [printOrientation, setPrintOrientation] = useState('portrait'); // portrait or landscape
  const [pageLength, setPageLength] = useState(1);

  const [calculatedPrice, setCalculatedPrice] = useState('0.00');
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);

  // console.log('uploadedDocumentResponse ', uploadedDocumentResponse);

  const safeAreaInsert = useSafeAreaInsets();

  const [pageImage, setPageImage] = useState<string | null>(null);
  const [allPageImages, setAllPageImages] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const [priceCombination, setPriceCombination] = useState<PrintPriceV2 | null>(
    null,
  );

  const [count, setCount] = useState(1);

  const {printPrice, printPriceV2} = useSelector(
    (state: RootState) => state.auth,
  );

  // console.log('printPriceV2');
  // JSONOBJECTLOG(printPriceV2);
  // printPrice?.black_and_white, printPrice?.colored;

  useEffect(() => {
    setIsPriceCalculating(true);
    // console.log('printType', printType);
    // console.log('paperSize', paperSize);
    const _combination = getPrintingCombination({
      printType: printType?.toLowerCase() == 'bw' ? 'bw' : 'color',
      paperSize: paperSize?.toLowerCase() == 'a3' ? 'a3' : 'a4',
    });
    // console.log('combination', _combination);
    const _combinationPrice = printPriceV2?.find(
      item => item.name === _combination,
    );
    JSONOBJECTLOG(_combinationPrice);
    setPriceCombination(_combinationPrice ?? null);
    // const _price = calculatePrintPrice({
    //   printType: printType === 'bw' ? 'bw' : 'color',
    //   numberOfCopies: count,
    //   numberOfPages: pageLength,
    //   printPrice: printPrice ?? {black_and_white: 0, colored: 0},
    // });

    const _price = calculatePrintPriceV2({
      printCombinationPrice: _combinationPrice ?? null,
      numberOfCopies: count,
      numberOfPages: pageLength,
    });
    const _parsePrice = Number(_price).toFixed(2);
    setCalculatedPrice(_parsePrice);
    setIsPriceCalculating(false);
  }, [
    printType,
    count,
    pageLength,
    printPrice,
    paperSize,
    uploadedDocumentResponse?.document_link,
  ]);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => {
    if (count > 1) setCount(prev => prev - 1);
  };

  const handleProceed = () => {
    bottomSheetRef.current?.close();
    setPageImage(null);
    setCount(1);
    setIsPriceCalculating(false);
    setLoading(false);
    setPageLength(1);
    onProceed({
      paperSize,
      printType,
      printOrientation,
      calculatedPrice,
      numberOfCopies: count,
      priceCombination: priceCombination ?? null,
    });
  };

  const handleOnCancel = () => {
    bottomSheetRef.current?.close();
    setPageImage(null);
    setCount(1);
    setIsPriceCalculating(false);
    setCalculatedPrice('0.00');
    setLoading(false);
    setPageLength(1);
    onCancel?.();
  };

  const getPdfImage = async () => {
    setPageImage(null);
    setAllPageImages(null);
    if (!uploadedDocumentType || uploadedDocumentType !== 'pdf') return;
    if (!uploadedDocumentResponse?.document_link) return;
    setLoading(true);
    const result = await downloadAndConvertPdfToImagesV3(
      uploadedDocumentResponse?.document_link,
    );
    // console.log('image ', result?.imageFile);
    if (result?.imageFile?.uri) {
      setPageImage(result?.imageFile.uri);
    }
    setPageLength(result?.fileLength ?? 1);
    setAllPageImages(result?.allImages ?? []);
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      getPdfImage();
    }, [uploadedDocumentResponse?.document_link]),
  );

  const getImageContainerStyle = () => {
    if (printOrientation === 'portrait') {
      return {
        width: width * 0.6,
        height: width * 0.9,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      };
    } else {
      return {
        width: width * 0.8,
        height: width * 0.6,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      };
    }
  };

  const getImageStyle = () => {
    const base = {
      width: '100%' as const,
      height: '100%' as const,
      resizeMode: 'contain' as const,
    };

    if (printOrientation === 'landscape') {
      return {
        ...base,
        transform: [{rotate: '90deg'}],
      };
    }

    return base;
  };

  const renderPreviewContainer = () => {
    return (
      <View>
        <View style={styles.swiperContainer}>
          {!loading && (
            <Text
              style={[
                REGULAR_TEXT(10, '#7A7A7A'),
                {textAlign: 'center'},
              ]}>{`No. of pages: ${pageLength ?? 1}`}</Text>
          )}

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
                This may take a moment, especially for larger files. Thanks for
                your patience!
              </Text>
            </View>
          )}

          {allPageImages && (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <FlatList
                horizontal
                data={allPageImages}
                keyExtractor={(_, index) => index.toString()}
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
                    }}>
                    {printType === 'bw' ? (
                      <Grayscale>
                        <View style={getImageContainerStyle()}>
                          <Image
                            source={{uri: item?.uri}}
                            style={getImageStyle()}
                          />
                        </View>
                        <Text
                          style={[
                            REGULAR_TEXT(8, '#7A7A7A'),
                            {textAlign: 'center'},
                          ]}>{`Page no. ${index + 1}`}</Text>
                      </Grayscale>
                    ) : (
                      <View>
                        <View style={getImageContainerStyle()}>
                          <Image
                            source={{uri: item?.uri}}
                            style={getImageStyle()}
                          />
                        </View>
                        <Text
                          style={[
                            REGULAR_TEXT(8, '#7A7A7A'),
                            {textAlign: 'center'},
                          ]}>{`Page no. ${index + 1}`}</Text>
                      </View>
                    )}
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {uploadedDocumentType === 'image' && (
            <View
              style={{
                marginTop: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {printType === 'bw' ? (
                <Grayscale>
                  <View style={getImageContainerStyle()}>
                    <Image
                      source={{uri: uploadedDocumentResponse?.document_link}}
                      style={getImageStyle()}
                    />
                  </View>
                </Grayscale>
              ) : (
                <View style={getImageContainerStyle()}>
                  <Image
                    source={{uri: uploadedDocumentResponse?.document_link}}
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
    <RBSheet
      ref={bottomSheetRef}
      closeOnPressMask={true}
      height={height}
      onClose={() => {
        setPaperSize('A4');
        setPrintType('bw');
        setPrintOrientation('portrait');
      }}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        container: {
          backgroundColor: '#F5F1FE',
          paddingTop: safeAreaInsert.top,
        },
      }}>
      <View style={{flex: 1, justifyContent: 'space-between'}}>
        <ScrollView style={{}}>
          <View style={[styles.detailContainer, {marginTop: 15}]}>
            <TouchableOpacity
              onPress={() => {
                handleOnCancel();
              }}
              style={{alignItems: 'flex-end'}}>
              <Image
                source={ICONS.cross}
                style={{width: 20, height: 20, objectFit: 'contain'}}
              />
            </TouchableOpacity>
            {renderPreviewContainer()}
          </View>

          <View style={styles.detailContainer}>
            <View
              style={[
                styles.section,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                },
              ]}>
              <Text
                style={[
                  REGULAR_TEXT(13, COLORS.gray),
                  styles.subHeading,
                  {width: '50%'},
                ]}>
                No. of Copies
              </Text>

              <View style={styles.counterContainer}>
                <TouchableOpacity onPress={decrement} style={styles.iconButton}>
                  <MaterialIcons name="remove" size={20} color={COLORS.black} />
                </TouchableOpacity>

                <Text style={REGULAR_TEXT(14)}>{count}</Text>

                <TouchableOpacity onPress={increment} style={styles.iconButton}>
                  <MaterialIcons name="add" size={20} color={COLORS.black} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[REGULAR_TEXT(13, COLORS.gray), styles.subHeading]}>
                Select Paper Size
              </Text>
              <View style={styles.radioGroup}>
                <View style={styles.radioOption}>
                  <RadioButton
                    value="A4"
                    status={paperSize === 'A4' ? 'checked' : 'unchecked'}
                    onPress={() => setPaperSize('A4')}
                    color={COLORS.bg2}
                  />
                  <Text style={REGULAR_TEXT(12, COLORS.gray)}>A4</Text>
                </View>
                <View style={styles.radioOption}>
                  <RadioButton
                    value="A3"
                    status={paperSize === 'A3' ? 'checked' : 'unchecked'}
                    onPress={() => setPaperSize('A3')}
                    color={COLORS.bg2}
                    uncheckedColor={COLORS.gray}
                  />
                  <Text style={REGULAR_TEXT(12, COLORS.gray)}>A3</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[REGULAR_TEXT(13, COLORS.gray), styles.subHeading]}>
                Select Print Type
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity onPress={() => setPrintType('bw')}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="bw"
                      status={printType === 'bw' ? 'checked' : 'unchecked'}
                      onPress={() => setPrintType('bw')}
                      color={COLORS.bg2}
                    />
                    <Text style={REGULAR_TEXT(12, COLORS.gray)}>
                      Black & White
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setPrintType('color')}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="color"
                      status={printType === 'color' ? 'checked' : 'unchecked'}
                      onPress={() => setPrintType('color')}
                      color={COLORS.bg2}
                    />
                    <Text style={REGULAR_TEXT(12, COLORS.gray)}>Colored</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[REGULAR_TEXT(13, COLORS.gray), styles.subHeading]}>
                Select Print Orientation
              </Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  onPress={() => setPrintOrientation('landscape')}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="bw"
                      status={
                        printOrientation === 'landscape'
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => setPrintOrientation('landscape')}
                      color={COLORS.bg2}
                    />
                    <Text style={REGULAR_TEXT(12, COLORS.gray)}>Landscape</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setPrintOrientation('portrait')}>
                  <View style={styles.radioOption}>
                    <RadioButton
                      value="color"
                      status={
                        printOrientation === 'portrait'
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => setPrintOrientation('portrait')}
                      color={COLORS.bg2}
                    />
                    <Text style={REGULAR_TEXT(12, COLORS.gray)}>Portrait</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 1, y: 0}}
          colors={secondaryGradient}>
          <View style={[styles.footer, {paddingBottom: safeAreaInsert.bottom}]}>
            {isPriceCalculating ? (
              <View>
                <ActivityIndicator size="large" color={'gray'} />
              </View>
            ) : (
              <Text style={[REGULAR_TEXT(14, COLORS.gray)]}>
                Total{' '}
                <Text style={[BOLD_TEXT(16, COLORS.gray)]}>
                  {' '}
                  ₹{calculatedPrice ?? '00.00'}
                </Text>
              </Text>
            )}
            <CustomGradientButton
              onPress={handleProceed}
              title="Payment"
              outerContainerStyle={{
                width: '40%',
                height: 40,
              }}
              labelStyle={{
                fontSize: 14,
              }}
              innerContainerStyle={{
                paddingVertical: 7,
              }}
            />
          </View>
        </LinearGradient>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  heading: {
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  subHeading: {},
  radioGroup: {
    flexDirection: 'row',
    gap: 30,
    flexWrap: 'wrap',
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    padding: 15,
    paddingBottom: 20,
  },
  detailContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 10,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.20)',
  },
  swiperContainer: {
    height: 400,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfImage: {
    width: '100%',
    height: '100%',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // If gap doesn't work, use `marginHorizontal` on buttons
  },
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 6,
  },
});
