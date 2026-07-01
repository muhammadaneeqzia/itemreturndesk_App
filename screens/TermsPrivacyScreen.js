import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils';

const TermsPrivacyScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  return (
    <SupportArticleLayout title="Terms & Privacy">
      <Text style={[s.paragraph, { color: colors.textTertiary, fontSize: 13 }]}>
        Last updated: April 2026. This summary is for convenience; your organization may replace this with
        formal legal text.
      </Text>

      <Text style={[s.sectionTitle, s.sectionTitleFirst, { color: colors.text }]}>Terms of use</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• You agree to provide accurate information in posts where reasonable.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Harassment, illegal items, spam, or misleading listings are not allowed.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• The service is provided as-is; we may change or suspend features with notice when practical.</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• You are responsible for interactions with other users and for complying with local laws.</Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Privacy policy</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        We collect account data (e.g. email, profile fields you submit), content you post (text, images,
        location fields), and usage data needed to operate the app. Authentication and storage may be
        processed by our backend provider (e.g. Supabase) under their infrastructure terms.
      </Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        We use this data to authenticate you, show posts, enable chat, and send notifications you turn on. We
        do not sell your personal information to third parties for their marketing.
      </Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        You may request account or data questions through Contact Support. Deleting your account may remove
        associated profile data subject to retention rules your administrator configures.
      </Text>
    </SupportArticleLayout>
  );
};

export default TermsPrivacyScreen;
