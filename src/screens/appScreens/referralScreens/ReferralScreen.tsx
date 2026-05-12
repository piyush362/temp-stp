import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {COLORS} from '../../../theme/colors';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {
  getAccessTokenFromAsyncStorage,
  handleReferralCodeShare,
  JSONOBJECTLOG,
} from '../../../utils/utils';
import axios from 'axios';
import {BASEURL} from '../../../../app.env';
import moment from 'moment';
import FullScreenLoader from '../../../components/modals/FullScreenLoader';

const getReferralHistoryService = async () => {
  const accessToken = await getAccessTokenFromAsyncStorage();
  const response = await axios({
    method: 'GET',
    headers: {
      'x-access-token': accessToken,
    },
    url: `${BASEURL}/api/auth/referral/referral-history-list`,
  });
  return response.data;
};

export default function ReferralScreen() {
  const [referralCode, setReferralCode] = useState('');
  const [referralTransactions, setReferralTransactions] = useState<any[]>([]);
  const [coinsAvailable, setCoinsAvailable] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {userData} = useSelector((state: RootState) => state.auth);

  const getReferralHistory = async () => {
    try {
      setIsLoading(true);
      const response = await getReferralHistoryService();
      JSONOBJECTLOG(response);

      if (response?.success && response?.data) {
        setCoinsAvailable(response.data.CoinsAvailable || 0);
        setReferralTransactions(response.data.referralHistory || []);
      }
    } catch (error) {
      console.log('Referral history error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getReferralHistory();
    if (userData?.referral_code) {
      setReferralCode(userData?.referral_code);
    }
  }, []);

  // 🔹 Referral Card
  const renderReferralCard = () => {
    return (
      <View style={styles.cardContainer}>
        {/* Header Row: Earned Coins */}
        <View style={styles.coinsRow}>
          <View>
            <Text style={BOLD_TEXT(18, COLORS.darkBlue)}>Your Earnings</Text>
            <Text style={REGULAR_TEXT(14, COLORS.gray)}>Referral Rewards</Text>
          </View>
          <View style={styles.coinBox}>
            <Text style={BOLD_TEXT(20, COLORS.bg2)}>{coinsAvailable}</Text>
            <Text style={REGULAR_TEXT(12, COLORS.gray)}>Coins Earned</Text>
          </View>
        </View>

        {/* Referral Code */}
        <View style={styles.codeContainer}>
          <Text style={BOLD_TEXT(16, COLORS.gray)}>Your Referral Code</Text>
          <Text style={[BOLD_TEXT(22, COLORS.bg2), {marginTop: 6}]}>
            {referralCode || '--'}
          </Text>
        </View>

        {/* Info Text */}
        <Text style={[REGULAR_TEXT(14, COLORS.gray), {marginTop: 8}]}>
          Share this code with your friends and earn exciting rewards when they
          join using your code!
        </Text>

        {/* Share Button */}
        <TouchableOpacity
          onPress={() => {
            if (referralCode) handleReferralCodeShare(referralCode);
          }}
          style={styles.shareButton}>
          <Text style={BOLD_TEXT(14, COLORS.white)}>Share Code</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // 🔹 Referral Transaction Item
  const renderReferralItem = (item: any, index: number) => {
    const formattedDate = moment(item.created_at).format('DD MMM YYYY');
    const coinDisplay =
      item.payment_type === 'credit' ? `+${item.coin}` : `-${item.coin}`;
    const coinColor = item.payment_type === 'credit' ? 'green' : 'red';

    return (
      <View key={index} style={styles.transactionItem}>
        <View>
          <Text style={BOLD_TEXT(14, COLORS.darkBlue)}>
            {item.reason === 'referred' ? 'Referral Reward' : item.reason}
          </Text>
          <Text style={REGULAR_TEXT(12, COLORS.gray)}>{formattedDate}</Text>
        </View>
        <Text style={[BOLD_TEXT(14, coinColor)]}>{coinDisplay}</Text>
      </View>
    );
  };

  // 🔹 Referral List
  const renderReferralList = () => {
    return (
      <View style={styles.transactionList}>
        <Text style={BOLD_TEXT(16, COLORS.darkBlue)}>
          Referral Transactions
        </Text>

        {isLoading ? (
          <ActivityIndicator
            size="small"
            color={COLORS.bg2}
            style={{marginTop: 20}}
          />
        ) : referralTransactions.length > 0 ? (
          referralTransactions.map((item, index) =>
            renderReferralItem(item, index),
          )
        ) : (
          <Text
            style={[
              REGULAR_TEXT(14, COLORS.gray),
              {marginTop: 20, textAlign: 'center'},
            ]}>
            No referral transactions yet.
          </Text>
        )}
      </View>
    );
  };

  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label="Referral Rewards" />}>
      <View style={{paddingHorizontal: 16}}>
        {renderReferralCard()}
        {renderReferralList()}
      </View>
      <FullScreenLoader visible={isLoading} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    padding: 16,
    borderColor: '#cbdaf8ff',
    borderWidth: 1,
  },
  coinsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinBox: {
    alignItems: 'center',
    backgroundColor: '#f4f6ff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d8e2ff',
  },
  codeContainer: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.bg2,
    paddingVertical: 10,
    alignItems: 'center',
  },
  shareButton: {
    marginTop: 16,
    backgroundColor: COLORS.bg2,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  transactionList: {
    marginTop: 20,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e3e8f2',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: '#e1e4ee',
  },
});
