import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import AppIcon from './AppIcon';
import { useNavigation } from '@react-navigation/native';

const MatchingSuggestions = ({ currentPost, allPosts }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Simple matching algorithm - matches by category and similar keywords
  const findMatches = () => {
    if (!currentPost || !allPosts) return [];

    const matches = allPosts
      .filter((post) => {
        // Don't match with itself
        if (post.id === currentPost.id) return false;
        // Match opposite type (Lost matches Found, Found matches Lost)
        if (post.type === currentPost.type) return false;
        // Match by category
        if (post.category !== currentPost.category) return false;
        return true;
      })
      .slice(0, 3); // Show max 3 matches

    return matches;
  };

  const matches = findMatches();

  if (matches.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <AppIcon name="search" size={20} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Similar items found</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {matches.map((match) => (
          <TouchableOpacity
            key={match.id}
            style={[styles.matchCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => navigation.navigate('Details', { postId: match.id })}
          >
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    match.type === 'Lost' ? colors.warning + '20' : colors.success + '20',
                },
              ]}
            >
              <Text
                style={[
                  styles.typeText,
                  {
                    color: match.type === 'Lost' ? colors.warning : colors.success,
                  },
                ]}
              >
                {match.type}
              </Text>
            </View>
            <Text style={[styles.matchTitle, { color: colors.text }]} numberOfLines={2}>
              {match.title}
            </Text>
            <Text style={[styles.matchCategory, { color: colors.textSecondary }]}>
              {match.category}
            </Text>
            <View style={styles.locRow}>
              <AppIcon name="locationOutline" size={14} color={colors.textTertiary} />
              <Text style={[styles.matchLocation, { color: colors.textTertiary }]} numberOfLines={1}>
                {match.location}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  locRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollView: {
    paddingHorizontal: 20,
  },
  matchCard: {
    width: 200,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  matchCategory: {
    fontSize: 12,
    marginBottom: 4,
  },
  matchLocation: {
    fontSize: 11,
  },
});

export default MatchingSuggestions;

