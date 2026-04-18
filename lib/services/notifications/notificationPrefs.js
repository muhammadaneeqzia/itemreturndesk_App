import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_NOTIFICATION_PREFS } from '../../config/storageKeys';

const DEFAULT_PREFS = { enabled: true };

/**
 * @returns {Promise<{ enabled: boolean }>}
 */
export async function getNotificationPrefs() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_NOTIFICATION_PREFS);
    if (!raw) return { ...DEFAULT_PREFS };
    const parsed = JSON.parse(raw);
    return {
      enabled: parsed.enabled !== false,
    };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

/**
 * @param {{ enabled: boolean }} prefs
 */
export async function setNotificationPrefs(prefs) {
  await AsyncStorage.setItem(
    STORAGE_NOTIFICATION_PREFS,
    JSON.stringify({
      enabled: prefs.enabled === true,
    })
  );
}
