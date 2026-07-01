import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { useAppModal } from '../context/ModalContext';
import MyPostsFilterModal from '../components/MyPostsFilterModal';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils';
import { postService } from '../lib/services/posts/postService';
import { openPostChat } from '../lib/postChat';

const CARD_IMAGE_H = 160;

function statusTint(status, colors) {
  const s = (status || 'active').toLowerCase();
  if (s === 'claimed' || s === 'resolved') return colors.success;
  if (s === 'archived') return colors.textTertiary;
  return colors.info;
}

function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

const MyPostsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm, showModal } = useAppModal();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    type: 'All',
    status: 'All',
    sort: 'Newest First',
  });

  const fetchPosts = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const filtersObj = {};
      if (filters.category !== 'All') filtersObj.category = filters.category;
      if (filters.type !== 'All') filtersObj.type = filters.type;
      if (filters.status !== 'All') {
        const statusMap = {
          Active: 'active',
          Claimed: 'claimed',
          Resolved: 'resolved',
          Archived: 'archived',
        };
        filtersObj.status = statusMap[filters.status] || filters.status.toLowerCase();
      }

      const result = await postService.getUserPosts(user.id, filtersObj);
      if (result.success && result.data) {
        setPosts(
          result.data.map((post) => ({
            ...post,
            image: post.post_images?.[0]?.image_url || null,
            tip: post.tip_amount ? `$${parseFloat(post.tip_amount).toFixed(2)}` : null,
            status: post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Active',
            timeAgo: formatTimeAgo(post.created_at),
          }))
        );
      } else {
        showToast(result.error || 'Failed to load posts', 'error');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      showToast('An error occurred while loading posts', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id, filters.category, filters.type, filters.status]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [user?.id, filters.category, filters.type, filters.status])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (filters.sort === 'Newest First') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (filters.sort === 'Oldest First') {
      filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    return filtered;
  }, [posts, searchQuery, filters.sort]);

  const summary = useMemo(() => {
    const lost = posts.filter((p) => p.type === 'Lost').length;
    const found = posts.filter((p) => p.type === 'Found').length;
    const active = posts.filter((p) => (p.status || '').toLowerCase() === 'active').length;
    return { total: posts.length, lost, found, active };
  }, [posts]);

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.sort !== 'Newest First';

  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (filters.type !== 'All') chips.push(filters.type);
    if (filters.category !== 'All') chips.push(filters.category);
    if (filters.status !== 'All') chips.push(filters.status);
    if (filters.sort !== 'Newest First') chips.push(filters.sort);
    return chips;
  }, [filters]);

  const handleEditPost = (post) => navigation.navigate('EditPost', { post });

  const handleChatPost = async (post, e) => {
    e?.stopPropagation?.();
    await openPostChat({ post, user, navigation, showToast, showModal });
  };

  const handleDeletePost = (post) => {
    showConfirm({
      title: 'Delete Post',
      message: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
      cancelText: 'Cancel',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        const result = await postService.deletePost(post.id, user.id);
        if (result.success) {
          setPosts(posts.filter((p) => p.id !== post.id));
          showToast('Post deleted successfully', 'success');
        } else {
          showToast(result.error || 'Failed to delete post', 'error');
        }
      },
    });
  };

  const goCreatePost = () => {
    const parent = navigation.getParent();
    if (parent) parent.navigate('CreatePost');
    else navigation.navigate('CreatePost');
  };

  const StatPill = ({ label, value, accent }) => (
    <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color: accent || colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );

  const renderPostCard = ({ item }) => {
    const isLost = item.type === 'Lost';
    const typeColor = isLost ? colors.warning : colors.success;
    const thumb = item.image || item.post_images?.[0]?.image_url;
    const statusColor = statusTint(item.status, colors);
    const statusLabel =
      item.status?.charAt(0).toUpperCase() + item.status?.slice(1).toLowerCase() || 'Active';

    return (
      <TouchableOpacity
        style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => navigation.navigate('Details', { postId: item.id })}
        activeOpacity={0.9}
      >
        <View style={[styles.accentBar, { backgroundColor: typeColor }]} />

        <View style={styles.cardInner}>
          <View style={[styles.imageWrap, { backgroundColor: colors.background }]}>
            {thumb ? (
              <Image source={{ uri: thumb }} style={styles.postImage} />
            ) : (
              <LinearGradient
                colors={[colors.primary + '28', colors.primary + '08']}
                style={styles.placeholderImage}
              >
                <AppIcon name="cubeOutline" size={44} color={colors.primary} />
              </LinearGradient>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.55)']}
              style={styles.imageGradient}
            />
            <View style={styles.imageBadges}>
              <View style={[styles.typePill, { backgroundColor: typeColor }]}>
                <Text style={styles.typePillText}>{item.type}</Text>
              </View>
              <View style={[styles.statusPill, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.statusPillText, { color: colors.text }]}>{statusLabel}</Text>
              </View>
            </View>
            {item.timeAgo ? (
              <Text style={styles.timeOnImage}>{item.timeAgo}</Text>
            ) : null}
          </View>

          <View style={styles.postBody}>
            <Text style={[styles.postTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </Text>
            <Text style={[styles.postDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </Text>

            <View style={styles.metaRow}>
              <View style={[styles.categoryBadge, { backgroundColor: colors.primary + '12' }]}>
                <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
              </View>
              <View style={styles.locationRow}>
                <AppIcon name="locationOutline" size={13} color={colors.textTertiary} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            </View>

            {item.tip && (
              <View style={[styles.tipBanner, { backgroundColor: colors.accent + '12', borderColor: colors.accent + '30' }]}>
                <AppIcon name="cash" size={16} color={colors.accent} />
                <Text style={[styles.tipText, { color: colors.accent }]}>Reward {item.tip}</Text>
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.chatButton, { backgroundColor: colors.primary }]}
                onPress={(e) => handleChatPost(item, e)}
                activeOpacity={0.88}
              >
                <AppIcon name="chatbubbles" size={18} color={colors.textInverse} />
                <Text style={[styles.chatButtonText, { color: colors.textInverse }]}>Messages</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.secondaryBtn, { backgroundColor: colors.info + '14', borderColor: colors.info + '35' }]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleEditPost(item);
                }}
                activeOpacity={0.88}
              >
                <AppIcon name="createOutline" size={18} color={colors.info} />
                <Text style={[styles.secondaryBtnText, { color: colors.info }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: colors.error + '10', borderColor: colors.error + '28' }]}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeletePost(item);
                }}
                activeOpacity={0.88}
              >
                <AppIcon name="trash" size={18} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <LinearGradient
        colors={[colors.primary + '18', colors.primary + '04']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroBanner, { borderColor: colors.primary + '22' }]}
      >
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Your listings</Text>
          <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
            {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
            {hasActiveFilters ? ' · filtered' : ' · manage & chat'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createBtn, { backgroundColor: colors.primary }]}
          onPress={goCreatePost}
          activeOpacity={0.88}
        >
          <AppIcon name="add" size={22} color={colors.textInverse} />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.statsRow}>
        <StatPill label="Total" value={summary.total} accent={colors.primary} />
        <StatPill label="Lost" value={summary.lost} accent={colors.warning} />
        <StatPill label="Found" value={summary.found} accent={colors.success} />
        <StatPill label="Active" value={summary.active} accent={colors.info} />
      </View>

      {activeFilterChips.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          {activeFilterChips.map((chip) => (
            <View key={chip} style={[styles.filterChip, { backgroundColor: colors.primary + '14' }]}>
              <Text style={[styles.filterChipText, { color: colors.primary }]}>{chip}</Text>
            </View>
          ))}
          <TouchableOpacity onPress={() => setShowFilterModal(true)}>
            <Text style={[styles.clearFilters, { color: colors.primary }]}>Edit filters</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        variant="tab"
        title="My Posts"
        rightElement={
          <TouchableOpacity onPress={goCreatePost} hitSlop={10} style={styles.headerAdd}>
            <AppIcon name="add" size={26} color={colors.primary} />
          </TouchableOpacity>
        }
      />

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <View style={styles.searchInputContainer}>
          <View style={[styles.searchField, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <AppIcon name="search" size={18} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by title or description..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              {
                backgroundColor: hasActiveFilters ? colors.primary : colors.background,
                borderColor: hasActiveFilters ? colors.primary : colors.border,
              },
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <AppIcon
              name="options"
              size={22}
              color={hasActiveFilters ? colors.textInverse : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingLabel, { color: colors.textTertiary }]}>Loading your posts…</Text>
        </View>
      ) : filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={ListHeader}
          contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <LinearGradient
            colors={[colors.primary + '16', colors.primary + '04']}
            style={styles.emptyIconWrap}
          >
            <AppIcon name="documentTextOutline" size={44} color={colors.primary} />
          </LinearGradient>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            {searchQuery.trim() || hasActiveFilters ? 'No matching posts' : 'No posts yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            {searchQuery.trim() || hasActiveFilters
              ? 'Try a different search or reset your filters'
              : 'Post a lost or found item to get started'}
          </Text>
          {!searchQuery.trim() && !hasActiveFilters && (
            <TouchableOpacity
              style={[styles.emptyCta, { backgroundColor: colors.primary }]}
              onPress={goCreatePost}
              activeOpacity={0.88}
            >
              <AppIcon name="add" size={20} color={colors.textInverse} />
              <Text style={[styles.emptyCtaText, { color: colors.textInverse }]}>Create Post</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <MyPostsFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={setFilters}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerAdd: { padding: 4 },
  searchContainer: {
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  listContent: { paddingHorizontal: space.md, paddingTop: space.sm },
  listHeader: { marginBottom: space.md, gap: space.md },
  heroBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: space.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
  },
  heroCopy: { flex: 1 },
  heroTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  heroSub: { fontSize: 13, marginTop: 4, fontWeight: '500' },
  createBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadowSoft,
  },
  statsRow: { flexDirection: 'row', gap: 8 },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadowSoft,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },
  chipsScroll: { marginTop: -4 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
    marginRight: 8,
  },
  filterChipText: { fontSize: 12, fontWeight: '700' },
  clearFilters: { fontSize: 13, fontWeight: '600', paddingVertical: 6 },

  postCard: {
    flexDirection: 'row',
    marginBottom: space.md,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...shadowSoft,
  },
  accentBar: { width: 4 },
  cardInner: { flex: 1 },
  imageWrap: { width: '100%', height: CARD_IMAGE_H, position: 'relative' },
  postImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderImage: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  imageGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
  },
  imageBadges: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  typePillText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radii.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: 11, fontWeight: '700' },
  timeOnImage: {
    position: 'absolute',
    bottom: 10,
    left: 14,
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '600',
  },
  postBody: { padding: space.md, gap: 8 },
  postTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.35, lineHeight: 24 },
  postDescription: { fontSize: 14, lineHeight: 21 },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 2,
  },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radii.full },
  categoryText: { fontSize: 11, fontWeight: '700' },
  locationRow: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  locationText: { fontSize: 12, flexShrink: 1 },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  tipText: { fontSize: 13, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  chatButton: {
    flex: 1.35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: radii.md,
    minHeight: 48,
  },
  chatButtonText: { fontSize: 15, fontWeight: '800' },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingHorizontal: 14,
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
  },
  secondaryBtnText: { fontSize: 14, fontWeight: '700' },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingLabel: { fontSize: 14 },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emptyIconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyText: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptySubtext: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 20 },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radii.lg,
  },
  emptyCtaText: { fontSize: 16, fontWeight: '700' },
});

export default MyPostsScreen;
