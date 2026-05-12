import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import MultiDocPreviewCarousel from './multiDocPrintComponents/MultiDocPreviewCarousel';
import MultiDocPrintOptions from './multiDocPrintComponents/MultiDocPrintOptions';
import MultiDocPriceSummary from './multiDocPrintComponents/MultiDocPriceSummary';
import {
  calculatePrintPriceV2,
  getPrintingCombination,
} from '../../../utils/pdftoimage';
import {PrintPriceV2} from '../../../redux/slices/auth.slice';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {getFileTypeFromUrl} from '../../../utils/uploadDocUtils';
import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import ChooseMultiPaymentMethodModal from '../../../components/bottomSheet/ChooseMultiPaymentMethodModal';
import {JSONOBJECTLOG} from '../../../utils/utils';

export default function MultiDocPrintSpecScreen() {
  const route: any = useRoute();
  const navigation: any = useNavigation();
  const dispatch = useDispatch();
  const safe = useSafeAreaInsets();

  const [documents, setDocuments] = useState<any[]>([]);
  const [paperSize, setPaperSize] = useState('A4'); // A4 or A5
  const [printType, setPrintType] = useState('bw'); // bw or color
  const [numberOfCopies, setNumberOfCopies] = useState(1);
  const [printOrientation, setPrintOrientation] = useState('portrait'); // portrait or landscape
  const [duplexType, setDuplexType] = useState<'singleSide' | 'doubleSide'>("singleSide"); 

  const [calculatedPrice, setCalculatedPrice] = useState('0.00');
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);
  const [priceCombination, setPriceCombination] = useState<PrintPriceV2 | null>(
    null,
  );
  const [choosePaymentMethodModalVisible, setChoosePaymentMethodModalVisible] =
    useState(false);
  const [count, setCount] = useState(1);
  const [pageLength, setPageLength] = useState(1);

  const {uploadedDocumentResponse} = route.params ?? {};

  const {printPrice, printPriceV2} = useSelector(
    (state: RootState) => state.auth,
  );

  // ⚡ Add the first uploaded document when screen opens
  // useEffect(() => {
  //   if (uploadedDocumentResponse) {
  //     const docData = uploadedDocumentResponse;
  //     const processFileType = getFileTypeFromUrl(docData.document_link);
  //     const doc = {
  //       id: Date.now().toString(), // required for FlatList key
  //       ...docData, // ⬅️ this includes ALL the API fields
  //       uri: docData.preview_link, // for preview card
  //       fileName: docData.document_name || 'document',
  //       fileType: docData.file_type,
  //       processFileType: processFileType,
  //       number_of_pages: docData.number_of_copies,
  //     };
  //     setDocuments([doc]);
  //   }
  // }, []);

  useEffect(() => {
    if (uploadedDocumentResponse && Array.isArray(uploadedDocumentResponse)) {
      const formattedDocs = uploadedDocumentResponse.map((docData: any) => {
        const processFileType = getFileTypeFromUrl(docData.document_link);

        return {
          id: Date.now().toString() + Math.random(), // unique
          ...docData,
          uri: docData.preview_link,
          fileName: docData.document_name || 'document',
          fileType: docData.file_type,
          processFileType,
          number_of_pages: docData.number_of_copies,
        };
      });

      setDocuments(formattedDocs); // 👈 SET ALL DOCS AT ONCE
    }
  }, [uploadedDocumentResponse]);

  // Recalculate price on any change
  useEffect(() => {
    recalculateTotalPrice();
  }, [documents, printType, paperSize, printOrientation, numberOfCopies]);

  const recalculateTotalPrice = () => {
    if (!documents || documents.length === 0) {
      setCalculatedPrice('0.00');
      return;
    }

    let total = 0;

    // Get BW/COLOR + A4/A3 price combination
    const combinationName = getPrintingCombination({
      printType: printType.toLowerCase() === 'bw' ? 'bw' : 'color',
      paperSize: paperSize.toLowerCase() === 'a3' ? 'a3' : 'a4',
    });

    const combinationPrice = printPriceV2?.find(
      p => p.name === combinationName,
    );

    setPriceCombination(combinationPrice ?? null);

    // Loop documents
    documents.forEach(doc => {
      const pages = doc.number_of_pages ?? 1;

      const docCost = calculatePrintPriceV2({
        printCombinationPrice: combinationPrice ?? null,
        numberOfCopies: numberOfCopies,
        numberOfPages: pages,
      });

      total += Number(docCost);
    });

    setCalculatedPrice(Number(total).toFixed(2));
  };

  // ADD NEW DOCUMENT
  const handleAddDocument = (doc: any) => {
        setDocuments(prev => [...prev, doc]);
  };

  // REMOVE DOCUMENT
  const handleRemoveDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // FLATLIST DATA
  const carouselData = [
    ...documents,
    // {id: 'add', type: 'add-btn', uri: '', fileName: '', fileType: ''},
  ];

  return (
    <View style={{flex: 1, backgroundColor: '#F5F1FE'}}>
      {/* HEADER */}
      <View style={[styles.header, {paddingTop: safe.top}]}>
        <TouchableOpacity hitSlop={15} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={26} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Print Documents</Text>

        <View />
      </View>
      <ScrollView style={styles.container}>
        {/* PREVIEW CAROUSEL */}
        <MultiDocPreviewCarousel
          data={carouselData}
          onAdd={handleAddDocument}
          onRemove={handleRemoveDocument}
          colorType={printType}
          orientation={printOrientation}
          setIsPriceCalculating={setIsPriceCalculating}
        />

        {/* OPTIONS */}
        <MultiDocPrintOptions
          documents={documents}
          paperSize={paperSize}
          setPaperSize={setPaperSize}
          printType={printType}
          setPrintType={setPrintType}
          printOrientation={printOrientation}
          setPrintOrientation={setPrintOrientation}
          numberOfCopies={numberOfCopies}
          setNumberOfCopies={setNumberOfCopies}
          duplexType={duplexType}
          setDuplexType={setDuplexType}
        />

        <View style={{height: 50}} />
      </ScrollView>

      {/* SUMMARY */}
      <MultiDocPriceSummary
        total={calculatedPrice}
        isPriceCalculating={isPriceCalculating}
        onProceed={() => {
          // console.log('documents');
          // JSONOBJECTLOG(documents);
          setChoosePaymentMethodModalVisible(true);
        }}
      />

      <ChooseMultiPaymentMethodModal
        visible={choosePaymentMethodModalVisible}
        onProceed={() => {
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
        priceCombination={priceCombination}
        documents={documents}
        printOrientation={printOrientation}
        numberOfCopies={numberOfCopies}
        totalPrice={calculatedPrice}
        duplexType={duplexType}
        onCancel={() => setChoosePaymentMethodModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    padding: 10,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 10,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  processBtn: {
    marginTop: 20,
    backgroundColor: '#4f2e2c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  processText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
