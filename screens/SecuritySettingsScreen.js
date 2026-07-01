import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils';

const SecuritySettingsScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  return (
    <SupportArticleLayout title="Security">
      <Text style={[s.sectionTitle, s.sectionTitleFirst, { color: colors.text }]}>Account access</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Use a strong, unique password for your account. If you suspect someone else has access, change your
        password using the reset link from the login screen or Change Password in Settings.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Device & session</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Log out when using a shared device. Closing the app does not always sign you out—use the Logout button
        in Settings when you are finished.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Phishing & scams</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Items Return Desk will not ask for your password by email or chat. Be cautious of users asking to move
        the conversation off-app too quickly or requesting money outside agreed tips; report suspicious posts
        from the post menu when available.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Reporting</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        If you see content that violates guidelines or looks fraudulent, use Report Post so moderators can
        review it.
      </Text>
    </SupportArticleLayout>
  );
};

export default SecuritySettingsScreen;
