import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
// Deep imports avoid Metro resolving the full package index (fixes missing getNotificationChannelAsync on some installs).
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';

const ANDROID_CHANNEL_ID = 'ird-default';

/** Android channel native provider is missing in Expo Go — skip channel APIs there. */
let androidChannelConfigured = false;

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export function isExpoPushSupported() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/**
 * @returns {Promise<boolean>} true if a custom channel id can be used for notifications
 */
export async function ensureAndroidNotificationChannel() {
  if (Platform.OS !== 'android') return false;
  if (isRunningInExpoGo()) return false;
  if (androidChannelConfigured) return true;
  try {
    await setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'General',
      importance: AndroidImportance.DEFAULT,
      vibrationPattern: [0, 220, 120, 220],
    });
    androidChannelConfigured = true;
    return true;
  } catch {
    if (__DEV__) {
      console.warn(
        '[expoPush] setNotificationChannelAsync failed (Expo Go or incomplete native setup). Local notifications may be limited.'
      );
    }
    return false;
  }
}

/**
 * @returns {Promise<{ granted: boolean; status: string }>}
 */
export async function requestNotificationPermissions() {
  if (!isExpoPushSupported()) {
    return { granted: false, status: 'unsupported' };
  }
  const existing = await getPermissionsAsync();
  if (existing.granted || existing.status === 'granted') {
    return { granted: true, status: existing.status };
  }
  const requested = await requestPermissionsAsync();
  return {
    granted: !!requested.granted,
    status: requested.status,
  };
}

/**
 * Show an immediate local notification (Expo presents the system banner when permitted).
 */
export async function presentLocalNotification({ title, body, data }) {
  if (!isExpoPushSupported()) return;
  const channelOk = await ensureAndroidNotificationChannel();
  const content = {
    title: title || 'Item Return Desk',
    body: body || '',
    data: data || {},
    sound: true,
  };
  if (Platform.OS === 'android' && channelOk) {
    content.channelId = ANDROID_CHANNEL_ID;
  }
  try {
    await scheduleNotificationAsync({
      content,
      trigger: null,
    });
  } catch (e) {
    if (__DEV__) {
      console.warn('[expoPush] scheduleNotificationAsync failed:', e?.message || e);
    }
  }
}
