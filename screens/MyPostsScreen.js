import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
import MyPostsFilterModal from '../components/MyPostsFilterModal';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';
import { postService } from '../lib/services/posts/postService';

const { width } = Dimensions.get('window');

const MyPostsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showConfirm } = useAppModal();
  const navigation = useNavigation();
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

  // Fetch user posts
  const fetchPosts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const filtersObj = {};
      
      // Apply filters for API call
      if (filters.category !== 'All') {
        filtersObj.category = filters.category;
      }
      if (filters.type !== 'All') {
        filtersObj.type = filters.type;
      }
      if (filters.status !== 'All') {
        // Database uses lowercase status, but UI shows capitalized
        // Convert UI status to database format
        const statusMap = {
          'Active': 'active',
          'Claimed': 'claimed',
          'Resolved': 'resolved',
          'Archived': 'archived',
        };
        filtersObj.status = statusMap[filters.status] || filters.status.toLowerCase();
      }

      const result = await postService.getUserPosts(user.id, filtersObj);
      
      if (result.success && result.data) {
        // Format posts for display
        const formattedPosts = result.data.map((post) => ({
          ...post,
          image: post.post_images && post.post_images.length > 0 ? post.post_images[0].image_url : null,
          tip: post.tip_amount ? `$${parseFloat(post.tip_amount).toFixed(2)}` : null,
          // Capitalize status for display
          status: post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : post.status,
        }));

        setPosts(formattedPosts);
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

  // Load posts on mount and when filters change
  useEffect(() => {
    fetchPosts();
  }, [user?.id, filters.category, filters.type, filters.status]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [user?.id, filters.category, filters.type, filters.status])
  );

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const filteredPosts = useMemo(() => {
    let filtered = [...posts];

    // Search filter (client-side for better UX)
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort filter (client-side)
    if (filters.sort === 'Newest First') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt || new Date(a.created_at);
        const dateB = b.createdAt || new Date(b.created_at);
        return dateB - dateA;
      });
    } else if (filters.sort === 'Oldest First') {
      filtered.sort((a, b) => {
        const dateA = a.createdAt || new Date(a.created_at);
        const dateB = b.createdAt || new Date(b.created_at);
        return dateA - dateB;
      });
    }

    return filtered;
  }, [posts, searchQuery, filters.sort]);

  const handleEditPost = (post) => {
    navigation.navigate('EditPost', { post });
  };

  const handleDeletePost = (post) => {
    showConfirm({
      title: 'Delete Post',
      message: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
      cancelText: 'Cancel',
      confirmText: 'Delete',
      destructive: true,
      onConfirm: async () => {
        try {
          const result = await postService.deletePost(post.id, user.id);
          if (result.success) {
            setPosts(posts.filter((p) => p.id !== post.id));
            showToast('Post deleted successfully', 'success');
          } else {
            showToast(result.error || 'Failed to delete post', 'error');
          }
        } catch (error) {
          console.error('Error deleting post:', error);
          showToast('An error occurred while deleting post', 'error');
        }
      },
    });
  };

  const renderPostCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('Details', { postId: item.id })}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, { backgroundColor: colors.background }]}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.postImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <AppIcon name="image" size={36} color={colors.textTertiary} />
          </View>
        )}
      </View>

      <View style={styles.postInfo}>
        <View style={styles.postHeader}>
          <View style={styles.typeBadge}>
            <View
              style={[
                styles.typeIndicator,
                { backgroundColor: item.type === 'Lost' ? colors.warning : colors.success },
              ]}
            />
            <Text style={[styles.typeText, { color: colors.text }]}>{item.type}</Text>
          </View>
          <View style={styles.statusBadge}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    item.status?.toLowerCase() === 'active' ? colors.success : colors.textTertiary,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.textSecondary }]}>
              {item.status?.charAt(0).toUpperCase() + item.status?.slice(1).toLowerCase() || item.status}
            </Text>
          </View>
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

        {item.tip && (
          <View style={[styles.tipContainer, { backgroundColor: colors.accent + '20' }]}>
            <View style={styles.tipRow}>
              <AppIcon name="cash" size={16} color={colors.accent} style={{ marginRight: 6 }} />
              <Text style={[styles.tipText, { color: colors.accent }]}>Reward: {item.tip}</Text>
            </View>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
              handleEditPost(item);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.editButtonText, { color: colors.textInverse }]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error }]}
            onPress={(e) => {
              e.stopPropagation();
              handleDeletePost(item);
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.deleteButtonText, { color: colors.textInverse }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const hasActiveFilters =
    filters.category !== 'All' ||
    filters.type !== 'All' ||
    filters.status !== 'All' ||
    filters.sort !== 'Newest First';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader variant="tab" title="My Posts" />

      {/* Search Bar with Filter Icon */}
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
            placeholder="Search my posts..."
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
          <AppIcon name="documentTextOutline" size={56} color={colors.textTertiary} style={{ marginBottom: 12 }} />
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchQuery.trim() || hasActiveFilters ? 'No posts found' : 'No posts yet'}
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            {searchQuery.trim() || hasActiveFilters
              ? 'Try adjusting your search or filters'
              : 'Create your first post to get started'}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <MyPostsFilterModal
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
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  filterIconButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
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
    padding: 16,
    paddingTop: 26,
  },
  postCard: {
    flexDirection: 'row',
    marginBottom: space.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    ...shadowSoft,
  },
  imageContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
  },
  postInfo: {
    flex: 1,
    padding: 12,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postDescription: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationIcon: {
    fontSize: 12,
  },
  locationText: {
    fontSize: 11,
  },
  tipContainer: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
  },
});

export default MyPostsScreen;

