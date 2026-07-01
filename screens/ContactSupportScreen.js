import React from 'react';
import { Text, TouchableOpacity, Linking, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils';
import { SUPPORT_EMAIL } from '../lib/supportContact';

const ContactSupportScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  const openMail = () => {
    const subject = encodeURIComponent('Items Return Desk — Support');
    const body = encodeURIComponent(
      `Please describe your issue:\n\n\n—\nApp: Items Return Desk\nPlatform: ${Platform.OS}\n`
    );
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  return (
    <SupportArticleLayout title="Contact Support">
      <Text style={[s.sectionTitle, s.sectionTitleFirst, { color: colors.text }]}>We are here to help</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        For account problems, bugs, or policy questions, email the team. We typically respond within a few
        business days.
      </Text>

      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Before writing, check Help Center and User Guide—many answers are already there.
      </Text>

      <TouchableOpacity
        style={[s.linkButton, { backgroundColor: colors.primary }]}
        onPress={openMail}
        activeOpacity={0.85}
      >
        <Text style={[s.linkButtonText, { color: colors.textInverse }]}>Email {SUPPORT_EMAIL}</Text>
      </TouchableOpacity>

      <Text style={[s.sectionTitle, { color: colors.text }]}>What to include</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Your account email (no password)</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Steps to reproduce a bug, or screenshots if helpful</Text>
      <Text style={[s.bullet, { color: colors.textSecondary }]}>• Post ID or chat context if the issue is about a specific item</Text>
    </SupportArticleLayout>
  );
};

export default ContactSupportScreen;
