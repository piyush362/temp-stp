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
  Alert,
} from 'react-native';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import {COLORS, secondaryGradient} from '../../theme/colors';
import {RadioButton} from 'react-native-paper';
import CustomGradientButton from '../buttons/CustomGradientButton';
import LinearGradient from 'react-native-linear-gradient';
import {IMAGES} from '../../theme/images';
import {
  ColorMatrix,
  concatColorMatrices,
  contrast,
  grayscale,
  Grayscale,
  Matrix,
  saturate,
  sepia,
  tint,
} from 'react-native-color-matrix-image-filters';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../redux/store';
import {PrintPriceV2} from '../../redux/slices/auth.slice';
import {
  calculatePrintPriceV2,
  getPrintingCombination,
  downloadAndConvertPdfToImagesV3,
} from '../../utils/pdftoimage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {ICONS} from '../../theme/icons';
import {JSONOBJECTLOG} from '../../utils/utils';
import ChoosePaymentMethodModal from './ChoosePaymentMethodModal';
import {showSnackbar} from '../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../types/common.types';
import CustomRadioButton from '../buttons/CustomRadioButton';
import DocumentPreviewComponent from '../preview/DocumentPreviewComponent';

const {height, width} = Dimensions.get('window');

const identityMatrix: Matrix = [
  1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0,
];

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

export default function PrintSpecsScreen() {
  const route = useRoute();

  const {
    // visible,
    // onCancel,
    // onProceed,
    uploadedDocumentResponse,
    uploadedDocumentType = null,
    amount,
  } = route.params as Props;

  const [paperSize, setPaperSize] = useState('A4');
  const [printType, setPrintType] = useState('bw');
  const [printOrientation, setPrintOrientation] = useState('portrait'); // portrait or landscape
  const [pageLength, setPageLength] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState('0.00');
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);

  const safeAreaInsert = useSafeAreaInsets();

  const [pageImage, setPageImage] = useState<string | null>(null);
  const [allPageImages, setAllPageImages] = useState<any>([]);
  const [loading, setLoading] = useState(false);

  const [priceCombination, setPriceCombination] = useState<PrintPriceV2 | null>(
    null,
  );

  const [choosePaymentMethodModalVisible, setChoosePaymentMethodModalVisible] =
    useState(false);

  const [paperSpecs, setPaperSpecs] = useState({});
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [count, setCount] = useState(1);

  const {printPrice, printPriceV2} = useSelector(
    (state: RootState) => state.auth,
  );

  useEffect(() => {
    setIsPriceCalculating(true);
    const _combination = getPrintingCombination({
      printType: printType?.toLowerCase() == 'bw' ? 'bw' : 'color',
      paperSize: paperSize?.toLowerCase() == 'a3' ? 'a3' : 'a4',
    });
    const _combinationPrice = printPriceV2?.find(
      item => item.name === _combination,
    );
    setPriceCombination(_combinationPrice ?? null);

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
    if (loading) return;
    // setPageImage(null);
    // setCount(1);
    setIsPriceCalculating(false);
    setLoading(false);
    // setPageLength(1);
    const _data = {
      paperSize,
      printType,
      printOrientation,
      calculatedPrice,
      // numberOfCopies: count * pageLength, // previous value was count
      numberOfCopies: count,
      priceCombination: priceCombination ?? null,
      pageLength,
    };
    // onProceed(_data);
    setPaperSpecs(_data);
    // setPaperSize('A4');
    // setPrintType('bw');
    // setPrintOrientation('portrait');
    setChoosePaymentMethodModalVisible(true);
  };

  const handleOnCancel = () => {
    setPageImage(null);
    setCount(1);
    setIsPriceCalculating(false);
    setCalculatedPrice('0.00');
    setLoading(false);
    setPageLength(1);
    setPaperSize('A4');
    setPrintType('bw');
    setPrintOrientation('portrait');
    navigation.goBack();
  };

  const getPdfImage = async () => {
    console.log('getPdfImage');
    setPageImage(null);
    setAllPageImages(null);
    console.log('2 step getPdfImage');
    if (!uploadedDocumentType || uploadedDocumentType !== 'pdf') return;
    if (!uploadedDocumentResponse?.document_link) return;
    console.log('3 step getPdfImage');
    setLoading(true);
    const result = await downloadAndConvertPdfToImagesV3(
      uploadedDocumentResponse?.document_link,
    );
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

  const renderPreviewContainerv2 = () => {
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
                      // 🖤 Black & White version
                      <ColorMatrix
                        key={`all_page_${index}_bw`}
                        matrix={concatColorMatrices(
                          grayscale(),
                          contrast(1.1),
                        )}>
                        <View style={getImageContainerStyle()}>
                          <Image
                            source={{uri: item?.uri}}
                            style={getImageStyle()}
                          />
                        </View>
                        <Text
                          style={[
                            REGULAR_TEXT(8, '#7A7A7A'),
                            {textAlign: 'center', marginTop: 6},
                          ]}>{`Page no. ${index + 1}`}</Text>
                      </ColorMatrix>
                    ) : (
                      // 🌈 Normal color version
                      <ColorMatrix
                        key={`all_page_${index}_color`}
                        matrix={identityMatrix}>
                        <View style={getImageContainerStyle()}>
                          <Image
                            source={{uri: item?.uri}}
                            style={getImageStyle()}
                          />
                        </View>
                        <Text
                          style={[
                            REGULAR_TEXT(8, '#7A7A7A'),
                            {textAlign: 'center', marginTop: 6},
                          ]}>{`Page no. ${index + 1}`}</Text>
                      </ColorMatrix>
                    )}
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {uploadedDocumentType === 'image' && (
            <View
              key={`${
                uploadedDocumentResponse?.document_link
              }_${printType}_${Date.now()}`}
              style={{
                marginTop: 10,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {printType === 'bw' ? (
                // 🖤 Black & White filter
                <ColorMatrix
                  key={`all_page_bw`}
                  matrix={concatColorMatrices(grayscale(), contrast(1.1))}>
                  <View style={getImageContainerStyle()}>
                    <Image
                      source={{
                        uri: `${
                          uploadedDocumentResponse?.document_link
                        }?t=${Date.now()}&v=${printType}`,
                        cache: 'reload',
                      }}
                      style={getImageStyle()}
                    />
                  </View>
                </ColorMatrix>
              ) : (
                // 🌈 Normal color
                <ColorMatrix key={`all_page_color`} matrix={identityMatrix}>
                  <View style={getImageContainerStyle()}>
                    <Image
                      source={{
                        uri: `${
                          uploadedDocumentResponse?.document_link
                        }?t=${Date.now()}&v=${printType}`,
                        cache: 'reload',
                      }}
                      style={getImageStyle()}
                    />
                  </View>
                </ColorMatrix>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  //   const renderPreviewContainer = () => {
  //   if (loading) {
  //     return (
  //       <View style={styles.swiperContainer}>
  //         <ActivityIndicator size="large" color={COLORS.primary} />
  //         <Text
  //           style={[
  //             REGULAR_TEXT(12, COLORS.primary),
  //             { marginTop: 10, textAlign: 'center' },
  //           ]}>
  //           Preparing your preview...
  //         </Text>
  //         <Text
  //           style={[
  //             REGULAR_TEXT(12, COLORS.primary),
  //             { marginTop: 10, textAlign: 'center' },
  //           ]}>
  //           This may take a moment, especially for larger files. Thanks for your
  //           patience!
  //         </Text>
  //       </View>
  //     );
  //   }

  //   // 🧾 PDF file → show all pages
  //   if (allPageImages?.length > 0) {
  //     return (
  //       <View style={styles.swiperContainer}>
  //         <Text
  //           style={[
  //             REGULAR_TEXT(10, '#7A7A7A'),
  //             { textAlign: 'center', marginBottom: 8 },
  //           ]}>
  //           {`No. of pages: ${pageLength ?? allPageImages.length}`}
  //         </Text>

  //         <FlatList
  //           horizontal
  //           data={allPageImages}
  //           keyExtractor={(_, index) => index.toString()}
  //           showsHorizontalScrollIndicator={false}
  //           contentContainerStyle={{ paddingHorizontal: 8 }}
  //           renderItem={({ item, index }) => (
  //             <View
  //               style={{
  //                 marginHorizontal: 5,
  //                 justifyContent: 'center',
  //                 alignItems: 'center',
  //                 borderColor: '#E1EBFF',
  //                 borderWidth: 1,
  //                 borderRadius: 10,
  //                 padding: 10,
  //                 backgroundColor: '#FFF',
  //               }}>
  //               {printType === 'bw' ? (
  //                 <ColorMatrix
  //                   key={`page_bw_${index}_${Date.now()}`}
  //                   matrix={concatColorMatrices(grayscale(), contrast(1.1))}>
  //                   <View style={getImageContainerStyle()}>
  //                     <Image
  //                       key={`pdf_page_bw_${index}_${Date.now()}`}
  //                       source={{
  //                         uri: `${item?.uri}?bw=${Date.now()}`,
  //                         cache: 'reload',
  //                       }}
  //                       style={getImageStyle()}
  //                       resizeMode="contain"
  //                     />
  //                   </View>
  //                 </ColorMatrix>
  //               ) : (
  //                 <View style={getImageContainerStyle()}>
  //                   <Image
  //                     key={`pdf_page_color_${index}_${Date.now()}`}
  //                     source={{
  //                       uri: `${item?.uri}?color=${Date.now()}`,
  //                       cache: 'reload',
  //                     }}
  //                     style={getImageStyle()}
  //                     resizeMode="contain"
  //                   />
  //                 </View>
  //               )}
  //               <Text
  //                 style={[
  //                   REGULAR_TEXT(8, '#7A7A7A'),
  //                   { textAlign: 'center', marginTop: 6 },
  //                 ]}>{`Page ${index + 1}`}</Text>
  //             </View>
  //           )}
  //         />
  //       </View>
  //     );
  //   }

  //   // 🖼️ Single image preview (iOS-safe split render)
  //   if (
  //     uploadedDocumentType === 'image' &&
  //     uploadedDocumentResponse?.document_link
  //   ) {
  //     const imageUrl = uploadedDocumentResponse.document_link;
  //     const uniqueKey = `${imageUrl}_${printType}_${Date.now()}`;

  //     return (
  //       <View
  //         style={[
  //           styles.swiperContainer,
  //           { justifyContent: 'center', alignItems: 'center' },
  //         ]}>
  //         {printType === 'bw' ? (
  //           <ColorMatrix
  //             key={`img_bw_${uniqueKey}`}
  //             matrix={concatColorMatrices(grayscale(), contrast(1.1))}>
  //             <View style={getImageContainerStyle()}>
  //               <Image
  //                 key={`bw_${uniqueKey}`}
  //                 source={{
  //                   uri: `${imageUrl}?mode=bw&t=${Date.now()}`,
  //                   cache: 'reload',
  //                 }}
  //                 style={getImageStyle()}
  //                 resizeMode="contain"
  //               />
  //             </View>
  //           </ColorMatrix>
  //         ) : (
  //           <View style={getImageContainerStyle()}>
  //             <Image
  //               key={`color_${uniqueKey}`}
  //               source={{
  //                 uri: `${imageUrl}?mode=color&t=${Date.now()}`,
  //                 cache: 'reload',
  //               }}
  //               style={getImageStyle()}
  //               resizeMode="contain"
  //             />
  //           </View>
  //         )}
  //       </View>
  //     );
  //   }

  //   // ❌ Fallback
  //   return (
  //     <View style={styles.swiperContainer}>
  //       <Text
  //         style={[
  //           REGULAR_TEXT(12, '#7A7A7A'),
  //           { textAlign: 'center', marginTop: 20 },
  //         ]}>
  //         No preview available.
  //       </Text>
  //     </View>
  //   );
  // };

  // 🖤 BLACK & WHITE Preview
  const renderPreviewContainerBW = () => {
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

    // 🧾 PDF file
    if (allPageImages?.length > 0) {
      return (
        <View style={styles.swiperContainer}>
          <Text
            style={[
              REGULAR_TEXT(10, '#7A7A7A'),
              {textAlign: 'center', marginBottom: 8},
            ]}>
            {`No. of pages: ${pageLength ?? allPageImages.length}`}
          </Text>

          <FlatList
            horizontal
            data={allPageImages}
            keyExtractor={(_, index) => index.toString()}
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
                  key={`bw_pdf_${index}_${Date.now()}`}
                  matrix={concatColorMatrices(grayscale(), contrast(1.1))}>
                  <View style={getImageContainerStyle()}>
                    <Image
                      key={`bw_pdf_page_${index}_${Date.now()}`}
                      source={{
                        uri: `${item?.uri}?bw=${Date.now()}`,
                        cache: 'force-cache',
                      }}
                      style={getImageStyle()}
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

    // 🖼️ Image file
    if (
      uploadedDocumentType === 'image' &&
      uploadedDocumentResponse?.document_link
    ) {
      const imageUrl = uploadedDocumentResponse.document_link;
      return (
        <View
          style={[
            styles.swiperContainer,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <ColorMatrix
            key={`bw_image_${Date.now()}`}
            matrix={concatColorMatrices(grayscale(), contrast(1.1))}>
            <View style={getImageContainerStyle()}>
              <Image
                key={`bw_image_${Date.now()}`}
                source={{
                  uri: `${imageUrl}?bw=${Date.now()}`,
                  cache: 'force-cache',
                }}
                style={getImageStyle()}
                resizeMode="contain"
              />
            </View>
          </ColorMatrix>
        </View>
      );
    }

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

  // 🎨 COLOR Preview
  const renderPreviewContainerColor = () => {
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

    // 🧾 PDF file
    if (allPageImages?.length > 0) {
      return (
        <View style={styles.swiperContainer}>
          <Text
            style={[
              REGULAR_TEXT(10, '#7A7A7A'),
              {textAlign: 'center', marginBottom: 8},
            ]}>
            {`No. of pages: ${pageLength ?? allPageImages.length}`}
          </Text>

          <FlatList
            horizontal
            data={allPageImages}
            keyExtractor={(_, index) => index.toString()}
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
                <View style={getImageContainerStyle()}>
                  <Image
                    key={`color_pdf_${index}_${Date.now()}`}
                    source={{
                      uri: `${item?.uri}?color=${Date.now()}`,
                      cache: 'force-cache',
                    }}
                    style={getImageStyle()}
                    resizeMode="contain"
                  />
                </View>
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

    // 🖼️ Image file
    if (
      uploadedDocumentType === 'image' &&
      uploadedDocumentResponse?.document_link
    ) {
      const imageUrl = uploadedDocumentResponse.document_link;
      return (
        <View
          style={[
            styles.swiperContainer,
            {justifyContent: 'center', alignItems: 'center'},
          ]}>
          <View style={getImageContainerStyle()}>
            <Image
              key={`color_image_${Date.now()}`}
              source={{
                uri: `${imageUrl}?color=${Date.now()}`,
                cache: 'force-cache',
              }}
              style={getImageStyle()}
              resizeMode="contain"
            />
          </View>
        </View>
      );
    }

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

  return (
    <View style={{flex: 1}}>
      <TouchableWithoutFeedback onPress={() => {}}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.modalContainer]}>
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
              {/* {renderPreviewContainer()} */}
              {/* {printType === 'bw'
                ? renderPreviewContainerBW()
                : renderPreviewContainerColor()} */}

              <DocumentPreviewComponent
                loading={loading}
                allPageImages={allPageImages}
                uploadedDocumentType={uploadedDocumentType}
                uploadedDocumentResponse={uploadedDocumentResponse}
                printType={printType}
                pageLength={pageLength}
                getImageContainerStyle={getImageContainerStyle}
                getImageStyle={getImageStyle}
              />
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
                  <TouchableOpacity onPress={() => setPaperSize('A4')}>
                    <View style={styles.radioOption}>
                      <CustomRadioButton
                        value="A4"
                        label="A4"
                        status={paperSize === 'A4' ? 'checked' : 'unchecked'}
                        onPress={() => setPaperSize('A4')}
                        color={COLORS.bg2}
                      />
                      {/* <Text style={REGULAR_TEXT(12, COLORS.gray)}>A4</Text> */}
                    </View>
                  </TouchableOpacity>
                  {/* <TouchableOpacity onPress={() => setPaperSize('A3')}>
                    <View style={styles.radioOption}>
                      <CustomRadioButton
                        value="A3"
                        label="A3"
                        status={paperSize === 'A3' ? 'checked' : 'unchecked'}
                        onPress={() => setPaperSize('A3')}
                        color={COLORS.bg2}
                        // uncheckedColor={COLORS.gray}
                      />
                    </View>
                  </TouchableOpacity> */}
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
                      <CustomRadioButton
                        value="bw"
                        label="Black & White"
                        status={printType === 'bw' ? 'checked' : 'unchecked'}
                        onPress={() => setPrintType('bw')}
                        color={COLORS.bg2}
                      />
                      {/* <Text style={REGULAR_TEXT(12, COLORS.gray)}>
                        Black & White
                      </Text> */}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => setPrintType('color')}>
                    <View style={styles.radioOption}>
                      <CustomRadioButton
                        value="color"
                        label="Colored"
                        status={printType === 'color' ? 'checked' : 'unchecked'}
                        onPress={() => setPrintType('color')}
                        color={COLORS.bg2}
                      />
                      {/* <Text style={REGULAR_TEXT(12, COLORS.gray)}>Colored</Text> */}
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
                      <CustomRadioButton
                        value="landscape"
                        label="Landscape"
                        status={
                          printOrientation === 'landscape'
                            ? 'checked'
                            : 'unchecked'
                        }
                        onPress={() => setPrintOrientation('landscape')}
                        color={COLORS.bg2}
                      />
                      {/* <Text style={REGULAR_TEXT(12, COLORS.gray)}>
                        Landscape
                      </Text> */}
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setPrintOrientation('portrait')}>
                    <View style={styles.radioOption}>
                      <CustomRadioButton
                        value="portrait"
                        label="Portrait"
                        status={
                          printOrientation === 'portrait'
                            ? 'checked'
                            : 'unchecked'
                        }
                        onPress={() => setPrintOrientation('portrait')}
                        color={COLORS.bg2}
                      />
                      {/* <Text style={REGULAR_TEXT(12, COLORS.gray)}>
                        Portrait
                      </Text> */}
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
              {/* <CustomGradientButton
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
              /> */}

              <TouchableOpacity
                onPress={handleProceed}
                hitSlop={15}
                style={{
                  backgroundColor: COLORS.splashBackground,
                  paddingHorizontal: 30,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}>
                <Text style={[BOLD_TEXT(14, COLORS.white)]}>Payment</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Animated.View>
      <ChoosePaymentMethodModal
        visible={choosePaymentMethodModalVisible}
        onProceed={kioskData => {
          // setChoosePaymentMethodModalVisible(false);
          // setSuccessKioskCode(kioskData);
          // setSuccessModalVisible(true);
          // setUploadedDocumentResponse({});
          // getUploadedDocumentList();
          // getUserData();

          setChoosePaymentMethodModalVisible(false);
          dispatch(
            showSnackbar({
              message: 'Payment successful',
              type: SnackbarType.success,
              duration: 3000,
            }),
          );
          navigation.reset({
            index: 0,
            routes: [{name: 'RootBottomNavigation'} as never],
          });
        }}
        amount={100}
        paperSpecs={paperSpecs}
        uploadedDocumentResponse={uploadedDocumentResponse}
        onCancel={() => setChoosePaymentMethodModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.5)'},
  modalContainer: {
    // position: 'absolute',
    // bottom: 0,
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
