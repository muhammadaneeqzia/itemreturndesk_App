import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postService } from '../lib/services/posts/postService';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

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

  // Format date to "Month Year" (e.g., "January 2024")
  const formatMemberSince = (date) => {
    if (!date) return 'Recently';
    const d = new Date(date);
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  // Fetch stats and recent posts
  const fetchData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Fetch stats
      const statsResult = await postService.getStats(user.id);
      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
        
        // Calculate items returned (claimed posts)
        const postsResult = await postService.getUserPosts(user.id, { status: 'claimed' });
        if (postsResult.success && postsResult.data) {
          setStats(prev => ({
            ...prev,
            itemsReturned: postsResult.data.length,
          }));
        }
      }

      // Fetch recent posts (limit to 3)
      const postsResult = await postService.getUserPosts(user.id, {});
      if (postsResult.success && postsResult.data) {
        // Format time ago
        const formatTimeAgo = (dateString) => {
          const date = new Date(dateString);
          const now = new Date();
          const diffInSeconds = Math.floor((now - date) / 1000);

          if (diffInSeconds < 60) {
            return `${diffInSeconds}s ago`;
          } else if (diffInSeconds < 3600) {
            return `${Math.floor(diffInSeconds / 60)}m ago`;
          } else if (diffInSeconds < 86400) {
            return `${Math.floor(diffInSeconds / 3600)}h ago`;
          } else if (diffInSeconds < 2592000) {
            return `${Math.floor(diffInSeconds / 86400)}d ago`;
          } else {
            return date.toLocaleDateString();
          }
        };

        // Get top 3 posts
        const recentPosts = postsResult.data.slice(0, 3).map((post) => ({
          id: post.id,
          type: post.type,
          title: post.title,
          time: formatTimeAgo(post.created_at),
          status: post.status ? post.status.charAt(0).toUpperCase() + post.status.slice(1) : 'Active',
        }));
        setMyPosts(recentPosts);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [user?.id]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [user?.id])
  );

  // Refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const renderMenuItem = (icon, title, subtitle, onPress, showArrow = true) => (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.menuItemLeft}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <View style={styles.menuItemText}>
          <Text style={[styles.menuItemTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.menuItemSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {showArrow && <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>}
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.contentContainer, { paddingTop: 10 }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {/* Profile Header */}
      <View style={[styles.profileHeader, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerSpacer} />
          <Text style={[styles.headerTitle, { color: colors.textInverse }]}>Profile</Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={[styles.settingsIcon, { color: colors.textInverse }]}>⚙</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.avatarContainer, { backgroundColor: colors.textInverse + '30' }]}>
          {userAvatar ? (
            <Image source={{ uri: userAvatar }} style={styles.avatarImage} />
          ) : (
            <Text style={[styles.avatarText, { color: colors.textInverse }]}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text style={[styles.profileName, { color: colors.textInverse }]}>{userName}</Text>
        <Text style={[styles.profileEmail, { color: colors.textInverse }]}>{userEmail}</Text>
        <TouchableOpacity
          style={[styles.editButton, { backgroundColor: colors.textInverse + '20', borderColor: colors.textInverse }]}
          onPress={handleEditProfile}
        >
          <Text style={[styles.editButtonText, { color: colors.textInverse }]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={[styles.statItem, { borderRightColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.totalPosts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Posts</Text>
        </View>
        <View style={[styles.statItem, { borderRightColor: colors.border }]}>
          <Text style={[styles.statNumber, { color: colors.warning }]}>{stats.lostPosts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Lost Items</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, { color: colors.success }]}>{stats.foundPosts}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Found Items</Text>
        </View>
      </View>

      {/* My Posts Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>My Posts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MyPosts')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        {loading && myPosts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : myPosts.length > 0 ? (
          myPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={[styles.postItem, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => navigation.navigate('Details', { postId: post.id })}
            >
            <View style={styles.postItemLeft}>
              <View
                style={[
                  styles.postTypeBadge,
                  {
                    backgroundColor:
                      post.type === 'Lost' ? colors.warning + '20' : colors.success + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.postTypeText,
                    {
                      color: post.type === 'Lost' ? colors.warning : colors.success,
                    },
                  ]}
                >
                  {post.type}
                </Text>
              </View>
              <View style={styles.postItemInfo}>
                <Text style={[styles.postItemTitle, { color: colors.text }]}>{post.title}</Text>
                <Text style={[styles.postItemTime, { color: colors.textTertiary }]}>
                  {post.time} • {post.status}
                </Text>
              </View>
            </View>
              <Text style={[styles.arrow, { color: colors.textTertiary }]}>→</Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyPostsContainer}>
            <Text style={[styles.emptyPostsText, { color: colors.textSecondary }]}>
              No posts yet. Create your first post!
            </Text>
          </View>
        )}
      </View>

      {/* Quick Actions Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
        {renderMenuItem('👤', 'Edit Profile', 'Update your personal information', handleEditProfile)}
        {renderMenuItem('🔒', 'Change Password', 'Update your password', () =>
          Alert.alert('Info', 'Change password feature coming soon')
        )}
        {renderMenuItem('📊', 'View Statistics', 'See detailed activity stats', () =>
          Alert.alert('Info', 'Statistics feature coming soon')
        )}
      </View>

      {/* Account Info Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Information</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{userEmail}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {formatMemberSince(user?.created_at || user?.user_metadata?.created_at)}
            </Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: colors.border }]} />
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>Active</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  profileHeader: {
    padding: 30,
    paddingTop: 50,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPostsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyPostsText: {
    fontSize: 14,
    textAlign: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 20,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsSection: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  statItem: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  postItem: {
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
  postItemLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  postTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  postTypeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  postItemInfo: {
    flex: 1,
  },
  postItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  postItemTime: {
    fontSize: 12,
  },
  menuItem: {
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
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 30,
  },
  menuItemText: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: 'normal',
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  infoDivider: {
    height: 1,
    marginVertical: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 20,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ProfileScreen;
