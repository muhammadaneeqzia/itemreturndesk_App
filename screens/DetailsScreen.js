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
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { useAppModal } from '../context/ModalContext';
import { postService } from '../lib/services/posts/postService';
import { openPostChat } from '../lib/postChat';
import AppIcon from '../components/AppIcon';
import { radii, shadowSoft, shadowMedium, space } from '../utils';

const { width } = Dimensions.get('window');
const HERO_HEIGHT = 340;
const THUMB_SIZE = 64;

function statusColor(status, colors) {
  const s = (status || 'active').toLowerCase();
  if (s === 'claimed' || s === 'resolved') return colors.success;
  if (s === 'archived') return colors.textTertiary;
  return colors.info;
}

const DetailsScreen = () => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showModal } = useAppModal();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { postId } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);

  const fetchPost = async (silent = false) => {
    if (!postId) return;
    try {
      if (!silent) setLoading(true);
      const result = await postService.getPostById(postId);
      if (result.success && result.data) {
        setPost(result.data);
      } else {
        showToast(result.error || 'Failed to load post', 'error');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      showToast('An error occurred while loading post', 'error');
      navigation.goBack();
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  useFocusEffect(
    useCallback(() => {
      if (postId) fetchPost(true);
    }, [postId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPost(true);
    setRefreshing(false);
  };

  const handleChat = async () => {
    if (!post || chatLoading) return;
    setChatLoading(true);
    try {
      await openPostChat({ post, user, navigation, showToast, showModal });
    } finally {
      setChatLoading(false);
    }
  };

  const images = useMemo(() => {
    if (!post) return [];
    if (post.images?.length) return post.images;
    if (post.image) return [post.image];
    return [];
  }, [post]);

  if (loading && !post) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textTertiary }]}>Loading details…</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.fallbackHeader, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity
            style={[styles.glassBtn, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
          >
            <AppIcon name="arrowBack" size={22} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.centered}>
          <AppIcon name="alertCircle" size={48} color={colors.textTertiary} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Post not found</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            This listing may have been removed.
          </Text>
        </View>
      </View>
    );
  }

  const isOwnPost = post.user_id === user?.id;
  const isLost = post.type === 'Lost';
  const typeColor = isLost ? colors.warning : colors.success;
  const gradient = colors.heroGradient || [colors.primary, colors.primaryDark];
  const statusLabel = post.status
    ? post.status.charAt(0).toUpperCase() + post.status.slice(1)
    : 'Active';
  const statusTint = statusColor(post.status, colors);

  const SectionCard = ({ children, style }) => (
    <View
      style={[
        styles.sectionCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        shadowSoft,
        style,
      ]}
    >
      {children}
    </View>
  );

  const SectionLabel = ({ title }) => (
    <View style={styles.sectionLabelRow}>
      <View style={[styles.sectionAccent, { backgroundColor: colors.primary }]} />
      <Text style={[styles.sectionLabel, { color: colors.text }]}>{title}</Text>
    </View>
  );

  const DetailTile = ({ iconName, label, value, accent }) => (
    <View style={[styles.detailTile, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={[styles.detailIconWrap, { backgroundColor: (accent || colors.primary) + '14' }]}>
        <AppIcon name={iconName} size={18} color={accent || colors.primary} />
      </View>
      <Text style={[styles.detailTileLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailTileValue, { color: colors.text }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 108 }}
      >
        {/* ── Hero gallery ── */}
        <View style={styles.heroWrap}>
          {images.length > 0 ? (
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width));
              }}
            >
              {images.map((uri, index) => (
                <Image key={`${uri}-${index}`} source={{ uri }} style={styles.heroImage} />
              ))}
            </ScrollView>
          ) : (
            <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroPlaceholder}>
              <View style={styles.placeholderIconRing}>
                <AppIcon name="cubeOutline" size={40} color="rgba(255,255,255,0.95)" />
              </View>
              <Text style={styles.heroPlaceholderText}>No photos attached</Text>
            </LinearGradient>
          )}

          <LinearGradient
            colors={['rgba(0,0,0,0.45)', 'transparent', 'rgba(0,0,0,0.75)']}
            locations={[0, 0.35, 1]}
            style={StyleSheet.absoluteFill}
          />

          {/* Top actions */}
          <View style={[styles.topBar, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.glassBtn} onPress={() => navigation.goBack()} hitSlop={12}>
              <AppIcon name="arrowBack" size={22} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              {images.length > 0 && (
                <View style={styles.imageCounter}>
                  <AppIcon name="images" size={14} color="#FFF" />
                  <Text style={styles.imageCounterText}>
                    {imageIndex + 1}/{images.length}
                  </Text>
                </View>
              )}
              {isOwnPost && (
                <TouchableOpacity
                  style={styles.glassBtn}
                  onPress={() => navigation.navigate('EditPost', { post })}
                >
                  <AppIcon name="createOutline" size={20} color="#FFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Type ribbon on hero */}
          <View style={styles.heroRibbon}>
            <View style={[styles.typeRibbon, { backgroundColor: typeColor }]}>
              <Text style={styles.typeRibbonText}>{post.type}</Text>
            </View>
            <View style={[styles.statusRibbon, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusTint }]} />
              <Text style={[styles.statusRibbonText, { color: colors.text }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
            style={[styles.thumbStripWrap, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          >
            {images.map((uri, i) => (
              <TouchableOpacity
                key={`thumb-${i}`}
                onPress={() => setImageIndex(i)}
                activeOpacity={0.85}
                style={[
                  styles.thumb,
                  i === imageIndex && { borderColor: colors.primary, borderWidth: 2.5 },
                ]}
              >
                <Image source={{ uri }} style={styles.thumbImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <View style={styles.body}>
          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={[styles.categoryEyebrow, { color: colors.primary }]}>{post.category}</Text>
            <Text style={[styles.mainTitle, { color: colors.text }]}>{post.title}</Text>
            <View style={styles.titleMeta}>
              <AppIcon name="calendarOutline" size={14} color={colors.textTertiary} />
              <Text style={[styles.titleMetaText, { color: colors.textTertiary }]}>Posted {post.time}</Text>
            </View>
          </View>

          {/* Reward */}
          {post.tip && (
            <LinearGradient
              colors={isDark ? [colors.accent + '28', colors.accent + '10'] : [colors.accent + '22', colors.accent + '08']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.rewardCard, { borderColor: colors.accent + '35' }]}
            >
              <View style={[styles.rewardIconCircle, { backgroundColor: colors.accent + '25' }]}>
                <AppIcon name="cash" size={24} color={colors.accent} />
              </View>
              <View style={styles.rewardCopy}>
                <Text style={[styles.rewardEyebrow, { color: colors.accent }]}>Reward offered</Text>
                <Text style={[styles.rewardAmount, { color: colors.text }]}>{post.tip}</Text>
                <Text style={[styles.rewardHint, { color: colors.textSecondary }]}>
                  For helping return this item safely
                </Text>
              </View>
            </LinearGradient>
          )}

          {/* Description */}
          <SectionCard>
            <SectionLabel title="About this item" />
            <Text style={[styles.description, { color: colors.textSecondary }]}>{post.description}</Text>
          </SectionCard>

          {/* Details grid */}
          <SectionLabel title="Key details" />
          <View style={styles.detailGrid}>
            <DetailTile iconName="locationOutline" label="Location" value={post.location} />
            <DetailTile iconName="layersOutline" label="Category" value={post.category} accent={typeColor} />
            <DetailTile
              iconName={isLost ? 'search' : 'cube'}
              label="Listing type"
              value={post.type}
              accent={typeColor}
            />
            <DetailTile iconName="flag" label="Status" value={statusLabel} accent={statusTint} />
          </View>

          {/* Poster */}
          <SectionCard style={{ marginTop: space.md }}>
            <SectionLabel title="Posted by" />
            <View style={styles.posterRow}>
              <View style={[styles.avatarRing, { borderColor: colors.primary + '30' }]}>
                {post.userAvatar ? (
                  <Image source={{ uri: post.userAvatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatarFallback, { backgroundColor: colors.primary + '18' }]}>
                    <AppIcon name="person" size={30} color={colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.posterCopy}>
                <Text style={[styles.posterName, { color: colors.text }]}>{post.userName || 'User'}</Text>
                <Text style={[styles.posterSub, { color: colors.textSecondary }]}>
                  {isOwnPost ? 'You published this listing' : 'Campus member · Contact in-app'}
                </Text>
              </View>
              {isOwnPost && (
                <View style={[styles.ownBadge, { backgroundColor: colors.primary + '12' }]}>
                  <Text style={[styles.ownBadgeText, { color: colors.primary }]}>You</Text>
                </View>
              )}
            </View>
          </SectionCard>

          {/* Safety note */}
          <View style={[styles.safetyCard, { backgroundColor: colors.surfaceMuted, borderColor: colors.border }]}>
            <AppIcon name="shieldCheckmark" size={20} color={colors.primary} />
            <Text style={[styles.safetyText, { color: colors.textSecondary }]}>
              Meet in a public campus area. Use in-app chat first — avoid sharing personal details in the post.
            </Text>
          </View>

          {!isOwnPost && (
            <TouchableOpacity
              style={[styles.reportLink, { borderColor: colors.border }]}
              onPress={() => navigation.navigate('ReportPost', { post })}
              activeOpacity={0.7}
            >
              <AppIcon name="warning" size={18} color={colors.error} />
              <Text style={[styles.reportLinkText, { color: colors.error }]}>Report this post</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Bottom action bar */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 14),
          },
          Platform.OS === 'ios' ? shadowMedium : shadowSoft,
        ]}
      >
        <View style={styles.bottomInner}>
          <View style={styles.bottomPriceCol}>
            <Text style={[styles.bottomEyebrow, { color: colors.textTertiary }]}>
              {isOwnPost ? 'Your listing' : isLost ? 'Lost item' : 'Found item'}
            </Text>
            <Text style={[styles.bottomTitle, { color: colors.text }]} numberOfLines={1}>
              {post.tip ? `Reward ${post.tip}` : post.category}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.primaryCta,
              { backgroundColor: colors.primary, opacity: chatLoading ? 0.8 : 1 },
            ]}
            onPress={handleChat}
            disabled={chatLoading}
            activeOpacity={0.88}
          >
            {chatLoading ? (
              <ActivityIndicator color={colors.textInverse} size="small" />
            ) : (
              <>
                <AppIcon name="chatbubbles" size={20} color={colors.textInverse} />
                <Text style={[styles.primaryCtaText, { color: colors.textInverse }]}>
                  {isOwnPost ? 'Messages' : 'Chat'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, marginTop: 8 },
  fallbackHeader: { paddingHorizontal: space.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },

  heroWrap: {
    width: '100%',
    height: HERO_HEIGHT,
    backgroundColor: '#0f1419',
  },
  heroImage: { width, height: HERO_HEIGHT, resizeMode: 'cover' },
  heroPlaceholder: {
    width: '100%',
    height: HERO_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  placeholderIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlaceholderText: { color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: '600' },

  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    zIndex: 3,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  glassBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  imageCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radii.full,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  imageCounterText: { color: '#FFF', fontSize: 13, fontWeight: '700' },

  heroRibbon: {
    position: 'absolute',
    bottom: space.lg,
    left: space.md,
    flexDirection: 'row',
    gap: 8,
    zIndex: 2,
  },
  typeRibbon: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  typeRibbonText: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.6 },
  statusRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radii.full,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusRibbonText: { fontSize: 12, fontWeight: '700' },

  thumbStripWrap: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxHeight: THUMB_SIZE + 24,
  },
  thumbStrip: {
    paddingHorizontal: space.md,
    paddingVertical: 12,
    gap: 10,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radii.sm,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbImg: { width: '100%', height: '100%' },

  body: { paddingHorizontal: space.md, paddingTop: space.lg },

  titleBlock: { marginBottom: space.lg },
  categoryEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 34,
    marginBottom: 10,
  },
  titleMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titleMetaText: { fontSize: 13, fontWeight: '500' },

  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: space.lg,
  },
  rewardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardCopy: { flex: 1 },
  rewardEyebrow: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  rewardAmount: { fontSize: 24, fontWeight: '800', marginTop: 2 },
  rewardHint: { fontSize: 12, marginTop: 4 },

  sectionCard: {
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.lg,
    marginBottom: space.md,
  },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: space.sm },
  sectionAccent: { width: 3, height: 16, borderRadius: 2 },
  sectionLabel: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  description: { fontSize: 16, lineHeight: 26, letterSpacing: 0.1 },

  detailGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: space.md,
  },
  detailTile: {
    width: (width - space.md * 2 - 10) / 2,
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  detailIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  detailTileLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailTileValue: { fontSize: 14, fontWeight: '700', lineHeight: 19 },

  posterRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    padding: 2,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%', borderRadius: 26 },
  avatarFallback: {
    flex: 1,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterCopy: { flex: 1 },
  posterName: { fontSize: 17, fontWeight: '700', marginBottom: 3 },
  posterSub: { fontSize: 13, lineHeight: 18 },
  ownBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radii.full,
  },
  ownBadgeText: { fontSize: 12, fontWeight: '800' },

  safetyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: space.sm,
    marginBottom: space.md,
  },
  safetyText: { flex: 1, fontSize: 13, lineHeight: 20 },

  reportLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.sm,
  },
  reportLinkText: { fontSize: 14, fontWeight: '600' },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 14,
    paddingHorizontal: space.md,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bottomPriceCol: { flex: 1, minWidth: 0 },
  bottomEyebrow: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  bottomTitle: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  primaryCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: radii.lg,
    minWidth: 130,
  },
  primaryCtaText: { fontSize: 16, fontWeight: '800' },
});

export default DetailsScreen;
