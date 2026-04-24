import { supabase } from '../../config/supabase';

/**
 * Chat/Conversation Service
 * Handles all conversation-related operations
 */

/**
 * Format date to relative time
 */
const formatTimeAgo = (date) => {
  const now = new Date();
  const msgDate = new Date(date);
  const diffMs = now - msgDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (!msgDate || isNaN(msgDate.getTime())) return '';

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return msgDate.toLocaleDateString();
};

export const chatService = {
  /**
   * Get all conversations for a user
   * @param {string} userId - Current user ID
   * @returns {Promise<{success: boolean, data?: Array, error?: string}>}
   */
  async getUserConversations(userId) {
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          post_id,
          user1_id,
          user2_id,
          last_message_at,
          created_at,
          posts:post_id (
            id,
            title,
            type
          ),
          user1:profiles!conversations_user1_id_fkey (
            id,
            name,
            avatar_url,
            email
          ),
          user2:profiles!conversations_user2_id_fkey (
            id,
            name,
            avatar_url,
            email
          )
        `)
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false, nullsFirst: false });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get last message and unread count for each conversation
      const conversationsWithMessages = await Promise.all(
        (data || []).map(async (conv) => {
          // Determine the other user
          const otherUser = conv.user1_id === userId ? conv.user2 : conv.user1;
          const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('messages')
            .select('message_text, created_at')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count (messages not sent by current user and not read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', userId);

          return {
            id: conv.id,
            conversationId: conv.id,
            userId: otherUserId,
            userName: otherUser?.name || otherUser?.email?.split('@')[0] || 'User',
            userAvatar: otherUser?.avatar_url || null,
            lastMessage: lastMessageData?.message_text || '',
            lastMessageTime: lastMessageData?.created_at
              ? formatTimeAgo(lastMessageData.created_at)
              : formatTimeAgo(conv.created_at),
            unreadCount: unreadCount || 0,
            postTitle: conv.posts?.title || '',
            postType: conv.posts?.type || '',
            postId: conv.post_id,
          };
        })
      );

      return { success: true, data: conversationsWithMessages };
    } catch (error) {
      console.error('Get user conversations error:', error);
      return { success: false, error: error.message || 'Failed to get conversations' };
    }
  },

  /**
   * Get or create a conversation
   * @param {string} postId - Post ID
   * @param {string} userId - Current user ID (interested user)
   * @param {string} postOwnerId - Post owner ID
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  async getOrCreateConversation(postId, userId, postOwnerId) {
    try {
      // Check if conversation already exists
      const { data: existing, error: checkError } = await supabase
        .from('conversations')
        .select('*')
        .eq('post_id', postId)
        .or(
          `and(user1_id.eq.${postOwnerId},user2_id.eq.${userId}),and(user1_id.eq.${userId},user2_id.eq.${postOwnerId})`
        )
        .single();

      if (existing && !checkError) {
        return { success: true, data: existing };
      }

      // Create new conversation
      // Ensure user1 is always the post owner and user2 is the interested user
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          post_id: postId,
          user1_id: postOwnerId,
          user2_id: userId,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      console.error('Get or create conversation error:', error);
      return { success: false, error: error.message || 'Failed to create conversation' };
    }
  },

  /**
   * Delete a conversation (and messages via DB cascade). Either participant may delete.
   * @param {string} conversationId
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteConversation(conversationId) {
    try {
      const { error } = await supabase.from('conversations').delete().eq('id', conversationId);

      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error) {
      console.error('Delete conversation error:', error);
      return { success: false, error: error.message || 'Failed to delete conversation' };
    }
  },
};
