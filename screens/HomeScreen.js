import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postService } from '../lib/services/posts/postService';
import { space } from '../utils';
import {
  WelcomeHero,
  StatStrip,
  QuickAccessTile,
  PillSegmented,
  RecentPostRow,
  TipsPanel,
  HomeFAB,
  SectionTitleRow,
} from '../components/ui';
import { ChartCard, AnimatedBarChart } from '../components/charts';

const { width } = Dimensions.get('window');
const cardSize = (width - space.lg * 2 - space.md) / 2;

const QUICK_TIPS = [
  { iconName: 'bulbOutline', text: 'Add clear photos to increase chances of finding your item' },
  { iconName: 'locationOutline', text: 'Be specific about the location where item was lost or found' },
  { iconName: 'lockClosedOutline', text: 'Contact through the app to keep your personal info private' },
];

const TIME_OPTIONS = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
];

const HomeScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  const [stats, setStats] = useState({
    lostItems: 0,
    foundItems: 0,
    myPosts: 0,
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [timeFilter, setTimeFilter] = useState('24h');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchStats(), fetchRecentPosts()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchStats(), fetchRecentPosts()]);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [timeFilter, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [timeFilter, user?.id])
  );

  const fabStyle = useMemo(
    () => ({
      bottom: Math.max(insets.bottom, 10) + 58,
      right: space.lg,
      zIndex: 10,
    }),
    [insets.bottom]
  );

  const snapshotBars = useMemo(
    () => [
      { label: 'Lost', value: Math.max(stats.lostItems, 0), color: colors.warning },
      { label: 'Found', value: Math.max(stats.foundItems, 0), color: colors.success },
      { label: 'Mine', value: Math.max(stats.myPosts, 0), color: colors.primary },
    ],
    [stats.lostItems, stats.foundItems, stats.myPosts, colors.warning, colors.success, colors.primary]
  );

  if (loading && recentPosts.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        >
          <WelcomeHero colors={colors} userName={userName} />

          <View style={styles.block}>
            <StatStrip
              colors={colors}
              lostItems={stats.lostItems}
              foundItems={stats.foundItems}
              myPosts={stats.myPosts}
            />
          </View>

          <ChartCard
            title="Your snapshot"
            subtitle="How your posts sit on campus right now"
            colors={colors}
            style={styles.chartCard}
          >
            <AnimatedBarChart data={snapshotBars} colors={colors} height={168} />
          </ChartCard>

          <View style={styles.cardsRow}>
            <QuickAccessTile
              width={cardSize}
              height={cardSize}
              colors={colors}
              iconName="search"
              iconColor={colors.warning}
              title="Lost"
              subtitle="Browse items"
              tint={colors.warning + '24'}
              onPress={() => navigation.navigate('LostPosts')}
            />
            <QuickAccessTile
              width={cardSize}
              height={cardSize}
              colors={colors}
              iconName="cube"
              iconColor={colors.success}
              title="Found"
              subtitle="Browse items"
              tint={colors.success + '24'}
              onPress={() => navigation.navigate('FoundPosts')}
            />
          </View>

          <View style={styles.section}>
            <SectionTitleRow
              title="Recent posts"
              colors={colors}
              right={
                <>
                  <PillSegmented colors={colors} value={timeFilter} onChange={setTimeFilter} options={TIME_OPTIONS} />
                  <TouchableOpacity onPress={() => navigation.navigate('LostPosts')} hitSlop={8}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
                  </TouchableOpacity>
                </>
              }
            />
            {loading && recentPosts.length === 0 ? (
              <View style={styles.loadingPosts}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            ) : recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <RecentPostRow
                  key={post.id}
                  colors={colors}
                  post={post}
                  onPress={() => navigation.navigate('Details', { postId: post.id })}
                />
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent posts</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <SectionTitleRow title="Quick tips" colors={colors} />
            <TipsPanel colors={colors} tips={QUICK_TIPS} />
          </View>

          <View style={styles.bottomPad} />
        </ScrollView>

        <HomeFAB colors={colors} onPress={() => navigation.navigate('CreatePost')} style={fabStyle} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    paddingHorizontal: space.lg,
    paddingTop: space.md,
    paddingBottom: 120,
  },
  block: {
    marginTop: space.lg,
    marginBottom: space.lg,
  },
  chartCard: {
    marginBottom: space.md,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: space.md,
    marginBottom: space.xl,
  },
  section: {
    marginBottom: space.xl,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  loadingPosts: {
    padding: space.lg,
    alignItems: 'center',
  },
  empty: {
    paddingVertical: space.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomPad: {
    height: space.md,
  },
});

export default HomeScreen;
