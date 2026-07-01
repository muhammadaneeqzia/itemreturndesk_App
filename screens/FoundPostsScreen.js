import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { useAppModal } from '../context/ModalContext';
import FilterModal from '../components/FilterModal';
import { postService } from '../lib/services/posts/postService';
import { openPostChat } from '../lib/postChat';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils';

const { width } = Dimensions.get('window');

const FoundPostsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { showToast } = useToast();
  const { showModal } = useAppModal();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState({
    category: 'All',
    time: 'All Time',
    sort: 'Newest First',
    location: '',
  });

  // Fetch posts from Supabase
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const filtersObj = {
        category: filters.category !== 'All' ? filters.category : undefined,
        location: filters.location || undefined,
        search: searchQuery.trim() || undefined,
        time: filters.time !== 'All Time' ? filters.time : undefined,
        sort: filters.sort,
      };

      const result = await postService.getPostsByType('Found', filtersObj);
      if (result.success && result.data) {
        setPosts(result.data);
      } else {
        showToast(result.error || 'Failed to load posts', 'error');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error fetching found posts:', error);
      showToast('An error occurred while loading posts', 'error');
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load posts on mount and when filters change
  useEffect(() => {
    fetchPosts();
  }, [filters.category, filters.time, filters.sort, filters.location]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [filters.category, filters.time, filters.sort, filters.location])
  );

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  // Client-side search filter (for better UX while typing)
  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Search filter (client-side for instant results)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [posts, searchQuery]);

  const handleChat = async (item, e) => {
    e?.stopPropagation?.();
    await openPostChat({ post: item, user, navigation, showToast, showModal });
  };

  const renderPostCard = ({ item }) => {
    const thumb = item.image || item.post_images?.[0]?.image_url;
    const isOwn = item.user_id === user?.id;

    return (
    <TouchableOpacity
      style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Details', { postId: item.id })}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
        {thumb ? (
          <Image source={{ uri: thumb }} style={styles.postImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <AppIcon name="image" size={36} color={colors.textTertiary} />
          </View>
        )}
      </View>

      <View style={styles.postInfo}>
        <View style={styles.postHeader}>
          <View style={styles.typeBadge}>
            <View style={[styles.typeIndicator, { backgroundColor: colors.success }]} />
            <Text style={[styles.typeText, { color: colors.text }]}>{item.type}</Text>
          </View>
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>{item.time}</Text>
        </View>

        <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.postDescription, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.postFooter}>
          <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.categoryText, { color: colors.primary }]}>{item.category}</Text>
          </View>
          <View style={styles.locationContainer}>
            <AppIcon name="locationOutline" size={14} color={colors.textTertiary} style={{ marginRight: 4 }} />
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              {item.location}
            </Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.claimButton, { backgroundColor: colors.primary }]}
            onPress={(e) => handleChat(item, e)}
          >
            <AppIcon name="chatbubbles" size={18} color={colors.textInverse} style={{ marginRight: 6 }} />
            <Text style={[styles.claimButtonText, { color: colors.textInverse }]}>
              {isOwn ? 'Messages' : 'Chat'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.reportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => {
              e.stopPropagation();
              navigation.navigate('ReportPost', { post: item });
            }}
          >
            <AppIcon name="warning" size={22} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters = filters.category !== 'All' || filters.time !== 'All Time' || filters.sort !== 'Newest First';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Found Items" onBack={() => navigation.goBack()} />

      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      >
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[
              styles.searchInput,
              {
                backgroundColor: colors.background,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Search found items..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={[
              styles.filterIconButton,
              { backgroundColor: hasActiveFilters ? colors.primary : colors.background },
              hasActiveFilters && { borderColor: colors.primary },
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <AppIcon
              name="options"
              size={22}
              color={hasActiveFilters ? colors.textInverse : colors.textSecondary}
            />
            {hasActiveFilters && (
              <View style={[styles.filterBadge, { backgroundColor: colors.textInverse }]} />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts List */}
      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredPosts.length > 0 ? (
        <FlatList
          data={filteredPosts}
          renderItem={renderPostCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <AppIcon name="cubeOutline" size={56} color={colors.textTertiary} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No found items
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            {searchQuery.trim() ? 'Try adjusting your search' : 'Try adjusting your filters'}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: space.md,
    paddingTop: space.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    fontSize: 16,
  },
  filterIconButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  filterIcon: {
    fontSize: 20,
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    padding: 15,
    paddingTop: 25,
    paddingBottom: 80,
  },
  postCard: {
    marginBottom: space.md,
    borderRadius: radii.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    ...shadowSoft,
  },
  imageContainer: {
    width: '100%',
    height: 200,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 50,
  },
  postInfo: {
    padding: 15,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  timeText: {
    fontSize: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  claimButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  claimButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reportButton: {
    width: 50,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reportButtonText: {
    fontSize: 18,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default FoundPostsScreen;

