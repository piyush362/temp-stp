import React from 'react';
import {View, Text, Image, StyleSheet, ActivityIndicator} from 'react-native';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {ICONS} from '../../../theme/icons';
import {COLORS} from '../../../theme/colors';

type TransactionItem = {
  uuid_recode_trunction: string;
  user_payment_type: 'credit' | 'debit';
  all_charges_included_amount: number;
  payment_method: string;
  recode_trunction_created_at: string;
};

type Props = {
  transactions: TransactionItem[];
  isLoading?: boolean;
};

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'

  return `${day} ${month} ${year} ${hours}:${minutes} ${ampm}`;
};

const TransactionListContainer = ({transactions = [], isLoading}: Props) => {
  return (
    <View style={styles.transactionContainer}>
      <View style={styles.transactionHeader}>
        <Text style={BOLD_TEXT(15)}>Transaction History</Text>
      </View>

      {isLoading && (
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            height: 100,
          }}>
          <ActivityIndicator color={'#000'} size={'small'} />
        </View>
      )}
      {transactions.length > 0 ? (
        transactions.map((item, index) => (
          <View
            key={item.uuid_recode_trunction || index}
            style={styles.transactionItem}>
            <View style={styles.transactionIcon}>
              <Image
                source={ICONS.transaction}
                style={{width: '90%', height: 40, resizeMode: 'contain'}}
              />
            </View>

            {/* LEFT SECTION */}
            <View style={{width: '50%'}}>
              <Text style={[REGULAR_TEXT(13)]}>
                {item.user_payment_type === 'credit'
                  ? 'Balance Credit'
                  : 'Balance Debit'}
              </Text>
              <Text style={[REGULAR_TEXT(11, COLORS.gray)]}>
                {item.payment_method}
              </Text>
            </View>

            {/* RIGHT SECTION */}
            <View style={styles.mapButton}>
              <View
                style={{
                  paddingHorizontal: 5,
                  paddingVertical: 3,
                  backgroundColor:
                    item.user_payment_type === 'credit'
                      ? 'rgba(31, 217, 72, 0.25)'
                      : 'rgba(255, 1, 1, 0.25)',
                  borderRadius: 30,
                  alignItems: 'center',
                }}>
                <Text
                  style={[
                    BOLD_TEXT(14),
                    {
                      color:
                        item.user_payment_type === 'credit'
                          ? 'rgba(31, 217, 72, 1)'
                          : 'rgba(255, 1, 1, 1)',
                      textAlign: 'center',
                    },
                  ]}>
                  ₹{item.all_charges_included_amount}
                </Text>
              </View>
              <Text
                style={[REGULAR_TEXT(12, COLORS.gray), {textAlign: 'right'}]}>
                {formatDateTime(item.recode_trunction_created_at)}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text
          style={[
            REGULAR_TEXT(13, COLORS.gray),
            {textAlign: 'center', marginTop: 10},
          ]}>
          {isLoading ? '' : 'No transactions found'}
        </Text>
      )}
    </View>
  );
};

export default TransactionListContainer;

const styles = StyleSheet.create({
  transactionContainer: {
    marginTop: 20,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: '15%',
  },
  mapButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '30%',
    gap: 3,
  },
});
