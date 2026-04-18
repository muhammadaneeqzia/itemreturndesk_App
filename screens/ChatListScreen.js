import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { chatService } from '../lib/services/chats/chatService';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';
import { CHATS_CONVERSATIONS_REFRESH, CHATS_CONVERSATION_READ } from '../lib/appEvents';

const ChatListScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Get parent navigator (StackNavigator) to navigate to Chat screen
  const parentNavigation = navigation.getParent();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  /** Threads user just opened — server refetch can briefly return stale unread; keep badge 0 for a short window. */
  const recentlyReadRef = useRef(new Map());

  const mergeWithRecentReads = useCallback((list) => {
    const now = Date.now();
    const ttlMs = 12000;
    for (const [id, t] of [...recentlyReadRef.current.entries()]) {
      if (now - t > ttlMs) recentlyReadRef.current.delete(id);
    }
    return (list || []).map((c) => {
      const id = c.conversationId || c.id;
      const t = recentlyReadRef.current.get(id);
      if (t != null && now - t < ttlMs && (c.unreadCount || 0) > 0) {
        return { ...c, unreadCount: 0 };
      }
      return c;
    });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await chatService.getUserConversations(user.id);
      if (result.success && result.data) {
        setConversations(mergeWithRecentReads(result.data));
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, mergeWithRecentReads]);

  // Refresh conversations
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [fetchConversations])
  );

  // Refetch when a chat marks messages read (stack push can skip tab focus refetch)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(CHATS_CONVERSATIONS_REFRESH, () => {
      fetchConversations();
    });
    return () => sub.remove();
  }, [fetchConversations]);

  // Clear row + tab badge immediately when user opens a thread (DB refetch follows via refresh event)
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(CHATS_CONVERSATION_READ, (payload) => {
      const conversationId = payload?.conversationId;
      if (!conversationId) return;
      recentlyReadRef.current.set(conversationId, Date.now());
      setConversations((prev) =>
        prev.map((c) => {
          const id = c.conversationId || c.id;
          if (id === conversationId) return { ...c, unreadCount: 0 };
          return c;
        })
      );
    });
    return () => sub.remove();
  }, []);

  // Calculate total unread messages
  const totalUnreadMessages = conversations.reduce((total, conv) => total + (conv.unreadCount || 0), 0);

  // Update tab badge when conversations change
  useEffect(() => {
    navigation.setOptions({
      tabBarBadge: totalUnreadMessages > 0 ? totalUnreadMessages : undefined,
    });
  }, [totalUnreadMessages, navigation]);

  const handleConversationPress = (conversation) => {
    // Format conversation object for ChatScreen
    // chatService already returns properly formatted data, but ensure all required fields
    const conversationData = {
      conversationId: conversation.conversationId || conversation.id,
      userId: conversation.userId || conversation.other_user_id,
      userName: conversation.userName || 'User',
      userAvatar: conversation.userAvatar || null,
      postTitle: conversation.postTitle || conversation.post_title || '',
      postType: conversation.postType || conversation.post_type || '',
      postId: conversation.postId || conversation.post_id || null,
    };
    
    // Navigate to Chat screen using parent navigator (StackNavigator)
    // This ensures we navigate to the Stack screen, not the Tab screen
    if (parentNavigation) {
      parentNavigation.navigate('Chat', { conversation: conversationData });
    } else {
      // Fallback to regular navigation
      navigation.navigate('Chat', { conversation: conversationData });
    }
  };

  const renderConversationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.conversationCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => handleConversationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
        {item.userAvatar ? (
          <Image source={{ uri: item.userAvatar }} style={styles.avatar} />
        ) : (
          <Text style={[styles.avatarText, { color: colors.textInverse }]}>
            {item.userName.charAt(0).toUpperCase()}
          </Text>
        )}
        {item.unreadCount > 0 && (
          <View style={[styles.unreadBadge, { backgroundColor: colors.error }]}>
            <Text style={[styles.unreadText, { color: colors.textInverse }]}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.conversationInfo}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.userName, { color: colors.text }]} numberOfLines={1}>
            {item.userName}
          </Text>
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>{item.lastMessageTime}</Text>
        </View>
        <Text style={[styles.postTitle, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.postType}: {item.postTitle}
        </Text>
        <Text style={[styles.lastMessage, { color: colors.textSecondary }]} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader variant="tab" title="My Chats" />

      {/* Conversations List */}
      {loading && conversations.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : conversations.length > 0 ? (
        <FlatList
          data={conversations}
          renderItem={renderConversationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AppIcon name="chatbubblesOutline" size={52} color={colors.textTertiary} style={{ marginBottom: 16 }} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No messages yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Start a conversation from a post
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: space.md,
    paddingTop: space.lg,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.sm,
    ...shadowSoft,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  unreadText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    marginLeft: 8,
  },
  postTitle: {
    fontSize: 13,
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default ChatListScreen;

