import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { useNotifications } from '../context/NotificationContext';
import { useAppModal } from '../context/ModalContext';
import { authService } from '../lib/services/auth/authService';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils';

const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout, isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const { notificationsEnabled, setNotificationsEnabled, prefsHydrated } = useNotifications();
  const { showAlert, showConfirm, showModal } = useAppModal();
  const navigation = useNavigation();

  const onToggleNotifications = async (value) => {
    const result = await setNotificationsEnabled(value);
    if (!result.ok && result.reason === 'permission_denied') {
      showToast('Allow notifications in system settings to turn this on', 'error');
    }
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      cancelText: 'Cancel',
      confirmText: 'Logout',
      destructive: true,
      onConfirm: async () => {
        await logout();
      },
    });
  };

  const renderSettingItem = (iconName, title, subtitle, onPress, showArrow = true, rightComponent = null) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + '14' }]}>
          <AppIcon name={iconName} size={22} color={colors.primary} />
        </View>
        <View style={styles.settingItemText}>
          <Text style={[styles.settingItemTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (showArrow && <AppIcon name="chevronForward" size={20} color={colors.textTertiary} />)}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Settings" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: space.sm }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + '14' }]}>
                <AppIcon name={isDark ? 'moon' : 'sunny'} size={22} color={colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Theme</Text>
                <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </TouchableOpacity>
        </View>

        {/* Notifications Section — preference stored in AsyncStorage; OS permission when enabling */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={1}
          >
            <View style={styles.settingItemLeft}>
              <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + '14' }]}>
                <AppIcon name="notificationsOutline" size={22} color={colors.primary} />
              </View>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Enable Notifications</Text>
                <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
                  Alerts for new messages & inbox (saved on this device)
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              disabled={!prefsHydrated}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          {renderSettingItem('personOutline', 'Edit Profile', 'Update your personal information', () =>
            navigation.navigate('EditProfile')
          )}
          {renderSettingItem('lockClosedOutline', 'Change Password', 'Update your password', () => {
            showModal({
              title: 'Change Password',
              message:
                'This feature will allow you to update your password. For security, please use the password reset option in the login screen.',
              buttons: [
                { text: 'OK', variant: 'cancel' },
                {
                  text: 'Reset Password',
                  variant: 'primary',
                  onPress: async () => {
                    if (!user?.email) return;
                    try {
                      const result = await authService.requestPasswordReset(user.email);
                      if (result.success) {
                        setTimeout(
                          () =>
                            showAlert(
                              'Email Sent',
                              'Password reset instructions have been sent to your email address.'
                            ),
                          320
                        );
                      } else {
                        showToast(result.error || 'Failed to send reset email', 'error');
                      }
                    } catch (error) {
                      showToast('An error occurred', 'error');
                    }
                  },
                },
              ],
            });
          })}
          {renderSettingItem('mailOutline', 'Email Settings', 'Manage email preferences', () =>
            showAlert('Info', 'Email settings feature coming soon')
          )}
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
          {renderSettingItem('shieldCheckmark', 'Privacy Settings', 'Control your privacy', () =>
            navigation.navigate('PrivacySettings')
          )}
          {renderSettingItem('shield', 'Security', 'Manage security options', () =>
            navigation.navigate('SecuritySettings')
          )}
          {renderSettingItem('documentTextOutline', 'Terms & Privacy', 'Read our terms and privacy policy', () =>
            navigation.navigate('TermsPrivacy')
          )}
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          {renderSettingItem('globe', 'Language', 'English', () =>
            showAlert('Info', 'Language settings coming soon')
          )}
          {renderSettingItem('save', 'Storage', 'Manage app storage', () =>
            showAlert('Info', 'Storage settings coming soon')
          )}
          {renderSettingItem('refresh', 'Clear Cache', 'Free up storage space', () => {
            showConfirm({
              title: 'Clear Cache',
              message: 'This will clear cached data. Continue?',
              cancelText: 'Cancel',
              confirmText: 'Clear',
              onConfirm: () => {
                showToast('Cache cleared successfully', 'success');
              },
            });
          })}
        </View>

        {/* Admin Section - Only for admins */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin</Text>
            {renderSettingItem('construct', 'Admin Panel', 'Review posts and manage content', () =>
              navigation.navigate('AdminPanel')
            )}
          </View>
        )}

        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Help & Support</Text>
          {renderSettingItem('helpCircleOutline', 'Help Center', 'Get help and FAQs', () =>
            navigation.navigate('HelpCenter')
          )}
          {renderSettingItem('call', 'Contact Support', 'Reach out to our team', () =>
            navigation.navigate('ContactSupport')
          )}
          {renderSettingItem('bookOutline', 'User Guide', 'Learn how to use the app', () =>
            navigation.navigate('UserGuide')
          )}
          {renderSettingItem('informationCircle', 'About', 'App version and info', () =>
            navigation.navigate('AboutApp')
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
          <AppIcon name="logOutOutline" size={20} color={colors.textInverse} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutButtonText, { color: colors.textInverse }]}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          Version 1.0.0
        </Text>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  section: {
    marginTop: space.lg,
    paddingHorizontal: space.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: space.sm,
    opacity: 0.85,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.sm,
    ...shadowSoft,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    marginRight: space.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingItemSubtitle: {
    fontSize: 12,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: space.md,
    marginTop: space.xl,
    paddingVertical: space.md,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadowSoft,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SettingsScreen;
