import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
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
      <Text style={[styles.title, { color: colors.text }]}>🔍 Similar Items Found</Text>
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
            <Text style={[styles.matchLocation, { color: colors.textTertiary }]}>
              📍 {match.location}
            </Text>
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
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    marginHorizontal: 20,
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

