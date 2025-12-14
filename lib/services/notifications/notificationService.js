import { supabase } from '../../config/supabase';

/**
 * Notification Service
 * Handles all notification-related operations
 */

/**
 * Format date to relative time
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const notifDate = new Date(date);
  const diffMs = now - notifDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (!notifDate || isNaN(notifDate.getTime())) return '';

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return notifDate.toLocaleDateString();
};

export const notificationService = {
  /**
   * Get all notifications for a user
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getNotifications(userId) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          id,
          type,
          title,
          message,
          is_read,
          read_at,
          created_at,
          post_id,
          conversation_id,
          related_user_id,
          posts:post_id (
            id,
            title,
            type
          ),
          related_user:profiles!notifications_related_user_id_fkey (
            id,
            name,
            avatar_url,
            email
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      // Format notifications
      const formattedNotifications = (data || []).map((notif) => ({
        id: notif.id,
        type: notif.type,
        title: notif.title,
        message: notif.message,
        isRead: notif.is_read,
        readAt: notif.read_at ? new Date(notif.read_at) : null,
        createdAt: new Date(notif.created_at),
        time: formatTimeAgo(notif.created_at),
        postId: notif.post_id,
        conversationId: notif.conversation_id,
        userId: notif.related_user_id,
        post: notif.posts,
        relatedUser: notif.related_user,
      }));

      return { success: true, data: formattedNotifications };
    } catch (error) {
      console.error('Get notifications error:', error);
      return { success: false, error: error.message || 'Failed to get notifications' };
    }
  },

  /**
   * Get unread notifications count
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, count?: number, error?: string}>}
   */
  async getUnreadCount(userId) {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { success: false, error: error.message || 'Failed to get unread count' };
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markAsRead(notificationId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false, error: error.message || 'Failed to mark as read' };
    }
  },

  /**
   * Mark all notifications as read
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markAllAsRead(userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Mark all as read error:', error);
      return { success: false, error: error.message || 'Failed to mark all as read' };
    }
  },

  /**
   * Delete a notification
   * @param {string} notificationId - Notification ID
   * @param {string} userId - User ID (for authorization)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteNotification(notificationId, userId) {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Delete notification error:', error);
      return { success: false, error: error.message || 'Failed to delete notification' };
    }
  },
};
