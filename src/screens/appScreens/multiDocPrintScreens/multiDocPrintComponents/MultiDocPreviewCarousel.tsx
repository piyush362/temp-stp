/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';

import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  uploadDocumentService,
  uploadDocumentServiceV2,
} from '../../../../service/authService';
import {
  getFileTypeFromUrl,
  handleGenericDocumentPicker,
  handleGenericMultiDocumentPicker,
} from '../../../../utils/uploadDocUtils';
import {COLORS} from '../../../../theme/colors';

import {Grayscale} from 'react-native-color-matrix-image-filters';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../../theme/styles.global';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../../../redux/slices/snackbar.slice';
import ProgressModal from '../../../../components/modals/ProgressModal';
import {
  getErrorMessage,
  getErrors,
  JSONOBJECTLOG,
} from '../../../../utils/utils';
import {SnackbarType} from '../../../../types/common.types';
import {MultiProgressModal} from '../../../../components/modals/MultiProgressModal';

const {width: screenWidth} = Dimensions.get('window');

interface Props {
  data: any;
  onAdd: any;
  onRemove: any;
  orientation: string;
  colorType: string;
  setIsPriceCalculating: (value: boolean) => void;
}

export default function MultiDocPreviewCarousel({
  data,
  onAdd,
  onRemove,
  orientation,
  colorType,
  setIsPriceCalculating,
}: Props) {
  const [adding, setAdding] = useState(false);
  const dispatch = useDispatch();
  const listRef = useRef<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);

  const [currentFile, setCurrentFile] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [isFileProcessing, setIsFileProcessing] = useState(false);

  // =====================================================
  //  ORIENTATION – IMAGE CONTAINER
  // =====================================================
  const getImageContainerStyle = () => {
    if (orientation === 'portrait') {
      return {
        width: screenWidth * 0.55,
        height: 290 as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        borderColor: '#ebebebff',
        borderWidth: 1,
      };
    } else {
      return {
        width: screenWidth * 0.75,
        height: 290 as const,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        borderColor: '#ebebebff',
        borderWidth: 1,
      };
    }
  };

  const getImageStyle = () => {
    const base = {
      width: '100%' as const,
      height: '100%' as const,
      resizeMode: 'contain' as const,
    };

    if (orientation === 'landscape') {
      return {
        ...base,
        transform: [{rotate: '90deg'}],
      };
    }

    return base;
  };

  // =====================================================
  //  CARD WIDTH ONLY (height is fixed)
  // =====================================================
  const getCardWidth = () => {
    if (orientation === 'portrait') {
      return screenWidth * 0.6; // ~220–240px
    }
    return screenWidth * 0.85; // wider for landscape image
  };

  const cardWidth = getCardWidth();
  const imageContainerStyle = getImageContainerStyle();
  const imageStyle = getImageStyle();

  const handleRemove = (item: any) => {
    if (data?.length === 1) {
      dispatch(showSnackbar({message: 'At least one document is required'}));
      Alert.alert(
        'Opps!',
        'At least one document is required, Can not remove 1st document',
      );
      return;
    }
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        {
          text: 'Cancel',
          onPress: () => {},
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => onRemove(item.id),
        },
      ],
    );
  };

  // =====================================================
  //  UPLOAD NEW FILE
  // =====================================================
  // const pickAndAddDocument = async () => {
  //   try {
  //     setAdding(true);
  //     setIsPriceCalculating(true);

  //     const result = await handleGenericDocumentPicker();
  //     if (!result) return;

  //     const {formData, fileName} = result;
  //     formData.append('document_name', fileName);

  //     setShowProgress(true);
  //     setUploadProgress(0); // reset progress

  //     const response = await uploadDocumentService(formData, progress => {
  //       setUploadProgress(progress);
  //     });
  //     const docData = response?.data;

  //     const newDoc = {
  //       id: Date.now().toString(),
  //       ...docData,
  //       uri: docData.preview_link,
  //       fileName: docData.document_name || 'document',
  //       fileType: docData.file_type,
  //       processFileType: getFileTypeFromUrl(docData.document_link),
  //       number_of_pages: docData.number_of_copies,
  //     };

  //     onAdd(newDoc);
  //   } catch (error) {
  //     console.log('Picker Error', error);
  //     const message = getErrorMessage(error);
  //     dispatch(showSnackbar({message, type: SnackbarType.error}));
  //     Alert.alert('Opps!', message);
  //   } finally {
  //     setAdding(false);
  //     setIsPriceCalculating(false);
  //     setShowProgress(false);
  //   }
  // };

  const pickAndAddDocument = async () => {
    try {
      setAdding(true);
      setIsPriceCalculating(true);

      const pickedFiles = await handleGenericMultiDocumentPicker();
      if (!pickedFiles || pickedFiles.length === 0) {
        setAdding(false);
        setIsPriceCalculating(false);
        return;
      }

      // SETUP UI
      setTotalFiles(pickedFiles.length);
      setCurrentFile(1);
      setShowProgress(true);
      setUploadProgress(0);
      setIsFileProcessing(true);

      // LOOP UPLOAD
      for (let i = 0; i < pickedFiles.length; i++) {
        const {formData, fileName} = pickedFiles[i];
        formData.append('document_name', fileName);

        // console.log('formData 2.0');
        // JSONOBJECTLOG(formData);

        try {
          const response = await uploadDocumentServiceV2(
            formData,
            (progress: number) => setUploadProgress(progress),
          );

          const docData = response?.data;

          const newDoc = {
            id: Date.now().toString(),
            ...docData,
            uri: docData.preview_link,
            fileName: docData.document_name || fileName,
            fileType: docData.file_type,
            processFileType: getFileTypeFromUrl(docData.document_link),
            number_of_pages: docData.number_of_copies,
          };

          onAdd(newDoc);
        } catch (err) {
          const error = getErrors(err);
          JSONOBJECTLOG(error);
          Alert.alert(`Upload failed for ${fileName}: ${getErrorMessage(err)}`);
        }

        // Move to next file
        setCurrentFile(prev => prev + 1);
        setUploadProgress(0);
      }

      // DONE
      setShowProgress(false);
      setAdding(false);
      setIsPriceCalculating(false);
      setIsFileProcessing(false);
    } catch (err) {
      console.error(err);
      setAdding(false);
      setIsPriceCalculating(false);
      setShowProgress(false);
      setIsFileProcessing(false);
    }
  };

  const renderContainerHeader = () => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '98%',
          marginBottom: 10,
        }}>
        <View style={{width: '70%'}}>
          <Text
            style={[
              REGULAR_TEXT(12, COLORS.gray),
            ]}>{`Total Selected Files: ${data.length}`}</Text>
          {adding ? (
            <Text
              style={[
                REGULAR_TEXT(11, 'green'),
              ]}>{`Your files are being processed...`}</Text>
          ) : (
            <Text style={[REGULAR_TEXT(11, 'green')]}>
              You can select multiple files on add files
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={pickAndAddDocument}
          disabled={adding}
          hitSlop={10}
          style={{
            backgroundColor: COLORS.bg2,
            paddingHorizontal: 15,
            paddingVertical: 5,
            borderRadius: 10,
          }}>
          <Text style={[BOLD_TEXT(12, 'white')]}>+ Add Files</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // =====================================================
  //  RENDER ADD BUTTON
  // =====================================================
  const renderAddCard = () => (
    <TouchableOpacity
      style={[styles.addPage, {width: cardWidth}]}
      onPress={pickAndAddDocument}
      disabled={adding}
      activeOpacity={0.8}>
      {adding ? (
        <ActivityIndicator size="small" color="#4f2e2c" />
      ) : (
        <>
          <Icon name="plus" size={40} color="#4f2e2c" />
          <Text style={{color: '#4f2e2c', marginTop: 6}}>Add File</Text>
        </>
      )}
    </TouchableOpacity>
  );

  // =====================================================
  //  RENDER IMAGE WITH B/W FILTER
  // =====================================================
  const renderImageWithFilter = (
    previewLink: string,
    bwPreviewLink: string,
  ) => {
    if (colorType === 'bw') {
      return (
        <Grayscale>
          <View style={imageContainerStyle}>
            <Image source={{uri: bwPreviewLink}} style={imageStyle} />
          </View>
        </Grayscale>
      );
    }

    return (
      <View style={imageContainerStyle}>
        <Image source={{uri: previewLink}} style={imageStyle} />
      </View>
    );
  };

  // =====================================================
  //  RENDER PDF
  // =====================================================
  const renderPdfPreview = (item: any) => {
    const default_preview_link = item?.preview_link;
    const bw_preview_link = item?.preview_link_bw ?? default_preview_link;
    // if (item.preview_link) return renderImageWithFilter(item.preview_link);
    if (default_preview_link)
      return renderImageWithFilter(default_preview_link, bw_preview_link);

    return (
      <View
        style={[
          imageContainerStyle,
          {alignItems: 'center', justifyContent: 'center'},
        ]}>
        <Icon name="file-pdf-box" size={60} color="#b00" />
        <Text style={{fontSize: 12}}>PDF Preview Not Available</Text>
      </View>
    );
  };

  // =====================================================
  //  RENDER SINGLE CARD
  // =====================================================
  const renderCard = (item: any) => {
    const isPdf = item.fileType === 'pdf';

    return (
      <View style={[styles.cardWrapper, {width: cardWidth}]}>
        <TouchableOpacity
          style={styles.removeBtn}
          onPress={() => {
            handleRemove(item);
          }}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Icon name="close" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={styles.card}>
          {isPdf
            ? renderPdfPreview(item)
            : renderImageWithFilter(
                item.preview_link,
                item.preview_link_bw ?? item.preview_link,
              )}

          <Text numberOfLines={1} lineBreakMode="tail" style={styles.nameText}>
            {`${getFileTypeFromUrl(item.document_link)}: ${item.fileName} `}
          </Text>

          <Text numberOfLines={1} style={REGULAR_TEXT(10)}>
            {`No of Page: ${item.number_of_pages ?? 1}`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.outerContainer}>
      {renderContainerHeader()}
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        renderItem={({item}) =>
          item.type === 'add-btn' ? renderAddCard() : renderCard(item)
        }
        keyExtractor={item => item.id}
        showsHorizontalScrollIndicator={false}
      />
      {/* <ProgressModal
        visible={showProgress}
        progress={uploadProgress}
        onCancel={() => setShowProgress(false)}
        onComplete={() => {
          setShowProgress(false);
          setUploadProgress(0);
        }}
      /> */}
      <MultiProgressModal
        visible={showProgress}
        currentFile={currentFile}
        totalFiles={totalFiles}
        progress={uploadProgress}
        onCancel={() => setShowProgress(false)}
      />
    </View>
  );
}

// =====================================================
//                      STYLES
// =====================================================

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
  },

  cardWrapper: {
    height: 350, // FIXED HEIGHT 🚀
    marginRight: 12,
    position: 'relative',
  },

  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 50,
    backgroundColor: 'rgba(255,0,0,0.9)',
    padding: 5,
    borderRadius: 50,
  },

  card: {
    flex: 1,
    backgroundColor: '#f6f6f6',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },

  addPage: {
    height: 350, // FIXED HEIGHT 🚀
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#4f2e2c',
    backgroundColor: '#fff',
    borderRadius: 12,
  },

  nameText: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
    width: '90%',
  },
});
