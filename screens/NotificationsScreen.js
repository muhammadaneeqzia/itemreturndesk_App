import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { notificationService } from '../lib/services/notifications/notificationService';
import { chatService } from '../lib/services/chats/chatService';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';
import { NOTIFICATIONS_INBOX_REFRESH } from '../lib/appEvents';

const NotificationsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getNotificationIconName = (type) => {
    switch (type) {
      case 'message':
        return 'chatbubbles';
      case 'match':
        return 'search';
      case 'claim':
        return 'checkmarkCircle';
      case 'contact':
        return 'call';
      case 'admin':
        return 'shieldCheckmark';
      default:
        return 'notifications';
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
  const fetchNotifications = useCallback(
    async (opts = {}) => {
      const silent = opts.silent === true;
      if (!user?.id) return;

      try {
        if (!silent) setLoading(true);
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
        if (!silent) setLoading(false);
      }
    },
    [user?.id]
  );

  // Refresh notifications
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Realtime / push pipeline may insert new rows while user is elsewhere
  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(NOTIFICATIONS_INBOX_REFRESH, () => {
      fetchNotifications({ silent: true });
      if (user?.id) {
        notificationService.getUnreadCount(user.id).then((result) => {
          if (result.success) {
            navigation.setOptions({
              tabBarBadge: result.count > 0 ? result.count : undefined,
            });
          }
        });
      }
    });
    return () => sub.remove();
  }, [user?.id, navigation, fetchNotifications]);

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
    }, [user?.id, navigation, fetchNotifications])
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
        <AppIcon
          name={getNotificationIconName(item.type)}
          size={22}
          color={getNotificationColor(item.type)}
        />
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
      <ScreenHeader
        variant="tab"
        title="Notifications"
        rightElement={
          unreadCount > 0 ? (
            <TouchableOpacity onPress={markAllAsRead} hitSlop={12}>
              <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
            </TouchableOpacity>
          ) : null
        }
      />

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
          <AppIcon name="notificationsOutline" size={48} color={colors.textTertiary} style={{ marginBottom: 16 }} />
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
  markAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContent: {
    padding: space.md,
    paddingTop: space.lg,
  },
  notificationCard: {
    flexDirection: 'row',
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.sm,
    ...shadowSoft,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
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

