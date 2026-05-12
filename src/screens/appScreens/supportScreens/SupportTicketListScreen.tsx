import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../../../theme/colors';
import {REGULAR_TEXT, BOLD_TEXT} from '../../../theme/styles.global';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {ScreenWrapper} from '../../../components/wrapper';
import {getAllSupportTicketListService} from '../../../service/supportService';
import {getErrorMessage} from '../../../utils/utils';
import {useDispatch} from 'react-redux';
import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import moment from 'moment';

export default function SupportTicketListScreen({navigation}: any) {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      setIsLoading(true);

      const response = await getAllSupportTicketListService();
      const raw = response?.data?.data || [];

      setTickets(raw);
    } catch (error) {
      const msg = getErrorMessage(error);
      dispatch(showSnackbar({message: msg, type: SnackbarType.error}));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenWrapper
        headerComponent={<HeaderNavigation label="Support Tickets" />}>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" color={COLORS.bg2} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label="Support Tickets" />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{padding: 15}}>
        {tickets.map(item => (
          <SupportTicketCard
            key={item.id}
            item={item}
            onPress={() =>
              navigation.navigate('SupportChatScreen', {
                ticketId: item.id,
                status: item.status,
              })
            }
          />
        ))}
      </ScrollView>
    </ScreenWrapper>
  );
}

/* -----------------------------------------
    CARD COMPONENT (same file)
------------------------------------------ */
function SupportTicketCard({item, onPress}: any) {
  const renderStatus = (status: string) => {
    const isOpen = status === 'open';

    return (
      <View
        style={[
          styles.statusBadge,
          {backgroundColor: isOpen ? '#e1f5e6' : '#f6e6e6'},
        ]}>
        <Text style={REGULAR_TEXT(10, isOpen ? '#1b8f47' : '#ba1f1f')}>
          {status}
        </Text>
      </View>
    );
  };

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card} onPress={onPress}>
      {/* Ticket No + Status */}
      <View style={styles.row}>
        <View>
          <Text style={REGULAR_TEXT(11, COLORS.gray)}>Ticket No</Text>
          <Text style={REGULAR_TEXT(12, COLORS.black)}>
            {item.support_ticket_no}
          </Text>
        </View>
        {renderStatus(item.status)}
      </View>

      {/* Subject */}
      {/* <View style={{marginTop: 10}}>
        <Text style={REGULAR_TEXT(11, COLORS.gray)}>Subject</Text>
        <Text style={BOLD_TEXT(13, COLORS.black)}>{item.name}</Text>
      </View> */}

      {/* Message */}
      <View style={{marginTop: 10}}>
        <Text style={REGULAR_TEXT(11, COLORS.gray)}>Message</Text>
        <Text
          style={[REGULAR_TEXT(12, COLORS.black), {marginTop: 2}]}
          numberOfLines={1}>
          {item.message}
        </Text>
      </View>

      {/* Admin replied */}
      {item.admin_replied_at && (
        <View style={{marginTop: 10}}>
          <Text style={REGULAR_TEXT(11, COLORS.gray)}>Admin Replied</Text>
          <View style={{flexDirection: 'row', marginTop: 2}}>
            <Icon
              name="reply"
              size={14}
              color={COLORS.gray}
              style={{marginRight: 4}}
            />
            <Text style={REGULAR_TEXT(11, COLORS.black)}>
              {item.admin_replied_at}
            </Text>
          </View>
        </View>
      )}

      {/* Created At */}
      <View style={{marginTop: 10}}>
        <Text style={REGULAR_TEXT(11, COLORS.gray)}>Created At</Text>
        <View style={{flexDirection: 'row', marginTop: 2}}>
          <Icon
            name="calendar"
            size={14}
            color={COLORS.gray}
            style={{marginRight: 4}}
          />
          <Text style={REGULAR_TEXT(11, COLORS.black)}>
            {moment(item.created_at).format('DD-MMM-YYYY || hh:mm A')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

/* -----------------------------------------
    STYLES
------------------------------------------ */

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
});
