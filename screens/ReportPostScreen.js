import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const reportReasons = [
  'Spam',
  'Inappropriate Content',
  'False Information',
  'Duplicate Post',
  'Scam/Fraud',
  'Other',
];

const ReportPostScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params || {};

  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) {
      Alert.alert('Error', 'Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      Alert.alert('Error', 'Please provide details for "Other" reason');
      return;
    }

    // TODO: Implement API call to report post
    Alert.alert(
      'Report Submitted',
      'Thank you for your report. Our team will review it shortly.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Report Post</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>
            No post information available
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Report Post</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Post Info */}
        <View style={[styles.postInfoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.postInfoTitle, { color: colors.text }]}>Post Information</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.postTitle, { color: colors.text }]}>{post.title}</Text>
          <Text style={[styles.postType, { color: colors.textSecondary }]}>
            {post.type} • {post.category}
          </Text>
        </View>

        {/* Report Reasons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Why are you reporting this post?
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Please select the most appropriate reason
          </Text>

          {reportReasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonButton,
                selectedReason === reason && { backgroundColor: colors.primary },
                selectedReason !== reason && {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <Text
                style={[
                  styles.reasonText,
                  {
                    color: selectedReason === reason ? colors.textInverse : colors.text,
                    fontWeight: selectedReason === reason ? 'bold' : 'normal',
                  },
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Reason Input */}
        {selectedReason === 'Other' && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Please provide details</Text>
            <View
              style={[
                styles.textAreaContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.textArea,
                  { color: colors.text },
                ]}
                placeholder="Describe the issue..."
                placeholderTextColor={colors.textTertiary}
                value={customReason}
                onChangeText={setCustomReason}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.error }]}
          onPress={handleSubmit}
        >
          <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
            Submit Report
          </Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  postInfoCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  postType: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  reasonButton: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 16,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  submitButtonText: {
    fontSize: 18,
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

export default ReportPostScreen;

