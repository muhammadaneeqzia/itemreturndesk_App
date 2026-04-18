import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useAppModal } from '../context/ModalContext';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';
import { ChartCard, SparklineChart, AnimatedBarChart } from '../components/charts';

const screenW = Dimensions.get('window').width;

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
  const { showConfirm, showAlert } = useAppModal();
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
    showConfirm({
      title: 'Approve Post',
      message: 'This post will be approved and made visible to all users.',
      cancelText: 'Cancel',
      confirmText: 'Approve',
      onConfirm: () => {
        setPendingPosts(pendingPosts.filter((p) => p.id !== postId));
        setTimeout(() => showAlert('Success', 'Post approved successfully'), 320);
      },
    });
  };

  const handleRejectPost = (postId) => {
    showConfirm({
      title: 'Reject Post',
      message: 'This post will be removed. Are you sure?',
      cancelText: 'Cancel',
      confirmText: 'Reject',
      destructive: true,
      onConfirm: () => {
        setPendingPosts(pendingPosts.filter((p) => p.id !== postId));
        setTimeout(() => showAlert('Success', 'Post rejected and removed'), 320);
      },
    });
  };

  const handleRemoveSpam = (postId) => {
    showConfirm({
      title: 'Remove Spam',
      message: 'This post will be permanently deleted.',
      cancelText: 'Cancel',
      confirmText: 'Remove',
      destructive: true,
      onConfirm: () => {
        setReportedPosts(reportedPosts.filter((p) => p.id !== postId));
        setTimeout(() => showAlert('Success', 'Spam post removed'), 320);
      },
    });
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
            <AppIcon name="warning" size={16} color={colors.error} style={{ marginRight: 6 }} />
            <Text style={[styles.reportedText, { color: colors.error }]}>
              {item.reportedCount} reports
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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <AppIcon name="locationOutline" size={14} color={colors.textTertiary} />
          <Text style={[styles.metaText, { color: colors.textTertiary }]}>{item.location}</Text>
        </View>
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
        <ScreenHeader title="Admin Panel" onBack={() => navigation.goBack()} />
        <View style={styles.errorContainer}>
          <AppIcon name="warning" size={48} color={colors.error} style={{ marginBottom: 12 }} />
          <Text style={[styles.errorText, { color: colors.error }]}>Access denied</Text>
          <Text style={[styles.errorSubtext, { color: colors.textSecondary }]}>
            You don't have permission to access this page.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Admin Panel" onBack={() => navigation.goBack()} />

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

            <ChartCard
              title="Moderation pulse"
              subtitle="Sample 7-day trend (demo data)"
              colors={colors}
            >
              <SparklineChart
                values={[3, 5, 4, 8, 12, analytics.resolvedToday, analytics.resolvedToday + 2]}
                colors={colors}
                width={screenW - space.md * 4}
                height={100}
              />
            </ChartCard>

            <ChartCard title="Queue vs volume" subtitle="Key counts compared" colors={colors}>
              <AnimatedBarChart
                data={[
                  { label: 'Active', value: analytics.activePosts, color: colors.success },
                  { label: 'Pending', value: analytics.pendingReview, color: colors.warning },
                  { label: 'Reports', value: analytics.reportedPosts, color: colors.error },
                ]}
                colors={colors}
                height={152}
              />
            </ChartCard>

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
    padding: space.md,
    paddingBottom: 100,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginBottom: space.md,
  },
  statCard: {
    width: '48%',
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    ...shadowSoft,
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
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadowSoft,
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
    padding: space.md,
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: space.md,
    ...shadowSoft,
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
    flexDirection: 'row',
    alignItems: 'center',
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

