import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postService } from '../lib/services/posts/postService';
import { useAppModal } from '../context/ModalContext';
import AppIcon from '../components/AppIcon';
import { radii, space, shadowSoft } from '../utils/layout';
import { ChartCard, SegmentedDonutChart } from '../components/charts';

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();
  const { showConfirm } = useAppModal();

  const userName = user?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userAvatar = user?.avatar_url || user?.user_metadata?.avatar_url;

  const [stats, setStats] = useState({
    totalPosts: 0,
    lostPosts: 0,
    foundPosts: 0,
    itemsReturned: 0,
  });
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const formatMemberSince = (date) => {
    if (!date) return 'Recently';
    const d = new Date(date);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      const [postsResult, claimedResult] = await Promise.all([
        postService.getUserPosts(user.id, {}),
        postService.getUserPosts(user.id, { status: 'Claimed' }),
      ]);

      const posts = postsResult.success && postsResult.data ? postsResult.data : [];
      const claimed = claimedResult.success && claimedResult.data ? claimedResult.data : [];

      const lostPosts = posts.filter((p) => p.type === 'Lost').length;
      const foundPosts = posts.filter((p) => p.type === 'Found').length;

      setStats({
        totalPosts: posts.length,
        lostPosts,
        foundPosts,
        itemsReturned: claimed.length,
      });

      const recentPosts = posts.slice(0, 3).map((post) => ({
        id: post.id,
        type: post.type,
        title: post.title,
        time: formatTimeAgo(post.created_at),
        status: post.status
          ? post.status.charAt(0).toUpperCase() + post.status.slice(1)
          : 'Active',
      }));
      setMyPosts(recentPosts);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    showConfirm({
      title: 'Logout',
      message: 'Are you sure you want to logout?',
      cancelText: 'Cancel',
      confirmText: 'Logout',
      destructive: true,
      onConfirm: async () => {
        await logout();
      },
    });
  };

  const gradient = colors.heroGradient || [colors.primary, colors.primaryDark];

  const donutSegments = useMemo(
    () => [
      { label: 'Lost', value: stats.lostPosts, color: colors.warning },
      { label: 'Found', value: stats.foundPosts, color: colors.success },
      { label: 'Claimed', value: stats.itemsReturned, color: colors.info },
    ],
    [stats.lostPosts, stats.foundPosts, stats.itemsReturned, colors.warning, colors.success, colors.info]
  );

  const StatCard = ({ iconName, iconColor, value, label }) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadowSoft,
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: iconColor + '18' }]}>
        <AppIcon name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={[styles.statNumber, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );

  const MenuRow = ({ iconName, iconColor, title, subtitle, onPress }) => (
    <TouchableOpacity
      style={[
        styles.menuRow,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadowSoft,
      ]}
      onPress={onPress}
      activeOpacity={0.72}
    >
      <View style={[styles.menuIconWrap, { backgroundColor: (iconColor || colors.primary) + '16' }]}>
        <AppIcon name={iconName} size={22} color={iconColor || colors.primary} />
      </View>
      <View style={styles.menuTextCol}>
        <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <AppIcon name="chevronForward" size={20} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={styles.heroTop}>
            <Text style={styles.heroTitle}>Profile</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => navigation.navigate('Settings')}
              hitSlop={12}
              accessibilityLabel="Settings"
            >
              <AppIcon name="settingsOutline" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.avatarRing, { borderColor: 'rgba(255,255,255,0.45)' }]}>
            {userAvatar ? (
              <Image source={{ uri: userAvatar }} style={styles.avatarImg} />
            ) : (
              <Text style={styles.avatarLetter}>{userName.charAt(0).toUpperCase()}</Text>
            )}
          </View>
          <Text style={styles.heroName}>{userName}</Text>
          <Text style={styles.heroEmail}>{userEmail}</Text>

          <TouchableOpacity
            style={styles.editPill}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.85}
          >
            <AppIcon name="createOutline" size={18} color="#FFFFFF" />
            <Text style={styles.editPillText}>Edit profile</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={styles.statsRow}>
          <StatCard
            iconName="layers"
            iconColor={colors.primary}
            value={stats.totalPosts}
            label="My posts"
          />
          <StatCard
            iconName="search"
            iconColor={colors.warning}
            value={stats.lostPosts}
            label="Lost"
          />
          <StatCard
            iconName="cube"
            iconColor={colors.success}
            value={stats.foundPosts}
            label="Found"
          />
        </View>

        <View style={styles.chartSection}>
          <ChartCard
            title="Post mix"
            subtitle="Lost vs found vs claimed on your account"
            colors={colors}
            style={styles.chartCardNoMargin}
          >
            <SegmentedDonutChart segments={donutSegments} colors={colors} />
          </ChartCard>
        </View>

        {stats.itemsReturned > 0 ? (
          <View style={[styles.returnedBanner, { backgroundColor: colors.success + '18' }]}>
            <AppIcon name="ribbon" size={20} color={colors.success} />
            <Text style={[styles.returnedText, { color: colors.text }]}>
              {stats.itemsReturned} returned / claimed
            </Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitleInline, { color: colors.text }]}>Recent activity</Text>
            <TouchableOpacity onPress={() => navigation.navigate('MyPosts')} hitSlop={8}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading && myPosts.length === 0 ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : myPosts.length > 0 ? (
            myPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={[
                  styles.postCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                  shadowSoft,
                ]}
                onPress={() => navigation.navigate('Details', { postId: post.id })}
                activeOpacity={0.75}
              >
                <View
                  style={[
                    styles.typePill,
                    {
                      backgroundColor:
                        post.type === 'Lost' ? colors.warning + '22' : colors.success + '22',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: post.type === 'Lost' ? colors.warning : colors.success },
                    ]}
                  >
                    {post.type}
                  </Text>
                </View>
                <View style={styles.postMid}>
                  <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={1}>
                    {post.title}
                  </Text>
                  <Text style={[styles.postMeta, { color: colors.textTertiary }]}>
                    {post.time} · {post.status}
                  </Text>
                </View>
                <AppIcon name="chevronForward" size={20} color={colors.textTertiary} />
              </TouchableOpacity>
            ))
          ) : (
            <View style={[styles.emptyCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <AppIcon name="documentTextOutline" size={40} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No posts yet</Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                Create a lost or found post from the home tab.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Shortcuts</Text>
          <MenuRow
            iconName="personOutline"
            iconColor={colors.primary}
            title="Edit profile"
            subtitle="Name, photo, and contact"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <MenuRow
            iconName="statsChart"
            iconColor={colors.secondary}
            title="My posts"
            subtitle="Manage your listings"
            onPress={() => navigation.navigate('MyPosts')}
          />
          <MenuRow
            iconName="settingsOutline"
            iconColor={colors.textTertiary}
            title="Settings"
            subtitle="Theme, account, and more"
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
              shadowSoft,
            ]}
          >
            <View style={styles.infoRow}>
              <AppIcon name="mailOutline" size={18} color={colors.textTertiary} />
              <View style={styles.infoRowText}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{userEmail}</Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <AppIcon name="calendarOutline" size={18} color={colors.textTertiary} />
              <View style={styles.infoRowText}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member since</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>
                  {formatMemberSince(user?.created_at || user?.user_metadata?.created_at)}
                </Text>
              </View>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <View style={styles.infoRow}>
              <AppIcon name="shieldCheckmark" size={18} color={colors.success} />
              <View style={styles.infoRowText}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Status</Text>
                <View style={[styles.activePill, { backgroundColor: colors.success + '22' }]}>
                  <Text style={[styles.activePillText, { color: colors.success }]}>Active</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: colors.error + '14', borderColor: colors.error + '55' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <AppIcon name="logOutOutline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>Log out</Text>
        </TouchableOpacity>

        <View style={{ height: space.xxl + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  hero: {
    marginHorizontal: space.lg,
    marginTop: space.sm,
    borderRadius: radii.xxl,
    paddingTop: space.lg,
    paddingBottom: space.xl,
    paddingHorizontal: space.lg,
    overflow: 'hidden',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: space.lg,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    alignSelf: 'center',
    marginBottom: space.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImg: { width: '100%', height: '100%' },
  avatarLetter: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: space.md,
  },
  editPill: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  editPillText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: space.sm,
    paddingHorizontal: space.lg,
    marginTop: -space.lg,
    marginBottom: space.md,
  },
  chartSection: {
    paddingHorizontal: space.lg,
    marginBottom: space.sm,
  },
  chartCardNoMargin: {
    marginBottom: 0,
  },
  statCard: {
    flex: 1,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingVertical: space.md,
    paddingHorizontal: space.sm,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  returnedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: space.lg,
    marginBottom: space.lg,
    paddingVertical: 12,
    paddingHorizontal: space.md,
    borderRadius: radii.md,
  },
  returnedText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  section: {
    paddingHorizontal: space.lg,
    marginBottom: space.xl,
  },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
    marginBottom: space.md,
  },
  sectionTitleInline: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seeAll: { fontSize: 14, fontWeight: '700' },
  loadingBox: { padding: 24, alignItems: 'center' },
  postCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: space.sm,
    gap: space.sm,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.sm,
  },
  typePillText: { fontSize: 11, fontWeight: '800' },
  postMid: { flex: 1, minWidth: 0 },
  postTitle: { fontSize: 16, fontWeight: '700' },
  postMeta: { fontSize: 12, marginTop: 2 },
  emptyCard: {
    alignItems: 'center',
    padding: space.xl,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: space.md },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 6 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: space.sm,
    gap: space.md,
  },
  menuIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTextCol: { flex: 1 },
  menuTitle: { fontSize: 16, fontWeight: '700' },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
  infoCard: {
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: space.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingVertical: 10,
  },
  infoRowText: { flex: 1 },
  infoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: '600' },
  divider: { height: StyleSheet.hairlineWidth },
  activePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radii.full,
    marginTop: 4,
  },
  activePillText: { fontSize: 12, fontWeight: '800' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: space.lg,
    paddingVertical: 16,
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  logoutText: { fontSize: 16, fontWeight: '800' },
});

export default ProfileScreen;
