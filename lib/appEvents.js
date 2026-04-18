import { DeviceEventEmitter } from 'react-native';

/** Fired after chat messages are marked read so lists/tab badges can refetch. */
export const CHATS_CONVERSATIONS_REFRESH = 'app:chatsConversationsRefresh';

export function emitChatsConversationsRefresh() {
  DeviceEventEmitter.emit(CHATS_CONVERSATIONS_REFRESH);
}

/** Payload: { conversationId } — clear list/tab unread for this thread immediately (e.g. user opened chat). */
export const CHATS_CONVERSATION_READ = 'app:chatsConversationRead';

export function emitChatConversationRead(conversationId) {
  if (!conversationId) return;
  DeviceEventEmitter.emit(CHATS_CONVERSATION_READ, { conversationId });
}

/** Refetch in-app notification list / tab badge */
export const NOTIFICATIONS_INBOX_REFRESH = 'app:notificationsInboxRefresh';

export function emitNotificationsInboxRefresh() {
  DeviceEventEmitter.emit(NOTIFICATIONS_INBOX_REFRESH);
}
