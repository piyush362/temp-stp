/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import RBSheet from 'react-native-raw-bottom-sheet';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {COLORS, primaryGradient} from '../../../theme/colors';
import LinearGradient from 'react-native-linear-gradient';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import {ICONS} from '../../../theme/icons';
// import Icon from 'react-native-vector-icons/Ionicons'

interface Props {
  bottomSheetRef: any;
  onAddMoney: (amount: number) => void;
}

export default function AddMoneyBottomSheet({
  bottomSheetRef,
  onAddMoney,
}: Props) {
  const [amount, setAmount] = useState('');
  const predefinedAmounts = [100, 200, 300];

  const handleAmountSelect = (value: number) => {
    setAmount(value.toString());
  };

  const handleAddMoney = () => {
    if (!amount || isNaN(Number(amount))) {
      return;
    }
    // Handle money addition here
    // bottomSheetRef.current?.close();
    onAddMoney(Number(amount));
  };

  return (
    <RBSheet
      ref={bottomSheetRef}
      closeOnPressMask={true}
      height={300}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        container: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          backgroundColor: COLORS.mainBg,
        },
      }}>
      <Text style={[BOLD_TEXT(16), styles.heading]}>Add Money</Text>

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
              onPress={() => setAmount(value.toString())}>
              <View style={styles.amountButtonInner}>
                <Text style={styles.amountText}>{`₹${value}`}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  heading: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2D0C57',
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
  selectedAmount: {
    // Optional: additional styling if selected
  },
  amountGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  amountButtonInner: {
    backgroundColor: '#f2f2f2', // light gray background
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
