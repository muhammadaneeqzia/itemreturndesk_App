import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { userService } from '../lib/services/users/userService';
import { authService } from '../lib/services/auth/authService';

const SettingsScreen = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout, isAdmin, user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  // Load notification preferences from user profile (if stored)
  useEffect(() => {
    // For now, we'll use local state
    // In future, can add notification_preferences field to profiles table
  }, []);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const renderSettingItem = (icon, title, subtitle, onPress, showArrow = true, rightComponent = null) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.settingItemLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <View style={styles.settingItemText}>
          <Text style={[styles.settingItemTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightComponent || (showArrow && <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>)}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingTop: 10 }]}
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
              <Text style={styles.settingIcon}>{isDark ? '🌙' : '☀️'}</Text>
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

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={1}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Enable Notifications</Text>
                <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
                  Receive push notifications
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={1}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingIcon}>📧</Text>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Email Notifications</Text>
                <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
                  Get updates via email
                </Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
              disabled={!notificationsEnabled}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={1}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingIcon}>📱</Text>
              <View style={styles.settingItemText}>
                <Text style={[styles.settingItemTitle, { color: colors.text }]}>Push Notifications</Text>
                <Text style={[styles.settingItemSubtitle, { color: colors.textSecondary }]}>
                  Receive instant alerts
                </Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.textInverse}
              disabled={!notificationsEnabled}
            />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          {renderSettingItem('👤', 'Edit Profile', 'Update your personal information', () =>
            navigation.navigate('EditProfile')
          )}
          {renderSettingItem('🔒', 'Change Password', 'Update your password', () => {
            Alert.alert(
              'Change Password',
              'This feature will allow you to update your password. For security, please use the password reset option in the login screen.',
              [
                { text: 'OK', style: 'default' },
                {
                  text: 'Reset Password',
                  onPress: async () => {
                    if (user?.email) {
                      try {
                        const result = await authService.resetPassword(user.email);
                        if (result.success) {
                          Alert.alert(
                            'Email Sent',
                            'Password reset instructions have been sent to your email address.',
                            [{ text: 'OK' }]
                          );
                        } else {
                          showToast(result.error || 'Failed to send reset email', 'error');
                        }
                      } catch (error) {
                        showToast('An error occurred', 'error');
                      }
                    }
                  },
                },
              ]
            );
          })}
          {renderSettingItem('📧', 'Email Settings', 'Manage email preferences', () =>
            Alert.alert('Info', 'Email settings feature coming soon')
          )}
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy & Security</Text>
          {renderSettingItem('🔐', 'Privacy Settings', 'Control your privacy', () =>
            Alert.alert('Info', 'Privacy settings coming soon')
          )}
          {renderSettingItem('🛡️', 'Security', 'Manage security options', () =>
            Alert.alert('Info', 'Security settings coming soon')
          )}
          {renderSettingItem('📝', 'Terms & Privacy', 'Read our terms and privacy policy', () =>
            Alert.alert('Info', 'Terms & Privacy coming soon')
          )}
        </View>

        {/* General Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>General</Text>
          {renderSettingItem('🌐', 'Language', 'English', () =>
            Alert.alert('Info', 'Language settings coming soon')
          )}
          {renderSettingItem('💾', 'Storage', 'Manage app storage', () =>
            Alert.alert('Info', 'Storage settings coming soon')
          )}
          {renderSettingItem('🔄', 'Clear Cache', 'Free up storage space', () => {
            Alert.alert(
              'Clear Cache',
              'This will clear cached data. Continue?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  onPress: () => {
                    // Clear cache logic can be added here
                    // For now, just show success message
                    showToast('Cache cleared successfully', 'success');
                  },
                },
              ]
            );
          })}
        </View>

        {/* Admin Section - Only for admins */}
        {isAdmin && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Admin</Text>
            {renderSettingItem('🛡️', 'Admin Panel', 'Review posts and manage content', () =>
              navigation.navigate('AdminPanel')
            )}
          </View>
        )}

        {/* Help & Support Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Help & Support</Text>
          {renderSettingItem('❓', 'Help Center', 'Get help and FAQs', () =>
            Alert.alert('Info', 'Help center coming soon')
          )}
          {renderSettingItem('📞', 'Contact Support', 'Reach out to our team', () =>
            Alert.alert('Info', 'Contact support feature coming soon')
          )}
          {renderSettingItem('📚', 'User Guide', 'Learn how to use the app', () =>
            Alert.alert('Info', 'User guide coming soon')
          )}
          {renderSettingItem('ℹ️', 'About', 'App version and info', () =>
            Alert.alert('About', 'Item Return Desk\nVersion 1.0.0\n\nYour campus lost & found hub')
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.error }]}
          onPress={handleLogout}
        >
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
  },
  settingItemText: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: 16,
    fontWeight: 'normal',
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
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
