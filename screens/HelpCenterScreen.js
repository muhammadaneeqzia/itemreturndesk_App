import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils/supportDocStyles';

const HelpCenterScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  return (
    <SupportArticleLayout title="Help Center">
      <Text style={[s.sectionTitle, s.sectionTitleFirst, { color: colors.text }]}>Getting started</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Browse Lost and Found from the home tabs. Open a post to read details, view photos, and contact the
        poster when you are signed in.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Creating a post</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Use Create Post, pick Lost or Found, add a clear title, category, location, and description. Multiple
        photos help others recognize items. Submit and share the listing with your campus or group if you like.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Contacting someone</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        From a post that is not yours, use Contact to start an in-app conversation. Keep initial messages polite
        and specific (where you may have seen the item, identifying details).
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>My posts & chats</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Manage your listings under My Posts. Chats live under the Messages tab; unread counts clear after you
        open a thread.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Still stuck?</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Read the User Guide for a full walkthrough, or reach us from Contact Support.
      </Text>
    </SupportArticleLayout>
  );
};

export default HelpCenterScreen;
