import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAppModal } from '../context/ModalContext';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils';

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
  const { showAlert } = useAppModal();
  const route = useRoute();
  const { post } = route.params || {};

  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = () => {
    if (!selectedReason) {
      showAlert('Error', 'Please select a reason for reporting');
      return;
    }

    if (selectedReason === 'Other' && !customReason.trim()) {
      showAlert('Error', 'Please provide details for "Other" reason');
      return;
    }

    // TODO: Implement API call to report post
    showAlert('Report Submitted', 'Thank you for your report. Our team will review it shortly.', () =>
      navigation.goBack()
    );
  };

  if (!post) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScreenHeader title="Report Post" onBack={() => navigation.goBack()} />
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
      <ScreenHeader title="Report Post" onBack={() => navigation.goBack()} />

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
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: space.md,
    paddingBottom: 100,
  },
  postInfoCard: {
    padding: space.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: space.lg,
    ...shadowSoft,
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
    padding: space.md,
    borderRadius: radii.md,
    marginBottom: space.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  reasonText: {
    fontSize: 16,
  },
  textAreaContainer: {
    borderRadius: radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: space.sm,
    minHeight: 100,
  },
  textArea: {
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    paddingVertical: space.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: space.md,
    ...shadowSoft,
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

