import { chatService } from './services/chats/chatService';

export function buildConversationNavPayload(conv, post) {
  return {
    conversationId: conv.conversationId || conv.id,
    userId: conv.userId,
    userName: conv.userName || 'User',
    userAvatar: conv.userAvatar || null,
    postTitle: post?.title || conv.postTitle || '',
    postType: post?.type || conv.postType || '',
    postId: post?.id || conv.postId,
  };
}

/**
 * Open chat for a post — works for owner (view messages) and others (start chat).
 */
export async function openPostChat({ post, user, navigation, showToast, showModal }) {
  if (!post?.id) return;
  if (!user?.id) {
    showToast('Please login to chat', 'error');
    return;
  }

  const isOwnPost = post.user_id === user.id;

  if (isOwnPost) {
    const result = await chatService.getConversationsForPost(post.id, user.id);
    if (!result.success) {
      showToast(result.error || 'Failed to load messages', 'error');
      return;
    }

    const conversations = result.data || [];
    if (conversations.length === 0) {
      showToast('No messages yet — waiting for someone to contact you', 'info');
      return;
    }

    if (conversations.length === 1) {
      navigation.navigate('Chat', {
        conversation: buildConversationNavPayload(conversations[0], post),
      });
      return;
    }

    showModal({
      title: 'Messages',
      message: 'Choose a conversation for this post',
      buttons: [
        ...conversations.slice(0, 5).map((conv) => ({
          text: conv.unreadCount > 0 ? `${conv.userName} (${conv.unreadCount} new)` : conv.userName,
          variant: 'secondary',
          onPress: () =>
            navigation.navigate('Chat', {
              conversation: buildConversationNavPayload(conv, post),
            }),
        })),
        { text: 'Cancel', variant: 'cancel' },
      ],
    });
    return;
  }

  try {
    const result = await chatService.getOrCreateConversation(post.id, user.id, post.user_id);
    if (result.success && result.data) {
      navigation.navigate('Chat', {
        conversation: {
          conversationId: result.data.id,
          userId: post.user_id,
          userName: post.userName || 'User',
          userAvatar: post.userAvatar || null,
          postTitle: post.title,
          postType: post.type,
          postId: post.id,
        },
      });
    } else {
      showToast(result.error || 'Failed to start chat', 'error');
    }
  } catch (error) {
    console.error('openPostChat error:', error);
    showToast('Could not open chat', 'error');
  }
}
