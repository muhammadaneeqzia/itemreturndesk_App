import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
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
import AppIcon from '../components/AppIcon';
import { EMAIL_REGEX, normalizeEmail } from '../utils';

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { requestPasswordReset } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const normalized = normalizeEmail(email);
    if (!normalized) {
      showToast('Please enter your email', 'error');
      return;
    }
    if (!EMAIL_REGEX.test(normalized)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await requestPasswordReset(normalized);
      if (result.success) {
        showToast('Check your email for reset instructions', 'success');
        navigation.navigate('Login');
      } else {
        showToast(result.error || 'Something went wrong', 'error');
      }
    } catch (e) {
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
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
            <TouchableOpacity
              style={styles.backRow}
              onPress={() => navigation.goBack()}
              hitSlop={12}
            >
              <AppIcon name="arrowBack" size={18} color={colors.primary} />
              <Text style={[styles.backText, { color: colors.primary }]}>Back to login</Text>
            </TouchableOpacity>

            <Text style={[styles.title, { color: colors.text }]}>Forgot password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter your account email. If it exists, we will send a secure link to set a new password.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="you@example.com"
                placeholderTextColor={colors.textTertiary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

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
                  Send reset link
                </Text>
              )}
            </TouchableOpacity>
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
  backRow: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22, marginBottom: 32 },
  inputContainer: { marginBottom: 24 },
  label: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: { fontSize: 17, fontWeight: 'bold' },
});

export default ForgotPasswordScreen;
