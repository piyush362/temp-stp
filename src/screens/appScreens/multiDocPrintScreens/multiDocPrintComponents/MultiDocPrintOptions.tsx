/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../../theme/styles.global';
import {COLORS} from '../../../../theme/colors';
import CustomRadioButton from '../../../../components/buttons/CustomRadioButton';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {JSONOBJECTLOG, truncateString} from '../../../../utils/utils';
import DuplexInfoModal from '../../../../components/modals/DuplexInfoModal';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const {width} = Dimensions.get('window');

export default function MultiDocPrintOptions({
  documents,
  paperSize,
  setPaperSize,
  printType,
  setPrintType,
  printOrientation,
  setPrintOrientation,
  numberOfCopies,
  setNumberOfCopies,
  duplexType,
  setDuplexType,
}: any) {
  // ========= Counter Logic ========= //

  const [showDuplexInfo, setShowDuplexInfo] = useState(false);

  const calculateTotalPages = () => {
    let maxPages = 0;
    let documentName = '';
    for (let docs of documents) {
      // maxPages = Math.max(maxPages, docs.number_of_pages);
      if (docs.number_of_pages > maxPages) {
        maxPages = docs.number_of_pages;
        documentName = docs.document_name;
      }
    }
    return {maxPages, documentName};
  };
  const increment = () => {
    const {maxPages, documentName} = calculateTotalPages();
    const maxCopiesPage = maxPages * (numberOfCopies + 1);
    if (maxCopiesPage > 150) {
      Alert.alert(
        'Oops!',
        `Your "${truncateString(
          documentName,
          20,
        )}" document will exceed 150 pages. Please remove it or reduce the number of copies.`,
      );

      return;
    }
    // setNumberOfCopies((prev: number) => (prev < 10 ? prev + 1 : 10));
    setNumberOfCopies((prev: number) => prev + 1);
  };

  const decrement = () => {
    calculateTotalPages();
    setNumberOfCopies((prev: number) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <View style={styles.container}>
      {/* ===================== Number of Copies ===================== */}
      <View
        style={[
          styles.section,
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 5,
          },
        ]}>
        <Text
          style={[
            BOLD_TEXT(13, COLORS.gray),
            styles.subHeading,
            {width: '50%'},
          ]}>
          No. of Copies
        </Text>

        <View style={styles.counterContainer}>
          <TouchableOpacity onPress={decrement} style={styles.iconButton}>
            <MaterialIcons name="remove" size={20} color={COLORS.black} />
          </TouchableOpacity>

          <Text style={REGULAR_TEXT(14)}>{numberOfCopies}</Text>

          <TouchableOpacity onPress={increment} style={styles.iconButton}>
            <MaterialIcons name="add" size={20} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ===================== Paper Size ===================== */}
      <View style={styles.section}>
        <Text style={[REGULAR_TEXT(13, COLORS.black), styles.heading]}>
          Select Paper Size
        </Text>

        <View style={styles.radioGroup}>
          {/* Only A4 visible (same as your old UI) */}
          <TouchableOpacity onPress={() => setPaperSize('A4')}>
            <View style={styles.radioOption}>
              <CustomRadioButton
                value="A4"
                label="A4"
                status={paperSize === 'A4' ? 'checked' : 'unchecked'}
                onPress={() => setPaperSize('A4')}
                color={COLORS.bg2}
              />
            </View>
          </TouchableOpacity>

          {/* A3 hidden as in old UI */}

          {/* <TouchableOpacity onPress={() => setPaperSize('A3')}>
            <View style={styles.radioOption}>
              <CustomRadioButton
                value="A3"
                label="A3"
                status={paperSize === 'A3' ? 'checked' : 'unchecked'}
                onPress={() => setPaperSize('A3')}
                color={COLORS.bg2}
              />
            </View>
          </TouchableOpacity> */}
        </View>
      </View>

      {/* ===================== Print Type ===================== */}
      <View style={styles.section}>
        <Text style={[REGULAR_TEXT(13, COLORS.black), styles.heading]}>
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
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===================== Orientation ===================== */}
      <View style={styles.section}>
        <Text style={[REGULAR_TEXT(13, COLORS.black), styles.heading]}>
          Select Orientation
        </Text>

        <View style={styles.radioGroup}>
          <TouchableOpacity onPress={() => setPrintOrientation('landscape')}>
            <View style={styles.radioOption}>
              <CustomRadioButton
                value="landscape"
                label="Landscape"
                status={
                  printOrientation === 'landscape' ? 'checked' : 'unchecked'
                }
                onPress={() => setPrintOrientation('landscape')}
                color={COLORS.bg2}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setPrintOrientation('portrait')}>
            <View style={styles.radioOption}>
              <CustomRadioButton
                value="portrait"
                label="Portrait"
                status={
                  printOrientation === 'portrait' ? 'checked' : 'unchecked'
                }
                onPress={() => setPrintOrientation('portrait')}
                color={COLORS.bg2}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ===================== Duplex ===================== */}
      <View style={styles.section}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            marginBottom: 5,
            width: width * 0.9,
          }}>
          <Text style={[REGULAR_TEXT(13, COLORS.black), styles.heading]}>
            Select Duplex Type
          </Text>
          <TouchableOpacity
            hitSlop={10}
            style={{flexDirection: 'row', alignItems: 'center'}}
            onPress={() => setShowDuplexInfo(true)}>
            <MaterialCommunityIcons
              name="help-circle-outline"
              size={14}
              color="blue"
              style={{marginRight: 3}}
            />
            <Text
              style={[
                REGULAR_TEXT(12, 'blue'),
                {textDecorationLine: 'underline'},
              ]}>
              Know More
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.radioGroup}>
          <TouchableOpacity onPress={() => setDuplexType('singleSide')}>
            <View style={styles.radioOption}>
              <CustomRadioButton
                value="singleSide"
                label="Single Side"
                status={duplexType === 'singleSide' ? 'checked' : 'unchecked'}
                onPress={() => setDuplexType('singleSide')}
                color={COLORS.bg2}
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setDuplexType('doubleSide')}>
            <View style={styles.radioOption}>
              <CustomRadioButton
                value="doubleSide"
                label="Double Side"
                status={duplexType === 'doubleSide' ? 'checked' : 'unchecked'}
                onPress={() => setDuplexType('doubleSide')}
                color={COLORS.bg2}
              />
            </View>
          </TouchableOpacity>
        </View>
        <DuplexInfoModal
          isVisible={showDuplexInfo}
          onClose={() => setShowDuplexInfo(false)}
        />
      </View>
    </View>
  );
}

// =======================================================
//                       STYLES
// =======================================================

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },

  section: {
    marginBottom: 10,
  },

  subHeading: {
    marginBottom: 5,
  },

  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },

  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },

  heading: {
    marginBottom: 0,
  },

  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 30,
  },

  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
