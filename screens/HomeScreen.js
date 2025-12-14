import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postService } from '../lib/services/posts/postService';

const { width } = Dimensions.get('window');
const cardSize = (width - 60) / 2; // 20 padding on each side + 20 gap between cards

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    myPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h'); // 24h or 7d
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stats
  const fetchStats = async () => {
    if (!user?.id) return;

    try {
      const result = await postService.getStats(user.id);
      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // Fetch recent posts
  const fetchRecentPosts = async () => {
    try {
      const result = await postService.getRecentPosts(timeFilter, 10);
      if (result.success && result.data) {
        setRecentPosts(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent posts:', error);
    }
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecentPosts()]);
    setLoading(false);
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentPosts()]);
    setRefreshing(false);
  };

  // Load data on mount and when timeFilter changes
  useEffect(() => {
    loadData();
  }, [timeFilter, user?.id]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [timeFilter, user?.id])
  );

  if (loading && recentPosts.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background,marginTop: 40 }]}>
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingTop: 10 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Welcome Card */}
        <View style={[styles.welcomeCard, { backgroundColor: colors.primary }]}>
          <Text style={[styles.welcomeText, { color: colors.textInverse }]}>
            Welcome back,
          </Text>
          <Text style={[styles.userName, { color: colors.textInverse }]}>
            {userName}!
          </Text>
          <Text style={[styles.welcomeSubtext, { color: colors.textInverse }]}>
            Find or report lost items on campus
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.lostItems}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lost Items</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>{stats.foundItems}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Found Items</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.statNumber, { color: colors.secondary }]}>{stats.myPosts}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>My Posts</Text>
          </View>
        </View>

        {/* Lost and Found Cards - Side by Side */}
        <View style={styles.cardsRow}>
          {/* Lost Card */}
          <TouchableOpacity
            style={[
              styles.squareCard,
              {
                width: cardSize,
                height: cardSize,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('LostPosts')}
            activeOpacity={0.7}
          >
            <View style={[styles.squareCardIconContainer, { backgroundColor: colors.warning + '20' }]}>
              <Text style={styles.squareCardIcon}>🔍</Text>
            </View>
            <Text style={[styles.squareCardTitle, { color: colors.text }]}>Lost</Text>
            <Text style={[styles.squareCardSubtitle, { color: colors.textSecondary }]}>
              Items
            </Text>
          </TouchableOpacity>

          {/* Found Card */}
          <TouchableOpacity
            style={[
              styles.squareCard,
              {
                width: cardSize,
                height: cardSize,
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.navigate('FoundPosts')}
            activeOpacity={0.7}
          >
            <View style={[styles.squareCardIconContainer, { backgroundColor: colors.success + '20' }]}>
              <Text style={styles.squareCardIcon}>📦</Text>
            </View>
            <Text style={[styles.squareCardTitle, { color: colors.text }]}>Found</Text>
            <Text style={[styles.squareCardSubtitle, { color: colors.textSecondary }]}>
              Items
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Posts Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Posts</Text>
            <View style={styles.headerRight}>
              <View style={styles.timeFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.timeFilterButton,
                    timeFilter === '24h' && { backgroundColor: colors.primary },
                    timeFilter !== '24h' && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setTimeFilter('24h')}
                >
                  <Text
                    style={[
                      styles.timeFilterText,
                      {
                        color: timeFilter === '24h' ? colors.textInverse : colors.textSecondary,
                        fontWeight: timeFilter === '24h' ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    24h
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.timeFilterButton,
                    timeFilter === '7d' && { backgroundColor: colors.primary },
                    timeFilter !== '7d' && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setTimeFilter('7d')}
                >
                  <Text
                    style={[
                      styles.timeFilterText,
                      {
                        color: timeFilter === '7d' ? colors.textInverse : colors.textSecondary,
                        fontWeight: timeFilter === '7d' ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    7d
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('LostPosts')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
          </View>
          {loading && recentPosts.length === 0 ? (
            <View style={styles.loadingPostsContainer}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[styles.recentPostCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => navigation.navigate('Details', { postId: post.id })}
              >
                <View style={styles.recentPostContent}>
                  <View
                    style={[
                      styles.recentPostTypeBadge,
                      {
                        backgroundColor:
                          post.type === 'Lost' ? colors.warning + '20' : colors.success + '20',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.recentPostTypeText,
                        {
                          color: post.type === 'Lost' ? colors.warning : colors.success,
                        },
                      ]}
                    >
                      {post.type}
                    </Text>
                  </View>
                  <View style={styles.recentPostInfo}>
                    <Text style={[styles.recentPostTitle, { color: colors.text }]} numberOfLines={1}>
                      {post.title}
                    </Text>
                    <Text style={[styles.recentPostTime, { color: colors.textTertiary }]}>
                      {post.time}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.arrowIcon, { color: colors.textTertiary }]}>→</Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No recent posts found
              </Text>
            </View>
          )}
        </View>

        {/* Quick Tips Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Tips</Text>
          <View style={[styles.tipsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>💡</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Add clear photos to increase chances of finding your item
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>📍</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Be specific about the location where item was lost/found
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={[styles.tipIcon, { color: colors.primary }]}>🔒</Text>
              <Text style={[styles.tipText, { color: colors.textSecondary }]}>
                Contact through app to keep your personal info private
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button - Create Post */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('CreatePost')}
        activeOpacity={0.8}
      >
        <Text style={[styles.fabText, { color: colors.textInverse }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingPostsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginBottom: 24,
  },
  squareCard: {
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  squareCardIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  squareCardIcon: {
    fontSize: 36,
  },
  squareCardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  squareCardSubtitle: {
    fontSize: 14,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  timeFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeFilterText: {
    fontSize: 12,
    fontWeight: 'normal',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  recentPostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentPostContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recentPostTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  recentPostTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  recentPostInfo: {
    flex: 1,
  },
  recentPostTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  recentPostTime: {
    fontSize: 12,
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tipsCard: {
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10,
  },
  fabText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
