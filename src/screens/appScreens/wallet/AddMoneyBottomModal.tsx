/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from 'react-native';
import React, {useState} from 'react';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {COLORS, primaryGradient} from '../../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import {ICONS} from '../../../theme/icons';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

interface Props {
  isVisible: boolean;
  onAddMoney: (amount: number) => void;
  onClose: () => void;
}

export default function AddMoneyBottomModal({
  isVisible,
  onAddMoney,
  onClose,
}: Props) {
  const [amount, setAmount] = useState('');
  const predefinedAmounts = [100, 200, 300];
  const [error, setError] = useState('');

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleAddMoney = () => {
    if (!amount || isNaN(Number(amount))) {
      return;
    }
    onAddMoney(Number(amount));
  };

  const handleOnClose = () => {
    setAmount('');
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleOnClose}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.modalWrapper}
        enableOnAndroid={true}
        extraScrollHeight={100}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={[BOLD_TEXT(16), styles.heading]}>Add Money</Text>
            <TouchableOpacity
              hitSlop={10}
              onPress={handleOnClose}
              style={styles.closeButton}>
              <Text>Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={REGULAR_TEXT(14)}>Enter amount in rupees</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                placeholder="Enter amount in rupees"
                placeholderTextColor="#999"
              />

              <TouchableOpacity onPress={handleAddMoney}>
                <LinearGradient
                  style={styles.arrowButton}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  colors={primaryGradient}>
                  <Image
                    source={ICONS.arrowLeft}
                    style={{
                      width: 20,
                      height: 20,
                      objectFit: 'contain',
                      tintColor: COLORS.white,
                      alignSelf: 'center',
                    }}
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.predefinedAmounts}>
              {predefinedAmounts.map(value => (
                <TouchableOpacity
                  key={value}
                  style={styles.amountButton}
                  onPress={() => handleAmountSelect(value)}>
                  <View style={styles.amountButtonInner}>
                    <Text style={styles.amountText}>{`₹${value}`}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalWrapper: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.mainBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
  },
  heading: {
    color: '#2D0C57',
  },
  closeButton: {
    padding: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000',
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderColor: COLORS.offGray,
    borderWidth: 1,
  },
  arrowButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  predefinedAmounts: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  amountButton: {
    borderRadius: 10,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 5,
  },
  selectedAmount: {},
  amountGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  amountButtonInner: {
    backgroundColor: '#f2f2f2',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
});
