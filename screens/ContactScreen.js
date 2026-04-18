import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { useAppModal } from '../context/ModalContext';
import { postService } from '../lib/services/posts/postService';
import { chatService } from '../lib/services/chats/chatService';
import { userService } from '../lib/services/users/userService';
import MatchingSuggestions from '../components/MatchingSuggestions';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';

const { width } = Dimensions.get('window');

const ContactScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showAlert } = useAppModal();
  const navigation = useNavigation();
  const route = useRoute();
  const { post: initialPost, postId } = route.params || {};
  const [post, setPost] = useState(initialPost);
  const [loading, setLoading] = useState(!initialPost);
  const [refreshing, setRefreshing] = useState(false);
  const [contactInfo, setContactInfo] = useState(null);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Fetch post if only postId is provided
  const fetchPost = async () => {
    if (post || !postId) return;

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

  // Fetch post owner's contact information
  const fetchContactInfo = async () => {
    if (!post?.user_id) return;

    try {
      const result = await userService.getProfile(post.user_id);
      if (result.success && result.data) {
        setContactInfo({
          name: result.data.name || 'User',
          phone: result.data.phone || '',
          email: result.data.email || '',
          whatsapp: result.data.phone || '',
        });
      } else {
        // Fallback to post data
        setContactInfo({
          name: post.userName || 'User',
          phone: post.phone || '',
          email: post.email || '',
          whatsapp: post.phone || '',
        });
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
      // Fallback to post data
      setContactInfo({
        name: post.userName || 'User',
        phone: post.phone || '',
        email: post.email || '',
        whatsapp: post.phone || '',
      });
    }
  };

  // Fetch similar posts (opposite type, same category)
  const fetchSimilarPosts = async () => {
    if (!post?.id || !post?.category || !post?.type) return;

    try {
      setLoadingSimilar(true);
      // Get opposite type (Lost -> Found, Found -> Lost)
      const oppositeType = post.type === 'Lost' ? 'Found' : 'Lost';
      
      // Fetch posts with same category and opposite type
      const result = await postService.getPostsByType(oppositeType, {
        category: post.category,
      });

      if (result.success && result.data) {
        // Filter out current post and limit to 5 similar posts
        const similar = result.data
          .filter((p) => p.id !== post.id)
          .slice(0, 5);
        setSimilarPosts(similar);
      }
    } catch (error) {
      console.error('Error fetching similar posts:', error);
      setSimilarPosts([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [postId]);

  // Fetch contact info and similar posts when post is available
  useEffect(() => {
    if (post) {
      fetchContactInfo();
      fetchSimilarPosts();
    }
  }, [post]);

  useFocusEffect(
    useCallback(() => {
      if (postId && !post) {
        fetchPost();
      } else if (post) {
        fetchContactInfo();
        fetchSimilarPosts();
      }
    }, [postId, post])
  );

  const onRefresh = async () => {
    if (!postId) return;
    setRefreshing(true);
    await fetchPost();
    setRefreshing(false);
  };


  const handleCall = () => {
    if (!contactInfo?.phone) {
      showToast('Phone number not available', 'error');
      return;
    }
    const phoneNumber = contactInfo.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      showAlert('Error', 'Unable to make phone call');
      console.error(err);
    });
  };

  const handleWhatsApp = () => {
    if (!contactInfo?.whatsapp) {
      showToast('Phone number not available', 'error');
      return;
    }
    const whatsappNumber = contactInfo.whatsapp.replace(/[^0-9]/g, '');
    const message = `Hi, I'm interested in your ${post?.type === 'Lost' ? 'lost' : 'found'} item: ${post?.title}`;
    const url = `whatsapp://send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback to web WhatsApp
          const webUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => {
        showAlert('Error', 'Unable to open WhatsApp');
        console.error(err);
      });
  };

  const handleChat = async () => {
    if (!post || !user?.id) {
      showToast('Please login to chat', 'error');
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
          userName: post.userName || contactInfo?.name || 'User',
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

  if (!post || !contactInfo) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Contact" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            No post information available
          </Text>
        </View>
      </View>
    );
  }

  const isOwnPost = post.user_id === user?.id;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Contact" onBack={() => navigation.goBack()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          postId ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          ) : undefined
        }
      >
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: colors.surface }]}>
          {post.images && post.images.length > 0 ? (
            <Image source={{ uri: post.images[0] }} style={styles.productImage} />
          ) : post.image ? (
            <Image source={{ uri: post.image }} style={styles.productImage} />
          ) : (
            <View style={[styles.placeholderImage, { backgroundColor: colors.background }]}>
              <AppIcon name="image" size={48} color={colors.textTertiary} />
            </View>
          )}
        </View>

        {/* Product Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.typeBadgeContainer}>
            <View
              style={[
                styles.typeBadge,
                {
                  backgroundColor:
                    post.type === 'Lost' ? colors.warning + '20' : colors.success + '20',
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

          <Text style={[styles.productTitle, { color: colors.text }]}>{post.title}</Text>
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
              <Text style={[styles.tipText, { color: colors.accent }]}>
                Reward Offered: {post.tip}
              </Text>
            </View>
          )}
        </View>

        {/* Contact Information Card */}
        {contactInfo && (
          <View style={[styles.contactCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Contact Information</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <View style={styles.contactInfoRow}>
              <AppIcon name="person" size={22} color={colors.primary} />
              <View style={styles.contactInfo}>
                <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Name</Text>
                <Text style={[styles.contactValue, { color: colors.text }]}>{contactInfo.name}</Text>
              </View>
            </View>

            {contactInfo.phone && (
              <View style={styles.contactInfoRow}>
                <AppIcon name="call" size={22} color={colors.primary} />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Phone</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>{contactInfo.phone}</Text>
                </View>
              </View>
            )}

            {contactInfo.email && (
              <View style={styles.contactInfoRow}>
                <AppIcon name="mail" size={22} color={colors.primary} />
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: colors.textSecondary }]}>Email</Text>
                  <Text style={[styles.contactValue, { color: colors.text }]}>{contactInfo.email}</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Matching Suggestions */}
        {similarPosts.length > 0 && (
          <MatchingSuggestions currentPost={post} allPosts={similarPosts} />
        )}

        {/* Action Buttons */}
        {!isOwnPost && contactInfo && (
          <View style={styles.actionButtonsContainer}>
            {contactInfo.phone && (
              <>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.success }]}
                  onPress={handleCall}
                  activeOpacity={0.8}
                >
                  <AppIcon name="call" size={22} color={colors.textInverse} />
                  <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>Call</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: '#25D366' }]}
                  onPress={handleWhatsApp}
                  activeOpacity={0.8}
                >
                  <AppIcon name="logoWhatsapp" size={22} color={colors.textInverse} />
                  <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>WhatsApp</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleChat}
              activeOpacity={0.8}
            >
              <AppIcon name="chatbubbles" size={22} color={colors.textInverse} />
              <Text style={[styles.actionButtonText, { color: colors.textInverse }]}>Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Report Button */}
        <TouchableOpacity
          style={[styles.reportButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => navigation.navigate('ReportPost', { post })}
        >
          <AppIcon name="warning" size={20} color={colors.error} style={{ marginRight: 8 }} />
          <Text style={[styles.reportButtonText, { color: colors.error }]}>Report post</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
  },
  productImage: {
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
    fontSize: 64,
  },
  detailsCard: {
    marginHorizontal: space.md,
    marginBottom: space.md,
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: StyleSheet.hairlineWidth,
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
  productTitle: {
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
  contactCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  contactTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  contactIcon: {
    fontSize: 24,
    width: 40,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButton: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reportButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ContactScreen;

