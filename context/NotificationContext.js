import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/config/supabase';
import { getNotificationPrefs, setNotificationPrefs } from '../lib/services/notifications/notificationPrefs';
import {
  presentLocalNotification,
  requestNotificationPermissions,
  ensureAndroidNotificationChannel,
  isExpoPushSupported,
} from '../lib/services/notifications/expoPush';
import { emitChatsConversationsRefresh, emitNotificationsInboxRefresh } from '../lib/appEvents';

const NotificationContext = createContext(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return ctx;
}

const CHAT_EMIT_DEBOUNCE_MS = 450;

function removeChannelSafe(ch) {
  if (!ch) return;
  try {
    supabase.removeChannel(ch);
  } catch {
    // ignore
  }
}

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const userId = user?.id;

  const [notificationsEnabled, setNotificationsEnabledState] = useState(true);
  const [prefsHydrated, setPrefsHydrated] = useState(false);

  const chatEmitTimerRef = useRef(null);
  const messagesChannelRef = useRef(null);
  const notificationsChannelRef = useRef(null);

  const clearChatEmitDebounce = useCallback(() => {
    if (chatEmitTimerRef.current) {
      clearTimeout(chatEmitTimerRef.current);
      chatEmitTimerRef.current = null;
    }
  }, []);

  const scheduleChatListRefresh = useCallback(() => {
    clearChatEmitDebounce();
    chatEmitTimerRef.current = setTimeout(() => {
      chatEmitTimerRef.current = null;
      emitChatsConversationsRefresh();
    }, CHAT_EMIT_DEBOUNCE_MS);
  }, [clearChatEmitDebounce]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const prefs = await getNotificationPrefs();
      if (!cancelled) {
        setNotificationsEnabledState(prefs.enabled);
        setPrefsHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** New chat messages: refresh conversation list / tab badge (always when logged in). */
  useEffect(() => {
    clearChatEmitDebounce();
    removeChannelSafe(messagesChannelRef.current);
    messagesChannelRef.current = null;

    if (!userId) return undefined;

    const ch = supabase
      .channel(`messages-inbox-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const row = payload.new;
          if (!row || row.sender_id === userId) return;
          scheduleChatListRefresh();
        }
      )
      .subscribe();

    messagesChannelRef.current = ch;

    return () => {
      clearChatEmitDebounce();
      removeChannelSafe(messagesChannelRef.current);
      messagesChannelRef.current = null;
    };
  }, [userId, scheduleChatListRefresh, clearChatEmitDebounce]);

  /** DB notifications row: always refresh inbox; local push only if user enabled alerts. */
  useEffect(() => {
    removeChannelSafe(notificationsChannelRef.current);
    notificationsChannelRef.current = null;

    if (!userId || !prefsHydrated) return undefined;

    if (isExpoPushSupported()) {
      ensureAndroidNotificationChannel();
    }

    const ch = supabase
      .channel(`notifications-user-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new;
          if (!row) return;
          emitNotificationsInboxRefresh();
          if (notificationsEnabled) {
            presentLocalNotification({
              title: row.title || 'Notification',
              body: row.message || '',
              data: {
                type: row.type,
                conversationId: row.conversation_id,
                postId: row.post_id,
                notificationId: row.id,
              },
            }).catch(() => {});
          }
        }
      )
      .subscribe();

    notificationsChannelRef.current = ch;

    return () => {
      removeChannelSafe(notificationsChannelRef.current);
      notificationsChannelRef.current = null;
    };
  }, [userId, prefsHydrated, notificationsEnabled]);

  useEffect(() => {
    if (!userId) return undefined;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        scheduleChatListRefresh();
      }
    });
    return () => sub.remove();
  }, [userId, scheduleChatListRefresh]);

  const setNotificationsEnabled = useCallback(async (enabled) => {
    if (enabled) {
      if (isExpoPushSupported()) {
        const { granted } = await requestNotificationPermissions();
        if (!granted) {
          await setNotificationPrefs({ enabled: false });
          setNotificationsEnabledState(false);
          return { ok: false, reason: 'permission_denied' };
        }
        await ensureAndroidNotificationChannel();
      }
    }
    await setNotificationPrefs({ enabled });
    setNotificationsEnabledState(enabled);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      notificationsEnabled,
      setNotificationsEnabled,
      prefsHydrated,
    }),
    [notificationsEnabled, setNotificationsEnabled, prefsHydrated]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
