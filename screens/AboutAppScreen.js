import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import SupportArticleLayout from '../components/SupportArticleLayout';
import { supportDocStyles } from '../utils/supportDocStyles';
import AppIcon from '../components/AppIcon';
import { space } from '../utils/layout';

const APP_VERSION = '1.0.0';

const AboutAppScreen = () => {
  const { colors } = useTheme();
  const s = supportDocStyles;

  return (
    <SupportArticleLayout title="About">
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primary + '18' }]}>
          <AppIcon name="cube" size={40} color={colors.primary} />
        </View>
        <Text style={[styles.appName, { color: colors.text }]}>Item Return Desk</Text>
        <Text style={[styles.version, { color: colors.textTertiary }]}>Version {APP_VERSION}</Text>
      </View>

      <Text style={[s.paragraph, { color: colors.textSecondary, marginTop: space.lg }]}>
        Your campus lost & found hub—post lost or found items, connect safely in-app, and help items get back
        to their owners.
      </Text>

      <Text style={[s.sectionTitle, { color: colors.text }]}>Credits</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Built with React Native and Expo. Thank you for using the app and supporting your community.
      </Text>

      <Text style={[s.paragraph, { color: colors.textTertiary, fontSize: 13 }]}>
        © {new Date().getFullYear()} Item Return Desk. All rights reserved.
      </Text>
    </SupportArticleLayout>
  );
};

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingVertical: space.xl,
    paddingHorizontal: space.md,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.md,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  version: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default AboutAppScreen;
