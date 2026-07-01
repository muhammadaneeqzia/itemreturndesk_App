import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils';

const PrivacySettingsScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  return (
    <SupportArticleLayout title="Privacy Settings">
      <Text style={[s.sectionTitle, s.sectionTitleFirst, { color: colors.text }]}>Your profile</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Your name, avatar, and contact details you choose to save are stored with your account. You can update
        them anytime from Edit Profile in Settings.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Posts & visibility</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Lost and Found posts you create are visible to other signed-in users so they can help or get in touch
        through the app. Do not share sensitive personal information in the public description if you prefer
        to keep it private until you connect with someone in chat.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Messaging</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        In-app messages are tied to your account. Use the built-in chat instead of posting phone numbers in
        titles when possible, so you control when you share more detail.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Data use</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        We use your information to run the service (accounts, posts, notifications you enable). See Terms &
        Privacy for the full policy text.
      </Text>
    </SupportArticleLayout>
  );
};

export default PrivacySettingsScreen;
