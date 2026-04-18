import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils/supportDocStyles';

const UserGuideScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  return (
    <SupportArticleLayout title="User Guide">
      <Text style={[s.sectionTitle, s.sectionTitleFirst, { color: colors.text }]}>1. Account</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Sign up with your email, confirm if required, then complete your profile (name, optional phone) so
        others can trust your listings.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>2. Home & discovery</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Use the home experience to scan recent activity. Open Lost Posts or Found Posts from shortcuts to
        filter the feed by type.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>3. Posting an item</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Tap Create Post, choose Lost or Found, fill title, category, location, and description. Add photos
        (clear, well lit). Review and publish. You can edit later from My Posts.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>4. Item details & safety</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        On the details screen, read the full story, check location context, then use Contact to message the
        owner. Meet in safe, public places for handoffs when exchanging physical items.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>5. Messages</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Conversations are per post context. Reply promptly; mark threads as read by opening them so your unread
        badge stays accurate.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>6. Settings & notifications</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Adjust theme, notification toggles, and account options under Settings. Admins get an extra Admin Panel
        entry for moderation.
      </Text>
    </SupportArticleLayout>
  );
};

export default UserGuideScreen;
