import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Platform,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
} from 'react-native';
import { emitChatsConversationsRefresh, emitChatConversationRead } from '../lib/appEvents';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { messageService } from '../lib/services/messages/messageService';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils';

const ChatScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const { conversation } = route.params || {};
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef(null);

  const currentUserId = user?.id;

  // iOS: height only for scroll sync. Android: keyboard height lifts composer (resize + explicit pad is stable in stack).
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (e) => {
      const h = e?.endCoordinates?.height ?? 0;
      if (Platform.OS === 'android') {
        setKeyboardHeight(Math.max(0, h));
      }
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    };
    const onHide = () => {
      if (Platform.OS === 'android') {
        setKeyboardHeight(0);
      }
      requestAnimationFrame(() => flatListRef.current?.scrollToEnd({ animated: true }));
    };

    const subShow = Keyboard.addListener(showEvent, onShow);
    const subHide = Keyboard.addListener(hideEvent, onHide);
    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  // Fetch messages
  const fetchMessages = async () => {
    if (!conversation?.conversationId || !currentUserId) return;

    emitChatConversationRead(conversation.conversationId);

    try {
      setLoading(true);
      const result = await messageService.getMessages(conversation.conversationId);
      if (result.success && result.data) {
        setMessages(result.data);
        // Mark messages as read when viewing conversation
        const readResult = await messageService.markAsRead(conversation.conversationId, currentUserId);
        if (readResult?.success) {
          emitChatsConversationsRefresh();
        } else if (__DEV__ && readResult?.error) {
          console.warn('markAsRead failed (check messages RLS for participants):', readResult.error);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load messages on mount
  useEffect(() => {
    fetchMessages();
  }, [conversation?.conversationId, currentUserId]);

  // Refresh messages when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (conversation?.conversationId) {
        fetchMessages();
      }
      return () => {
        const cid = conversation?.conversationId;
        const uid = currentUserId;
        if (cid && uid) {
          messageService.markAsRead(cid, uid).then((readResult) => {
            if (readResult?.success) emitChatsConversationsRefresh();
          });
        }
      };
    }, [conversation?.conversationId, currentUserId])
  );

  useEffect(() => {
    // Scroll to bottom when messages change
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim() || !conversation?.conversationId || !currentUserId || sending) return;

    try {
      setSending(true);
      const messageText = message.trim();
      setMessage(''); // Clear input immediately for better UX

      const result = await messageService.sendMessage(
        conversation.conversationId,
        currentUserId,
        messageText
      );

      if (result.success && result.data) {
        setMessages((prev) => [...prev, result.data]);
        Keyboard.dismiss();
      } else {
        // Restore message if send failed
        setMessage(messageText);
        console.error('Failed to send message:', result.error);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(message.trim()); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const msgTime = new Date(timestamp);
    const diff = now - msgTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return msgTime.toLocaleDateString();
  };

  const renderMessage = ({ item }) => {
    const isCurrentUser = item.senderId === currentUserId;

    return (
      <View
        style={[
          styles.messageContainer,
          isCurrentUser ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isCurrentUser ? colors.primary : colors.surface,
              borderColor: isCurrentUser ? colors.primary : colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isCurrentUser ? colors.textInverse : colors.text,
              },
            ]}
          >
            {item.text}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isCurrentUser ? colors.textInverse + '80' : colors.textTertiary,
              },
            ]}
          >
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  if (!conversation) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Chat" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            No conversation found
          </Text>
        </View>
      </View>
    );
  }

  const composerBottomPad =
    Platform.OS === 'android'
      ? (keyboardHeight > 0 ? keyboardHeight : Math.max(insets.bottom, 8))
      : Math.max(insets.bottom, 10);

  const chatBody = (
    <>
      {loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          style={styles.messagesFlex}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: composerBottomPad,
          },
        ]}
      >
        <TextInput
          style={[
            styles.messageInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textTertiary}
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor: message.trim() ? colors.primary : colors.textTertiary,
            },
          ]}
          onPress={handleSend}
          disabled={!message.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <Text style={[styles.sendButtonText, { color: colors.textInverse }]}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title={conversation.userName}
        subtitle={conversation.postTitle}
        onBack={() => navigation.goBack()}
      />

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView style={styles.keyboardAvoid} behavior="padding" keyboardVerticalOffset={0}>
          {chatBody}
        </KeyboardAvoidingView>
      ) : (
        <View style={styles.keyboardAvoid}>{chatBody}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  messagesFlex: {
    flex: 1,
  },
  messagesList: {
    flexGrow: 1,
    padding: space.md,
    paddingTop: space.md,
    paddingBottom: space.sm,
  },
  messageContainer: {
    marginBottom: 12,
  },
  messageLeft: {
    alignItems: 'flex-start',
  },
  messageRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: space.sm,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  messageInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.xl,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: 16,
  },
  sendButton: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radii.xl,
    ...shadowSoft,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default ChatScreen;

