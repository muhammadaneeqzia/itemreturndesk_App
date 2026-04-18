import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from './ScreenHeader';
import { space } from '../utils/layout';

/**
 * Stack screen shell: back header + padded scroll body for help / legal pages.
 */
const SupportArticleLayout = ({ title, children }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScreenHeader title={title} onBack={() => navigation.goBack()} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.inner, { paddingBottom: space.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  inner: {
    paddingHorizontal: space.md,
    paddingTop: space.md,
  },
});

export default SupportArticleLayout;
