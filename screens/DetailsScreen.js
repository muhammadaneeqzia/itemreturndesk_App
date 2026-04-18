import React, { useState, useEffect, useCallback } from 'react';
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
  Linking,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { postService } from '../lib/services/posts/postService';
import { chatService } from '../lib/services/chats/chatService';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';

const { width } = Dimensions.get('window');

const DetailsScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params || {};
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch post details
  const fetchPost = async () => {
    if (!postId) return;

    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  // Load post on mount
  useEffect(() => {
    fetchPost();
  }, [postId]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (postId) {
        fetchPost();
      }
    }, [postId])
  );

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPost();
    setRefreshing(false);
  };

  const handleContact = async () => {
    if (!post || !user?.id) {
      showToast('Please login to contact', 'error');
      return;
    }

    // Check if user is trying to contact themselves
    if (post.user_id === user.id) {
      showToast('This is your own post', 'error');
      return;
    }

    // Create or get conversation
    try {
      const result = await chatService.getOrCreateConversation(post.id, user.id, post.user_id);
      if (result.success && result.data) {
        // Get post owner info for navigation
        const conversationData = {
          conversationId: result.data.id,
          userId: post.user_id,
          userName: post.userName || 'User',
          userAvatar: post.userAvatar || null,
          postTitle: post.title,
          postType: post.type,
          postId: post.id,
        };
        navigation.navigate('Chat', { conversation: conversationData });
      } else {
        showToast(result.error || 'Failed to start conversation', 'error');
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      showToast('An error occurred', 'error');
    }
  };

  if (loading && !post) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.headerBlock}>
          <ScreenHeader title="Details" onBack={() => navigation.goBack()} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Post not found</Text>
        </View>
      </View>
    );
  }

  const isOwnPost = post.user_id === user?.id;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerBlock}>
        <ScreenHeader title="Details" onBack={() => navigation.goBack()} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Images Carousel */}
        {post.images && post.images.length > 0 && (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.imageCarousel}
          >
            {post.images.map((imageUri, index) => (
              <Image key={index} source={{ uri: imageUri }} style={styles.postImage} />
            ))}
          </ScrollView>
        )}

        {/* Post Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.typeBadgeContainer}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor: post.type === 'Lost' ? colors.warning + '20' : colors.success + '20',
                },
              ]}
            >
              <View
                style={[
                  styles.typeIndicator,
                  {
                    backgroundColor: post.type === 'Lost' ? colors.warning : colors.success,
                  },
                ]}
              />
              <Text
                style={[
                  styles.typeText,
                  {
                    color: post.type === 'Lost' ? colors.warning : colors.success,
                  },
                ]}
              >
                {post.type}
              </Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: colors.primaryLight }]}>
              <Text style={[styles.categoryText, { color: colors.primary }]}>{post.category}</Text>
            </View>
          </View>

          <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>{post.time}</Text>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Description</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{post.description}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Location</Text>
            <View style={styles.locationRow}>
              <AppIcon name="locationOutline" size={16} color={colors.textTertiary} style={{ marginRight: 6 }} />
              <Text style={[styles.detailValue, { color: colors.text }]}>{post.location}</Text>
            </View>
          </View>

          {post.tip && (
            <View style={[styles.tipContainer, { backgroundColor: colors.accent + '20' }]}>
              <AppIcon name="cash" size={18} color={colors.accent} style={{ marginRight: 8 }} />
              <Text style={[styles.tipText, { color: colors.accent }]}>Reward Offered: {post.tip}</Text>
            </View>
          )}

          {/* Posted By */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.postedByRow}>
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Posted by</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{post.userName || 'User'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        {!isOwnPost && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={[styles.contactButton, { backgroundColor: colors.primary }]}
              onPress={handleContact}
              activeOpacity={0.8}
            >
              <AppIcon name="chatbubbles" size={22} color={colors.textInverse} />
              <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>Contact</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  headerBlock: {
    marginBottom: space.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: space.md,
    paddingBottom: 20,
  },
  imageCarousel: {
    width: '100%',
    height: 300,
    marginBottom: space.lg,
  },
  postImage: {
    width: width,
    height: 300,
    resizeMode: 'cover',
  },
  detailsCard: {
    marginHorizontal: space.md,
    marginTop: space.lg,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    ...shadowSoft,
  },
  typeBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 14,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'normal',
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationIcon: {
    fontSize: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postedByRow: {
    marginTop: 8,
  },
  actionButtonsContainer: {
    marginHorizontal: space.md,
    marginBottom: space.md,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: space.md,
    borderRadius: radii.md,
    gap: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DetailsScreen;
