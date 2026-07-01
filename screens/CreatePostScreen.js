import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useToast } from '../context/ToastContext';
import { useAppModal } from '../context/ModalContext';
import { postService } from '../lib/services/posts/postService';
import { storageService } from '../lib/services/storage/storageService';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils';

const { width } = Dimensions.get('window');

const categories = ['Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Books', 'Other'];
const postTypes = ['Lost', 'Found'];

const CreatePostScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { showAlert, showModal } = useAppModal();
  const navigation = useNavigation();
  const [postType, setPostType] = useState('Lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [tip, setTip] = useState('');
  const [images, setImages] = useState([]);
  const [videos, setVideos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          showAlert(
            'Permissions Required',
            'Sorry, we need camera and media library permissions to upload images and videos!'
          );
        }
      }
    })();
  }, []);

  const handlePickImage = () => {
    showModal({
      title: 'Select Image',
      message: 'Choose an option',
      buttons: [
        { text: 'Camera', variant: 'primary', onPress: () => pickImageFromCamera() },
        { text: 'Gallery', variant: 'secondary', onPress: () => pickImageFromGallery() },
        { text: 'Cancel', variant: 'cancel' },
      ],
    });
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.55,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image from camera');
      console.error(error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.55,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image from gallery');
      console.error(error);
    }
  };

  const handlePickVideo = () => {
    showModal({
      title: 'Select Video',
      message: 'Choose an option',
      buttons: [
        { text: 'Camera', variant: 'primary', onPress: () => pickVideoFromCamera() },
        { text: 'Gallery', variant: 'secondary', onPress: () => pickVideoFromGallery() },
        { text: 'Cancel', variant: 'cancel' },
      ],
    });
  };

  const pickVideoFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.55,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideos([...videos, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick video from camera');
      console.error(error);
    }
  };

  const pickVideoFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.55,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideos([...videos, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick video from gallery');
      console.error(error);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !category || !location) {
      showToast('Please fill all required fields', 'error');
      return;
    }

    if (!user?.id) {
      showToast('Please login to create a post', 'error');
      return;
    }

    try {
      setSubmitting(true);
      setUploadProgress('Preparing...');

      let tipAmount = null;
      if (tip && postType === 'Lost') {
        const numericValue = tip.replace(/[^0-9.]/g, '');
        if (numericValue) {
          tipAmount = parseFloat(numericValue);
        }
      }

      const hasImages = images.length > 0;
      const hasVideos = videos.length > 0;

      if (hasImages || hasVideos) {
        setUploadProgress(
          hasImages && hasVideos
            ? 'Uploading photos & videos...'
            : hasImages
              ? 'Uploading photos...'
              : 'Uploading video...'
        );
      }

      const [imageResult, videoResult] = await Promise.all([
        hasImages
          ? storageService.uploadMultipleImages(images)
          : Promise.resolve({ success: true, urls: [] }),
        hasVideos
          ? storageService.uploadMultipleVideos(videos)
          : Promise.resolve({ success: true, urls: [] }),
      ]);

      if (!imageResult.success) {
        showToast(imageResult.error || 'Failed to upload images', 'error');
        setSubmitting(false);
        setUploadProgress('');
        return;
      }
      if (!videoResult.success) {
        showToast(videoResult.error || 'Failed to upload videos', 'error');
        setSubmitting(false);
        setUploadProgress('');
        return;
      }

      setUploadProgress('Publishing post...');

      const postData = {
        type: postType,
        title: title.trim(),
        description: description.trim(),
        category,
        location: location.trim(),
        tip_amount: tipAmount,
        user_id: user.id,
        status: 'active',
      };

      const result = await postService.createPost(
        postData,
        imageResult.urls || [],
        videoResult.urls || []
      );

      if (result.success) {
        navigation.replace('PostSuccess', { postId: result.data.id, postType });
      } else {
        showToast(result.error || 'Failed to create post', 'error');
        setSubmitting(false);
        setUploadProgress('');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showToast('An error occurred while creating post', 'error');
      setSubmitting(false);
      setUploadProgress('');
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Create Post" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>

          {/* Post Type Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Post Type</Text>
            <View style={styles.typeContainer}>
              {postTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    postType === type && { backgroundColor: colors.primary },
                    postType !== type && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setPostType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      {
                        color: postType === type ? colors.textInverse : colors.textSecondary,
                        fontWeight: postType === type ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Title *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter item title"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Description *</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Describe the item..."
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && { backgroundColor: colors.primary },
                    category !== cat && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      {
                        color: category === cat ? colors.textInverse : colors.textSecondary,
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Location Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Location *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Where was it seen/found?"
              placeholderTextColor={colors.textTertiary}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Tip/Reward Field - Only for Lost Items */}
          {postType === 'Lost' && (
            <View style={styles.section}>
              <View style={styles.labelContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Reward/Tip (Optional)</Text>
                <Text style={[styles.optionalLabel, { color: colors.textTertiary }]}>
                  Offer a reward to increase chances
                </Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter reward amount (e.g., $20, ₹500)"
                placeholderTextColor={colors.textTertiary}
                value={tip}
                onChangeText={setTip}
                keyboardType="default"
              />
              {tip && (
                <View style={[styles.tipInfo, { backgroundColor: colors.primaryLight + '20' }]}>
                  <AppIcon name="cash" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.tipInfoText, { color: colors.primary }]}>
                    Reward: {tip} will be shown to finders
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Image Upload Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Images (Optional)</Text>
            <Text style={[styles.optionalLabel, { color: colors.textTertiary }]}>
              Add clear photos to help others identify the item
            </Text>

            {/* Uploaded Images Grid */}
            {images.length > 0 && (
              <View style={styles.mediaGrid}>
                {images.map((imageUri, index) => (
                  <View key={index} style={styles.mediaItem}>
                    <Image source={{ uri: imageUri }} style={styles.mediaPreview} />
                    <TouchableOpacity
                      style={[styles.removeButton, { backgroundColor: colors.error }]}
                      onPress={() => removeImage(index)}
                    >
                      <Text style={[styles.removeButtonText, { color: colors.textInverse }]}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Image Button */}
            {images.length < 5 && (
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePickImage}
              >
                <AppIcon name="camera" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                  Add Image {images.length > 0 && `(${images.length}/5)`}
                </Text>
              </TouchableOpacity>
            )}
            {images.length >= 5 && (
              <Text style={[styles.maxLimitText, { color: colors.textTertiary }]}>
                Maximum 5 images allowed
              </Text>
            )}
          </View>

          {/* Video Upload Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Videos (Optional)</Text>
            <Text style={[styles.optionalLabel, { color: colors.textTertiary }]}>
              Add a short video (max 60 seconds) to show the item
            </Text>

            {/* Uploaded Videos List */}
            {videos.length > 0 && (
              <View style={styles.videoList}>
                {videos.map((videoUri, index) => (
                  <View key={index} style={[styles.videoItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <AppIcon name="videocam" size={22} color={colors.primary} style={{ marginRight: 10 }} />
                    <View style={styles.videoInfo}>
                      <Text style={[styles.videoText, { color: colors.text }]} numberOfLines={1}>
                        Video {index + 1}
                      </Text>
                      <Text style={[styles.videoSubtext, { color: colors.textTertiary }]}>
                        {videoUri.split('/').pop()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.removeVideoButton, { backgroundColor: colors.error }]}
                      onPress={() => removeVideo(index)}
                    >
                      <Text style={[styles.removeButtonText, { color: colors.textInverse }]}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Add Video Button */}
            {videos.length < 2 && (
              <TouchableOpacity
                style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={handlePickVideo}
              >
                <AppIcon name="videocam" size={28} color={colors.primary} style={{ marginBottom: 8 }} />
                <Text style={[styles.uploadButtonText, { color: colors.textSecondary }]}>
                  Add Video {videos.length > 0 && `(${videos.length}/2)`}
                </Text>
              </TouchableOpacity>
            )}
            {videos.length >= 2 && (
              <Text style={[styles.maxLimitText, { color: colors.textTertiary }]}>
                Maximum 2 videos allowed
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              {
                backgroundColor: submitting ? colors.textTertiary : colors.primary,
                opacity: submitting ? 0.7 : 1,
              },
            ]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <View style={styles.submittingRow}>
                <ActivityIndicator color={colors.textInverse} />
                {uploadProgress ? (
                  <Text style={[styles.uploadProgressText, { color: colors.textInverse }]}>
                    {uploadProgress}
                  </Text>
                ) : null}
              </View>
            ) : (
              <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
                Create Post
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: space.sm,
  },
  content: {
    padding: space.md,
    paddingTop: space.md,
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  labelContainer: {
    marginBottom: 10,
  },
  optionalLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  tipInfo: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipInfoText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeButton: {
    flex: 1,
    paddingVertical: space.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeButtonText: {
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.md,
    paddingHorizontal: space.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryButtonText: {
    fontSize: 14,
  },
  uploadButton: {
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  uploadButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  mediaItem: {
    width: (width - 80) / 3, // 3 columns with padding
    height: (width - 80) / 3,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  mediaPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  removeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  videoList: {
    marginBottom: 12,
    gap: 10,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  videoIcon: {
    fontSize: 24,
  },
  videoInfo: {
    flex: 1,
  },
  videoText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  videoSubtext: {
    fontSize: 11,
  },
  removeVideoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  maxLimitText: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  submitButton: {
    paddingVertical: space.md,
    borderRadius: radii.md,
    alignItems: 'center',
    marginTop: space.md,
    marginBottom: 40,
    ...shadowSoft,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submittingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  uploadProgressText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default CreatePostScreen;

