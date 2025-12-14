import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { notificationService } from '../lib/services/notifications/notificationService';
import { chatService } from '../lib/services/chats/chatService';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return '💬';
      case 'match':
        return '🔍';
      case 'claim':
        return '✅';
      case 'contact':
        return '📞';
      case 'admin':
        return '🛡️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'message':
        return colors.primary;
      case 'match':
        return colors.success;
      case 'claim':
        return colors.success;
      case 'contact':
        return colors.warning;
      case 'admin':
        return colors.accent;
      default:
        return colors.textTertiary;
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const result = await notificationService.getNotifications(user.id);
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [user?.id]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      
      // Update tab badge with unread count
      if (user?.id) {
        notificationService.getUnreadCount(user.id).then((result) => {
          if (result.success) {
            navigation.setOptions({
              tabBarBadge: result.count > 0 ? result.count : undefined,
            });
          }
        });
      }
    }, [user?.id, navigation])
  );

  // Update tab badge when notifications change
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    navigation.setOptions({
      tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
    });
  }, [notifications, navigation]);

  const handleNotificationPress = async (notification) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      const result = await notificationService.markAsRead(notification.id);
      if (result.success) {
        // Update local state
        setNotifications(
          notifications.map((notif) =>
            notif.id === notification.id ? { ...notif, isRead: true } : notif
          )
        );
      }
    }

    // Navigate based on type
    if (notification.type === 'message' && notification.conversationId) {
      // Get conversation details for navigation
      try {
        const convResult = await chatService.getUserConversations(user.id);
        if (convResult.success && convResult.data) {
          const conversation = convResult.data.find((c) => c.conversationId === notification.conversationId);
          if (conversation) {
            navigation.navigate('Chat', { conversation });
            return;
          }
        }
      } catch (error) {
        console.error('Error getting conversation:', error);
      }
      // Fallback: navigate with basic conversation object
      navigation.navigate('Chat', {
        conversation: {
          conversationId: notification.conversationId,
          userId: notification.userId,
          userName: notification.relatedUser?.name || 'User',
          postTitle: notification.post?.title || 'Post',
        },
      });
    } else if (notification.postId) {
      // Navigate to post details
      navigation.navigate('Details', { postId: notification.postId });
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id) return;

    try {
      const result = await notificationService.markAllAsRead(user.id);
      if (result.success) {
        // Update local state
        setNotifications(notifications.map((notif) => ({ ...notif, isRead: true })));
        showToast('All notifications marked as read', 'success');
      } else {
        showToast(result.error || 'Failed to mark all as read', 'error');
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      showToast('An error occurred', 'error');
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        {
          backgroundColor: item.isRead ? colors.surface : colors.primaryLight + '10',
          borderColor: colors.border,
          borderLeftWidth: item.isRead ? 1 : 4,
          borderLeftColor: item.isRead ? colors.border : getNotificationColor(item.type),
        },
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: getNotificationColor(item.type) + '20' }]}>
        <Text style={styles.notificationIcon}>{getNotificationIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          {!item.isRead && (
            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
          )}
        </View>
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead} style={styles.markAllButton}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Notifications List */}
      {loading && notifications.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications</Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            You're all caught up!
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  markAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 26,
  },
  notificationCard: {
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationIcon: {
    fontSize: 24,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 12,
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

export default NotificationsScreen;

