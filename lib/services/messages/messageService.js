import { supabase } from '../../config/supabase';

/**
 * Message Service
 * Handles all message-related operations
 */

export const messageService = {
  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getMessages(conversationId) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          message_text,
          is_read,
          read_at,
          created_at,
          profiles:sender_id (
            id,
            name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        return { success: false, error: error.message };
      }

      // Format messages
      const formattedMessages = (data || []).map((msg) => ({
        id: msg.id,
        text: msg.message_text,
        senderId: msg.sender_id,
        timestamp: new Date(msg.created_at),
        isRead: msg.is_read,
        readAt: msg.read_at ? new Date(msg.read_at) : null,
        sender: msg.profiles,
      }));

      return { success: true, data: formattedMessages };
    } catch (error) {
      console.error('Get messages error:', error);
      return { success: false, error: error.message || 'Failed to get messages' };
    }
  },

  /**
   * Send a message
   * @param {string} conversationId - Conversation ID
   * @param {string} senderId - Sender user ID
   * @param {string} messageText - Message text
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async sendMessage(conversationId, senderId, messageText) {
    try {
      // Insert message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          message_text: messageText.trim(),
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Update conversation's last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      // Format message
      const formattedMessage = {
        id: data.id,
        text: data.message_text,
        senderId: data.sender_id,
        timestamp: new Date(data.created_at),
        isRead: data.is_read,
      };

      return { success: true, data: formattedMessage };
    } catch (error) {
      console.error('Send message error:', error);
      return { success: false, error: error.message || 'Failed to send message' };
    }
  },

  /**
   * Mark messages as read
   * @param {string} conversationId - Conversation ID
   * @param {string} userId - Current user ID (mark messages not sent by this user as read)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async markAsRead(conversationId, userId) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .eq('is_read', false);

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
   * Get unread message count for a user (across all conversations)
   * @param {string} userId - User ID
   * @returns {Promise<{success: boolean, count?: number, error?: string}>}
   */
  async getUnreadCount(userId) {
    try {
      // Get all conversations where user is participant
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

      if (!conversations || conversations.length === 0) {
        return { success: true, count: 0 };
      }

      const conversationIds = conversations.map((c) => c.id);

      // Get unread messages count
      const { count, error } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .eq('is_read', false)
        .neq('sender_id', userId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, count: count || 0 };
    } catch (error) {
      console.error('Get unread count error:', error);
      return { success: false, error: error.message || 'Failed to get unread count' };
    }
  },
};
