/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Animated,
  Easing,
} from 'react-native';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import {COLORS, secondaryGradient} from '../../theme/colors';
import {RadioButton} from 'react-native-paper';
import CustomGradientButton from '../buttons/CustomGradientButton';
import LinearGradient from 'react-native-linear-gradient';
import {IMAGES} from '../../theme/images';
import {Grayscale} from 'react-native-color-matrix-image-filters';
import {useFocusEffect} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {PrintPriceV2} from '../../redux/slices/auth.slice';
import {
  calculatePrintPriceV2,
  getPrintingCombination,
  downloadAndConvertPdfToImagesV3,
} from '../../utils/pdftoimage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ICONS} from '../../theme/icons';

const {height, width} = Dimensions.get('window');

interface Props {
  visible: boolean;
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

export default function PrintSpecsModal({
  visible,
  onCancel,
  onProceed,
  uploadedDocumentResponse,
  uploadedDocumentType = null,
  amount,
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

  // slide-up animation
  const slideAnim = React.useRef(new Animated.Value(height)).current;
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(height);
    }
  }, [visible]);

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
    // JSONOBJECTLOG(_combinationPrice);
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
    // bottomSheetRef.current?.close();
    setPageImage(null);
    setCount(1);
    setIsPriceCalculating(false);
    setLoading(false);
    setPageLength(1);
    const _data = {
      paperSize,
      printType,
      printOrientation,
      calculatedPrice,
      numberOfCopies: count,
      priceCombination: priceCombination ?? null,
    };
    onProceed(_data);
    setPaperSize('A4');
    setPrintType('bw');
    setPrintOrientation('portrait');
  };

  const handleOnCancel = () => {
    // bottomSheetRef.current?.close();
    setPageImage(null);
    setCount(1);
    setIsPriceCalculating(false);
    setCalculatedPrice('0.00');
    setLoading(false);
    setPageLength(1);
    setPaperSize('A4');
    setPrintType('bw');
    setPrintOrientation('portrait');
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
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => {
        // resetState();
        setPaperSize('A4');
        setPrintType('bw');
        setPrintOrientation('portrait');
        onCancel && onCancel();
      }}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View
        style={[styles.modalContainer, {transform: [{translateY: slideAnim}]}]}>
        <View
          style={{
            flex: 1,
            justifyContent: 'space-between',
            paddingTop: safeAreaInsert.top,
          }}>
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
                  <TouchableOpacity
                    onPress={decrement}
                    style={styles.iconButton}>
                    <MaterialIcons
                      name="remove"
                      size={20}
                      color={COLORS.black}
                    />
                  </TouchableOpacity>

                  <Text style={REGULAR_TEXT(14)}>{count}</Text>

                  <TouchableOpacity
                    onPress={increment}
                    style={styles.iconButton}>
                    <MaterialIcons name="add" size={20} color={COLORS.black} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.section}>
                <Text
                  style={[REGULAR_TEXT(13, COLORS.gray), styles.subHeading]}>
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
                <Text
                  style={[REGULAR_TEXT(13, COLORS.gray), styles.subHeading]}>
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
                <Text
                  style={[REGULAR_TEXT(13, COLORS.gray), styles.subHeading]}>
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
                      <Text style={REGULAR_TEXT(12, COLORS.gray)}>
                        Landscape
                      </Text>
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
                      <Text style={REGULAR_TEXT(12, COLORS.gray)}>
                        Portrait
                      </Text>
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
            <View
              style={[styles.footer, {paddingBottom: safeAreaInsert.bottom}]}>
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
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  modalContainer: {
    position: 'absolute',
    bottom: 0,
    height: height,
    width: '100%',
    backgroundColor: '#F5F1FE',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  section: {marginBottom: 10},
  subHeading: {},
  radioGroup: {flexDirection: 'row', flexWrap: 'wrap', gap: 30},
  radioOption: {flexDirection: 'row', alignItems: 'center'},
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
  },
  swiperContainer: {
    height: 400,
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  pageItem: {
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#E1EBFF',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  counterContainer: {flexDirection: 'row', alignItems: 'center', gap: 12},
  iconButton: {
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.gray2,
    borderRadius: 6,
  },
});
