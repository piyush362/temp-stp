import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view';
import moment from 'moment';
import {useDispatch} from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {COLORS} from '../../../theme/colors';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';

import {
  getSupportChatMessagesViaTicketIdService,
  createSupportTicketMessageReplyService,
} from '../../../service/supportService';

import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import {
  getErrorMessage,
  getMediaType,
  JSONOBJECTLOG,
} from '../../../utils/utils';

export default function SupportChatScreen() {
  const route = useRoute<any>();
  const {ticketId} = route.params || {};

  const listRef = useRef<any>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [chats, setChats] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ticketStatus, setTicketStatus] = useState('');

  const statusColorMap: any = {
    open: '#FFA500',
    in_progress: '#1E90FF',
    resolved: '#28A745',
    closed: '#6c757d',
  };

  const statusColor = statusColorMap[ticketStatus] || '#999';

  /* ---------------------------
        LOAD CHAT MESSAGES
  ----------------------------*/
  const fetchChats = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const response = await getSupportChatMessagesViaTicketIdService(ticketId);
      const ticketStatus = response?.data?.ticket_status;
      setTicketStatus(ticketStatus);
      const messages = response?.data?.messages;
      setChats(Array.isArray(messages) ? messages : []);
    } catch (error) {
      dispatch(
        showSnackbar({
          message: getErrorMessage(error),
          type: SnackbarType.error,
        }),
      );
    } finally {
      isRefresh ? setRefreshing(false) : setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd?.({animated: true}), 300);
    }
  };

  /* ---------------------------
       SEND MESSAGE (Optimistic)
  ----------------------------*/
  const handleSend = async () => {
    if (!message.trim() || sending) return;

    const text = message.trim();
    setMessage('');

    // Optimistic message
    const tempMessage = {
      id: Date.now(),
      sender: 'user',
      message_text: text,
      created_at: new Date().toISOString(),
      _temp: true,
    };

    setChats(prev => [...prev, tempMessage]);

    setSending(true);

    try {
      const response = await createSupportTicketMessageReplyService({
        ticket_id: ticketId,
        message_text: text,
      });

      const realMsg = response?.data;

      if (realMsg) {
        // Replace temp message with real one
        setChats(prev =>
          prev.map(m =>
            m.id === tempMessage.id
              ? {...realMsg, created_at: new Date().toISOString()}
              : m,
          ),
        );
      } else {
        throw new Error('No response');
      }
    } catch (error) {
      // Remove optimistic message
      JSONOBJECTLOG(error);
      setChats(prev => prev.filter(m => m.id !== tempMessage.id));

      dispatch(
        showSnackbar({
          message: getErrorMessage(error),
          type: SnackbarType.error,
        }),
      );
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({animated: true}), 200);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [ticketId]);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => {
      setTimeout(() => {
        listRef.current?.scrollToEnd({animated: true});
      }, 120);
    });

    return () => showSub.remove();
  }, []);

  /* ---------------------------
       RENDER CHAT BUBBLE
  ----------------------------*/
  const renderItem = ({item}: {item: any}) => {
    const isMember = item.sender === 'user';
    const mediaType = getMediaType(item.media);

    const handleMediaPress = () => {
      if (mediaType === 'video') {
        navigation.navigate({
          name: 'VideoPlayerScreen',
          params: {
            videoUrl: item.media,
          },
        } as never);
      }
    };

    return (
      <View
        style={[
          styles.messageContainer,
          isMember ? styles.rightAlign : styles.leftAlign,
        ]}>
        <View
          style={[
            styles.bubble,
            isMember ? styles.memberBubble : styles.adminBubble,
          ]}>
          {!isMember && (
            <Text style={styles.flagText}>{item.sender.toUpperCase()}</Text>
          )}

          {/* TEXT MESSAGE */}
          {item.message_text?.length > 0 && (
            <Text
              style={REGULAR_TEXT(12, isMember ? COLORS.white : COLORS.black)}>
              {item.message_text}
            </Text>
          )}

          {/* MEDIA HANDLING */}
          {item.media && mediaType && (
            <TouchableOpacity
              activeOpacity={mediaType === 'video' ? 0.8 : 1}
              onPress={mediaType === 'video' ? handleMediaPress : undefined}
              style={{marginTop: 8}}>
              {mediaType === 'image' ? (
                <Image
                  source={{uri: item.media}}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: 10,
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: 200,
                    height: 200,
                    backgroundColor: '#000',
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon name="play-circle-outline" size={55} color="#fff" />
                  <Text
                    style={{
                      marginTop: 4,
                      ...REGULAR_TEXT(12, '#fff'),
                    }}>
                    Tap to play video
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* TIME */}
          <Text
            style={[
              styles.time,
              {color: isMember ? COLORS.white : COLORS.black},
            ]}>
            {moment(item.created_at).format('DD/MMM/YYYY - hh:mm A')}
          </Text>

          {item._temp && (
            <Text style={{fontSize: 9, color: '#eee', marginTop: 4}}>
              Sending...
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <HeaderNavigation label="Support Ticket" />

      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <View style={[styles.statusChip, {backgroundColor: statusColor}]}>
          <Text style={styles.statusText}>{ticketStatus}</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{flex: 1}}>
            {loading ? (
              <ActivityIndicator
                size="large"
                color={COLORS.darkBlue}
                style={{marginTop: 20}}
              />
            ) : (
              <KeyboardAwareFlatList
                ref={listRef}
                data={chats}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{padding: 12, paddingBottom: 20}}
                refreshing={refreshing}
                onRefresh={() => fetchChats(true)}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={REGULAR_TEXT(14, '#888')}>
                      No messages yet. Start the conversation!
                    </Text>
                  </View>
                }
              />
            )}

            {(ticketStatus === 'open' || ticketStatus === 'in_progress') &&
              !loading && (
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type your message..."
                    placeholderTextColor="#888"
                    value={message}
                    onChangeText={setMessage}
                    returnKeyType="send"
                    onSubmitEditing={handleSend}
                    editable={!sending}
                  />
                  <TouchableOpacity
                    style={[styles.sendBtn, sending && {opacity: 0.6}]}
                    onPress={handleSend}
                    disabled={sending}>
                    {sending ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={BOLD_TEXT(14, '#FFF')}>Send</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

            {(ticketStatus === 'resolved' || ticketStatus === 'closed') && (
              <View style={styles.inputRow}>
                <Text style={BOLD_TEXT(14, '#888')}>
                  Ticket is {ticketStatus.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: COLORS.mainBg},
  messageContainer: {flexDirection: 'row', marginVertical: 6},
  leftAlign: {justifyContent: 'flex-start'},
  rightAlign: {justifyContent: 'flex-end'},
  bubble: {
    maxWidth: '75%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  flagText: {
    ...BOLD_TEXT(10, 'white'),
    marginBottom: 4,
    backgroundColor: 'rgba(22,24,67,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    borderRadius: 6,
  },
  adminBubble: {backgroundColor: '#e4e4fcff'},
  memberBubble: {backgroundColor: COLORS.darkBlue},
  time: {
    ...REGULAR_TEXT(9, '#ccc'),
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#e4e4fcff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: '#000',
  },
  sendBtn: {
    backgroundColor: COLORS.darkBlue,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 8,
  },
  statusLabel: {
    ...BOLD_TEXT(12, '#666'),
    marginRight: 8,
  },
  statusChip: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  statusText: {
    ...BOLD_TEXT(11, '#FFF'),
    textTransform: 'capitalize',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
});
