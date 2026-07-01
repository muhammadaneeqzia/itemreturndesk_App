import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import BubblesBackground from '../components/BubblesBackground';
import PasswordInput from '../components/PasswordInput';
import { supabase } from '../lib/config/supabase';
import { validatePasswordMatch } from '../utils';

const ResetPasswordScreen = () => {
  const { colors } = useTheme();
  const { completePasswordRecovery, cancelPasswordRecovery } = useAuth();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setSessionReady(!!session);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async () => {
    const v = validatePasswordMatch(password, confirm, { minLength: 6 });
    if (!v.ok) {
      showToast(v.message, 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await completePasswordRecovery(password);
      if (result.success) {
        showToast('Password updated. Welcome back!', 'success');
      } else {
        showToast(result.error || 'Could not update password', 'error');
      }
    } catch (e) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await cancelPasswordRecovery();
    showToast('You can request a new reset link from login.', 'info');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <BubblesBackground />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={[styles.title, { color: colors.text }]}>Set new password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Choose a strong password for your account.
            </Text>

            {!sessionReady ? (
              <View style={styles.centerBlock}>
                <Text style={[styles.warn, { color: colors.textSecondary }]}>
                  This link is invalid or has expired. Request a new reset email from the login screen.
                </Text>
                <TouchableOpacity
                  style={[styles.secondaryButton, { borderColor: colors.primary }]}
                  onPress={handleCancel}
                >
                  <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Back to login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <PasswordInput
                  label="New password"
                  placeholder="Enter new password"
                  value={password}
                  onChangeText={setPassword}
                />
                <PasswordInput
                  label="Confirm password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChangeText={setConfirm}
                />

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    { backgroundColor: colors.primary },
                    loading && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textInverse} />
                  ) : (
                    <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
                      Update password
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelWrap} onPress={handleCancel} disabled={loading}>
                  <Text style={[styles.cancelText, { color: colors.textTertiary }]}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingTop: 24,
    paddingBottom: 40,
    zIndex: 1,
  },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 28, textAlign: 'center' },
  centerBlock: { gap: 20 },
  warn: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { fontSize: 17, fontWeight: 'bold' },
  secondaryButton: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 16, fontWeight: '700' },
  cancelWrap: { marginTop: 20, alignItems: 'center' },
  cancelText: { fontSize: 15, fontWeight: '600' },
});

export default ResetPasswordScreen;
