import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

// Mock data for admin panel
const mockPendingPosts = [
  {
    id: '1',
    type: 'Lost',
    title: 'iPhone 13 Lost',
    description: 'Lost my iPhone near library',
    category: 'Electronics',
    location: 'Main Library',
    createdAt: new Date(),
    reportedCount: 0,
    status: 'pending',
  },
  {
    id: '2',
    type: 'Found',
    title: 'Student ID Found',
    description: 'Found ID card in cafeteria',
    category: 'ID Cards',
    location: 'Cafeteria',
    createdAt: new Date(),
    reportedCount: 2,
    status: 'pending',
  },
];

const mockReportedPosts = [
  {
    id: '3',
    type: 'Lost',
    title: 'Suspicious Post',
    description: 'This looks like spam',
    category: 'Other',
    location: 'Unknown',
    createdAt: new Date(),
    reportedCount: 5,
    status: 'reported',
    reports: [
      { reason: 'Spam', count: 3 },
      { reason: 'Inappropriate', count: 2 },
    ],
  },
];

const AdminPanelScreen = () => {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('overview');
  const [pendingPosts, setPendingPosts] = useState(mockPendingPosts);
  const [reportedPosts, setReportedPosts] = useState(mockReportedPosts);

  // Analytics data
  const analytics = {
    totalPosts: 156,
    activePosts: 142,
    pendingReview: 8,
    reportedPosts: 6,
    resolvedToday: 12,
    spamRemoved: 3,
  };

  const handleApprovePost = (postId) => {
    Alert.alert('Approve Post', 'This post will be approved and made visible to all users.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: () => {
          setPendingPosts(pendingPosts.filter((p) => p.id !== postId));
          Alert.alert('Success', 'Post approved successfully');
        },
      },
    ]);
  };

  const handleRejectPost = (postId) => {
    Alert.alert('Reject Post', 'This post will be removed. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setPendingPosts(pendingPosts.filter((p) => p.id !== postId));
          Alert.alert('Success', 'Post rejected and removed');
        },
      },
    ]);
  };

  const handleRemoveSpam = (postId) => {
    Alert.alert('Remove Spam', 'This post will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setReportedPosts(reportedPosts.filter((p) => p.id !== postId));
          Alert.alert('Success', 'Spam post removed');
        },
      },
    ]);
  };

  const renderPostItem = ({ item, isReported = false }) => (
    <View style={[styles.postCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.postHeader}>
        <View
          style={[
            styles.typeBadge,
            {
              backgroundColor:
                item.type === 'Lost' ? colors.warning + '20' : colors.success + '20',
            },
          ]}
        >
          <Text
            style={[
              styles.typeText,
              {
                color: item.type === 'Lost' ? colors.warning : colors.success,
              },
            ]}
          >
            {item.type}
          </Text>
        </View>
        {isReported && (
          <View style={[styles.reportedBadge, { backgroundColor: colors.error + '20' }]}>
            <Text style={[styles.reportedText, { color: colors.error }]}>
              ⚠ {item.reportedCount} Reports
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.postTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.postDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.postMeta}>
        <Text style={[styles.metaText, { color: colors.textTertiary }]}>{item.category}</Text>
        <Text style={[styles.metaText, { color: colors.textTertiary }]}>📍 {item.location}</Text>
      </View>
      {isReported && item.reports && (
        <View style={styles.reportsContainer}>
          <Text style={[styles.reportsTitle, { color: colors.text }]}>Report Reasons:</Text>
          {item.reports.map((report, idx) => (
            <Text key={idx} style={[styles.reportItem, { color: colors.textSecondary }]}>
              • {report.reason} ({report.count})
            </Text>
          ))}
        </View>
      )}
      <View style={styles.actionButtons}>
        {!isReported ? (
          <>
            <TouchableOpacity
              style={[styles.approveButton, { backgroundColor: colors.success }]}
              onPress={() => handleApprovePost(item.id)}
            >
              <Text style={[styles.buttonText, { color: colors.textInverse }]}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.rejectButton, { backgroundColor: colors.error }]}
              onPress={() => handleRejectPost(item.id)}
            >
              <Text style={[styles.buttonText, { color: colors.textInverse }]}>Reject</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            style={[styles.removeButton, { backgroundColor: colors.error }]}
            onPress={() => handleRemoveSpam(item.id)}
          >
            <Text style={[styles.buttonText, { color: colors.textInverse }]}>Remove Spam</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (!isAdmin) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            ⚠️ Access Denied
          </Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            You don't have permission to access this page.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Panel</Text>
        <View style={styles.backButton} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'overview' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('overview')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'overview' ? colors.primary : colors.textSecondary },
            ]}
          >
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'pending' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('pending')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'pending' ? colors.primary : colors.textSecondary },
            ]}
          >
            Pending ({pendingPosts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'reported' && { borderBottomColor: colors.primary, borderBottomWidth: 2 },
          ]}
          onPress={() => setActiveTab('reported')}
        >
          <Text
            style={[
              styles.tabText,
              { color: activeTab === 'reported' ? colors.primary : colors.textSecondary },
            ]}
          >
            Reported ({reportedPosts.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && (
          <View>
            {/* Analytics Cards */}
            <View style={styles.analyticsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.primary }]}>{analytics.totalPosts}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Posts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.success }]}>{analytics.activePosts}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Active Posts</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.warning }]}>{analytics.pendingReview}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending Review</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.statNumber, { color: colors.error }]}>{analytics.reportedPosts}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Reported</Text>
              </View>
            </View>

            {/* Quick Stats */}
            <View style={[styles.quickStatsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Today's Activity</Text>
              <View style={styles.quickStatRow}>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Resolved:</Text>
                <Text style={[styles.quickStatValue, { color: colors.success }]}>{analytics.resolvedToday}</Text>
              </View>
              <View style={styles.quickStatRow}>
                <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Spam Removed:</Text>
                <Text style={[styles.quickStatValue, { color: colors.error }]}>{analytics.spamRemoved}</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'pending' && (
          <View>
            {pendingPosts.length > 0 ? (
              <FlatList
                data={pendingPosts}
                renderItem={({ item }) => renderPostItem({ item, isReported: false })}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No pending posts to review
                </Text>
              </View>
            )}
          </View>
        )}

        {activeTab === 'reported' && (
          <View>
            {reportedPosts.length > 0 ? (
              <FlatList
                data={reportedPosts}
                renderItem={({ item }) => renderPostItem({ item, isReported: true })}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No reported posts
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  quickStatsCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickStatLabel: {
    fontSize: 14,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  postCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  reportedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reportedText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  postDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  postMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
  },
  reportsContainer: {
    marginTop: 8,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  reportsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  reportItem: {
    fontSize: 12,
    marginBottom: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  approveButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  rejectButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  removeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  errorSubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default AdminPanelScreen;

