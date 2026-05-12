import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {COLORS} from '../../../theme/colors';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  getSupportCategoryListService,
  getSupportQuestionsByCategoryIdService,
  getSupportSubQuestionsByParentIdService,
  getSupportQuestionDetailsService,
  createSupportTicketService,
  getSupportTicketByDocumentService,
} from '../../../service/supportService';
import {getErrorMessage, getErrors, JSONOBJECTLOG} from '../../../utils/utils';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';
import {showSnackbar} from '../../../redux/slices/snackbar.slice';
import {SnackbarType} from '../../../types/common.types';
import FullScreenLoader from '../../../components/modals/FullScreenLoader';

// getSupportTicketByDocumentService ( documentId: number )
export default function DocSupportScreen({navigation}: any) {
  const [messages, setMessages] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [subQuestions, setSubQuestions] = useState<any[]>([]);

  const safeAreaInsert = useSafeAreaInsets();
  const route = useRoute();
  const dispatch = useDispatch();
  // const navigation = useNavigation();
  const {userData} = useSelector((state: RootState) => state.auth);

  const {documentId} = route.params || ({} as any);

  const [currentStage, setCurrentStage] = useState<
    'category' | 'questions' | 'sub' | 'answer' | 'custom'
  >('category');

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customText, setCustomText] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  // Global loader (non-overlay)
  const [isLoading, setIsLoading] = useState(false);
  const [isDocStatusChecking, setIsDocStatusChecking] = useState(false);

  // ticket
  const [isTicketAlreadyExists, setIsTicketAlreadyExists] = useState(false);
  const [existingTicketId, setExistingTicketId] = useState<any>(null);
  const [existingTicketData, setExistingTicketData] = useState<any>(null);

  // -----------------------------------------------------
  // REAL API WRAPPERS
  // -----------------------------------------------------

  const getDocTicketStatus = async () => {
    try {
      setIsDocStatusChecking(true);
      const res = await getSupportTicketByDocumentService(documentId);
      const parseData = res?.data?.data;
      if (Array.isArray(parseData)) {
        const ticketId = parseData[0]?.id;
        const ticket = parseData[0];
        const status = parseData[0]?.status;
        if (ticketId) {
          dispatch(
            showSnackbar({
              message: 'Ticket already exists',
              type: SnackbarType.success,
            }),
          );
          setIsTicketAlreadyExists(true);
          setExistingTicketId(ticketId);
          setExistingTicketData(ticket);

          //  navigation.navigate({
          //   name: 'SupportChatScreen',
          //   params: {
          //     ticketId: ticketId,
          //   },
          // } as never);
        }
      }
      return res?.data?.status;
    } catch (e) {
      console.log('getDocTicketStatus error:', e);
      return '';
    } finally {
      setIsDocStatusChecking(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getSupportCategoryListService();
      return res?.data?.map((c: any) => ({
        id: c.category_id,
        name: c.category_name,
      }));
    } catch (e) {
      console.log('fetchCategories error:', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionsByCategory = async (categoryId: number) => {
    try {
      setIsLoading(true);
      const res = await getSupportQuestionsByCategoryIdService(categoryId);
      return res?.data?.map((q: any) => ({
        id: q.question_id,
        title: q.question_text,
        hasSub: q.has_sub_questions,
      }));
    } catch (e) {
      console.log('fetchQuestionsByCategory error:', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSubQuestions = async (parentId: number) => {
    try {
      setIsLoading(true);
      const res = await getSupportSubQuestionsByParentIdService(parentId);
      return res?.data?.map((q: any) => ({
        id: q.question_id,
        title: q.question_text,
        hasSub: q.has_sub_questions,
      }));
    } catch (e) {
      console.log('fetchSubQuestions error:', e);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnswer = async (questionId: number) => {
    try {
      setIsLoading(true);
      const res = await getSupportQuestionDetailsService(questionId);
      return {
        answer:
          res?.data?.solutions?.[0]?.resolution ||
          res?.data?.solutions?.[0]?.answer_text ||
          'No solution found.',
      };
    } catch (e) {
      console.log('fetchAnswer error:', e);
      return {answer: 'No solution found.'};
    } finally {
      setIsLoading(false);
    }
  };

  const raiseRequest = async (messageText: string) => {
    try {
      setIsLoading(true);

      const payload = {
        document_id: documentId,
        name: userData?.user_name ?? 'User',
        email: userData?.email_id ?? 'User email',
        phone_number: `${userData?.phone_number ?? '000000000'}`,
        message: messageText,
      };
      const res = await createSupportTicketService(payload);
      dispatch(
        showSnackbar({message: res?.message, type: SnackbarType.success}),
      );
      navigation.reset({
        index: 0,
        routes: [
          {name: 'RootBottomNavigation' as never},
          {name: 'SupportTicketListScreen' as never},
        ],
      });
      return res;
    } catch (e) {
      const message = getErrorMessage(e);
      const error = getErrors(e);
      dispatch(showSnackbar({message: message, type: SnackbarType.error}));
      console.log('raiseRequest error:', error);
      // navigation.goBack();

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // -----------------------------------------------------
  // INITIAL LOAD
  // -----------------------------------------------------
  useEffect(() => {
    (async () => {
      getDocTicketStatus();
      const list = await fetchCategories();
      setCategories(list);

      setMessages([
        {
          id: Date.now(),
          type: 'bot',
          text: 'Hi! How can I help you today? Please choose a category below.',
        },
      ]);
    })();
  }, []);

  const resetChat = async () => {
    const list = await fetchCategories();
    setCategories(list);

    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        text: 'Hi! How can I help you today? Please choose a category below.',
      },
    ]);

    setQuestions([]);
    setSubQuestions([]);

    setCurrentStage('category');
    setShowCustomInput(false);
    setCustomText('');
  };

  const renderExistingTicketCard = () => {
    if (!isTicketAlreadyExists) return null;

    return (
      <View style={styles.wrapper}>
        <View style={styles.card}>
          <View style={styles.textContainer}>
            <Text style={styles.titleText}>
              A ticket already exists for this document.
            </Text>
            <Text style={styles.subText}>
              You can continue your conversation with support below.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() =>
              navigation.navigate({
                name: 'SupportChatScreen',
                params: {
                  ticketId: existingTicketId,
                },
              } as never)
            }
            style={styles.button}>
            <Text style={styles.buttonText}>Go to Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // -----------------------------------------------------
  // CHAT MESSAGE RENDER
  // -----------------------------------------------------
  const renderMessage = (item: any) => {
    const isUser = item.type === 'user';
    return (
      <View
        key={item.id}
        style={[
          styles.messageRow,
          {justifyContent: isUser ? 'flex-end' : 'flex-start'},
        ]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Icon name="face-agent" size={20} color={COLORS.white} />
          </View>
        )}

        <View
          style={[
            styles.bubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}>
          <Text
            style={[
              REGULAR_TEXT(13, isUser ? COLORS.white : COLORS.black),
              {lineHeight: 22},
            ]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // -----------------------------------------------------
  // OPTIONS LIST
  // -----------------------------------------------------
  const renderOptions = () => {
    if (currentStage === 'category') return renderCategoryOptions();
    if (currentStage === 'questions') return renderQuestionOptions();
    if (currentStage === 'sub') return renderSubQuestionOptions();
    if (currentStage === 'custom') return renderCustomInput();
    return null;
  };

  // -----------------------------------------------------
  // CATEGORY LIST
  // -----------------------------------------------------
  const renderCategoryOptions = () => (
    <View style={styles.optionContainer}>
      <Text style={[styles.sectionTitle, REGULAR_TEXT(12, COLORS.gray)]}>
        Select a Category
      </Text>

      {categories.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.optionButton}
          activeOpacity={0.7}
          onPress={() => handleCategorySelected(item)}
          disabled={isLoading}>
          <Text style={BOLD_TEXT(12, COLORS.black)}>{item.name}</Text>
          <Icon name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      ))}

      {/* custom input */}
      <TouchableOpacity
        style={[styles.optionButton, {marginTop: 6}]}
        onPress={() => {
          setShowCustomInput(true);
          setCurrentStage('custom');
          setMessages(prev => [
            ...prev,
            {
              id: Date.now(),
              type: 'user',
              text: 'None of these — I want to type my issue',
            },
          ]);
        }}
        disabled={isLoading}>
        <Text style={REGULAR_TEXT(12, COLORS.black)}>
          Not listed? Describe your issue
        </Text>
        <Icon name="pencil" size={18} color={COLORS.gray} />
      </TouchableOpacity>
    </View>
  );

  // -----------------------------------------------------
  // QUESTIONS
  // -----------------------------------------------------
  const renderQuestionOptions = () => (
    <View style={styles.optionContainer}>
      <Text style={[styles.sectionTitle, REGULAR_TEXT(12, COLORS.gray)]}>
        Common Questions
      </Text>

      {questions.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.optionButton}
          onPress={() => handleQuestionSelected(item)}
          disabled={isLoading}>
          <Text style={REGULAR_TEXT(12, COLORS.black)}>{item.title}</Text>
          <Icon name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      ))}

      {renderCustomOption()}
    </View>
  );

  // -----------------------------------------------------
  // SUB QUESTIONS
  // -----------------------------------------------------
  const renderSubQuestionOptions = () => (
    <View style={styles.optionContainer}>
      <Text style={[styles.sectionTitle, REGULAR_TEXT(12, COLORS.gray)]}>
        Specifics
      </Text>

      {subQuestions.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.optionButton}
          onPress={() => handleSubQuestionSelected(item)}
          disabled={isLoading}>
          <Text style={REGULAR_TEXT(12, COLORS.black)}>{item.title}</Text>
          <Icon name="chevron-right" size={20} color={COLORS.gray} />
        </TouchableOpacity>
      ))}

      {renderCustomOption()}
    </View>
  );

  const renderCustomOption = () => (
    <TouchableOpacity
      style={[styles.optionButton, {marginTop: 6}]}
      onPress={() => {
        setShowCustomInput(true);
        setCurrentStage('custom');
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            type: 'user',
            text: 'None of these — I want to type my issue',
          },
        ]);
      }}
      disabled={isLoading}>
      <Text style={REGULAR_TEXT(12, COLORS.black)}>
        Not listed? Describe your issue
      </Text>
      <Icon name="pencil" size={18} color={COLORS.gray} />
    </TouchableOpacity>
  );

  // -----------------------------------------------------
  // CUSTOM INPUT
  // -----------------------------------------------------
  const renderCustomInput = () => {
    if (!showCustomInput) return null;

    return (
      <View style={[styles.optionContainer, {paddingBottom: 20}]}>
        <Text style={[styles.sectionTitle, REGULAR_TEXT(12, COLORS.gray)]}>
          Describe your issue
        </Text>

        <TextInput
          value={customText}
          onChangeText={setCustomText}
          placeholder="Type your issue here..."
          multiline
          numberOfLines={4}
          style={styles.textInput}
          editable={!isSubmittingCustom && !isLoading}
        />

        <View style={{flexDirection: 'row', marginTop: 10}}>
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.optionButton,
              {flex: 1, marginRight: 8, justifyContent: 'center'},
            ]}
            onPress={async () => {
              if (!customText.trim() || isSubmittingCustom) return;

              setIsSubmittingCustom(true);

              setMessages(prev => [
                ...prev,
                {id: Date.now(), type: 'user', text: customText.trim()},
              ]);

              await raiseRequest(customText.trim());

              setMessages(prev => [
                ...prev,
                {
                  id: Date.now() + 1,
                  type: 'bot',
                  text: 'Thanks — your request has been raised. Our team will get back to you shortly.',
                },
              ]);

              setIsSubmittingCustom(false);
              setShowCustomInput(false);
              setCustomText('');
              setCurrentStage('answer');
            }}>
            {isSubmittingCustom ? (
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <ActivityIndicator size="small" color={COLORS.darkBlue} />
                <Text style={[BOLD_TEXT(12, COLORS.darkBlue), {marginLeft: 8}]}>
                  Submitting...
                </Text>
              </View>
            ) : (
              <Text style={BOLD_TEXT(12, COLORS.darkBlue)}>Submit Request</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.optionButton, {flex: 1, justifyContent: 'center'}]}
            onPress={() => {
              if (isSubmittingCustom) return;
              setShowCustomInput(false);
              setCustomText('');
              setCurrentStage('category');
            }}>
            <Text style={BOLD_TEXT(12, COLORS.black)}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // -----------------------------------------------------
  // EVENT HANDLERS (FIXED)
  // -----------------------------------------------------
  const handleCategorySelected = async (item: any) => {
    setMessages(prev => [
      ...prev,
      {id: Date.now(), type: 'user', text: item.name},
    ]);

    const q = await fetchQuestionsByCategory(item.id);
    setQuestions(q);

    setMessages(prev => [
      ...prev,
      {
        id: Date.now() + 1,
        type: 'bot',
        text: `Great choice! What issue are you facing with "${item.name}"?`,
      },
    ]);

    setCurrentStage('questions');
  };

  const handleQuestionSelected = async (item: any) => {
    setMessages(prev => [
      ...prev,
      {id: Date.now(), type: 'user', text: item.title},
    ]);

    if (item.hasSub) {
      const sq = await fetchSubQuestions(item.id);
      setSubQuestions(sq);

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          type: 'bot',
          text: 'Thanks! Please select one of the related topics.',
        },
      ]);

      setCurrentStage('sub');
    } else {
      const ans = await fetchAnswer(item.id);

      // If no solution found → open custom input
      if (!ans.answer || ans.answer === 'No solution found.') {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            text: 'Sorry, we could not find a solution. Please describe your issue.',
          },
        ]);
        setShowCustomInput(true);
        setCurrentStage('custom');
        return;
      }

      // Normal flow
      setMessages(prev => [
        ...prev,
        {id: Date.now() + 1, type: 'bot', text: ans.answer},
      ]);

      setCurrentStage('answer');
    }
  };

  const handleSubQuestionSelected = async (item: any) => {
    setMessages(prev => [
      ...prev,
      {id: Date.now(), type: 'user', text: item.title},
    ]);

    if (item.hasSub) {
      const more = await fetchSubQuestions(item.id);
      setSubQuestions(more);

      setMessages(prev => [
        ...prev,
        {id: Date.now() + 1, type: 'bot', text: 'Please choose one option.'},
      ]);

      setCurrentStage('sub');
    } else {
      const ans = await fetchAnswer(item.id);

      // If no solution found → open custom input
      if (!ans.answer || ans.answer === 'No solution found.') {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            text: 'Sorry, no solution is available. Please describe your issue.',
          },
        ]);
        setShowCustomInput(true);
        setCurrentStage('custom');
        return;
      }

      // Normal flow
      setMessages(prev => [
        ...prev,
        {id: Date.now() + 1, type: 'bot', text: ans.answer},
      ]);

      setCurrentStage('answer');
    }
  };

  // -----------------------------------------------------
  // RESET CHAT
  // -----------------------------------------------------
  const renderResetChat = () => (
    <TouchableOpacity
      onPress={resetChat}
      activeOpacity={0.7}
      style={styles.resetContainer}>
      <Icon name="refresh" size={18} color={COLORS.darkBlue} />
      <Text style={[BOLD_TEXT(14, COLORS.darkBlue), {marginLeft: 6}]}>
        Start Over
      </Text>
    </TouchableOpacity>
  );

  // small, non-overlay loader at top
  const renderTopLoader = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.topLoader}>
        <ActivityIndicator size="small" color={COLORS.darkBlue} />
        <Text style={[REGULAR_TEXT(11, COLORS.darkBlue), {marginLeft: 8}]}>
          Loading...
        </Text>
      </View>
    );
  };

  // -----------------------------------------------------
  // MAIN RENDER
  // -----------------------------------------------------
  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label="Document Support" />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: safeAreaInsert.bottom + 20,
          paddingTop: 10,
        }}>
        {renderExistingTicketCard()}
        {renderTopLoader()}
        {messages.map(msg => renderMessage(msg))}
        {renderOptions()}
        {messages.length > 1 && renderResetChat()}
      </ScrollView>
      <FullScreenLoader visible={isDocStatusChecking} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingHorizontal: 16,
    alignItems: 'flex-end',
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.darkBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  botBubble: {
    backgroundColor: '#e4e4fcff',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: COLORS.darkBlue,
    borderBottomRightRadius: 4,
  },
  optionContainer: {
    paddingHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionTitle: {
    marginBottom: 10,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderRadius: 12,
  },
  resetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 10,
    opacity: 0.8,
  },
  textInput: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 80,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  topLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  wrapper: {
    justifyContent: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#FEFCE8', // yellow-50
    borderLeftWidth: 4,
    borderLeftColor: '#FACC15', // yellow-400
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  textContainer: {
    marginBottom: 12,
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#854D0E', // yellow-800
  },
  subText: {
    fontSize: 10,
    color: '#A16207', // yellow-700
    marginTop: 4,
  },
  button: {
    backgroundColor: '#FACC15', // yellow-400
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: '#78350F', // yellow-900
    fontWeight: '700',
    fontSize: 12,
  },
});
