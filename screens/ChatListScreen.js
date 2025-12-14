import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { chatService } from '../lib/services/chats/chatService';
import { messageService } from '../lib/services/messages/messageService';

const ChatListScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Get parent navigator (StackNavigator) to navigate to Chat screen
  const parentNavigation = navigation.getParent();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await chatService.getUserConversations(user.id);
      if (result.success && result.data) {
        setConversations(result.data);
      } else {
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh conversations
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  };

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [user?.id]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchConversations();
    }, [user?.id])
  );

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
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Chats</Text>
        <View style={styles.headerSpacer} />
      </View>

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
          <Text style={styles.emptyIcon}>💬</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 26,
  },
  conversationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
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

