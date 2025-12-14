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
  Alert,
  Image,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const categories = ['Electronics', 'ID Cards', 'Accessories', 'Clothing', 'Books', 'Other'];
const postTypes = ['Lost', 'Found'];

const EditPostScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { post } = route.params || {};

  const [postType, setPostType] = useState(post?.type || 'Lost');
  const [title, setTitle] = useState(post?.title || '');
  const [description, setDescription] = useState(post?.description || '');
  const [category, setCategory] = useState(post?.category || '');
  const [location, setLocation] = useState(post?.location || '');
  const [tip, setTip] = useState(post?.tip || '');
  const [images, setImages] = useState(post?.images || []);
  const [videos, setVideos] = useState(post?.videos || []);

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          Alert.alert(
            'Permissions Required',
            'Sorry, we need camera and media library permissions to upload images and videos!'
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    if (post) {
      setPostType(post.type || 'Lost');
      setTitle(post.title || '');
      setDescription(post.description || '');
      setCategory(post.category || '');
      setLocation(post.location || '');
      setTip(post.tip || '');
      setImages(post.images || []);
      setVideos(post.videos || []);
    }
  }, [post]);

  const handlePickImage = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => pickImageFromCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => pickImageFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from camera');
      console.error(error);
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImages([...images, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
      console.error(error);
    }
  };

  const handlePickVideo = () => {
    Alert.alert(
      'Select Video',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => pickVideoFromCamera(),
        },
        {
          text: 'Gallery',
          onPress: () => pickVideoFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickVideoFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideos([...videos, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video from camera');
      console.error(error);
    }
  };

  const pickVideoFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.8,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setVideos([...videos, ...result.assets.map((asset) => asset.uri)]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video from gallery');
      console.error(error);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!title || !description || !category || !location) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    // TODO: Implement API call to update post
    const postData = {
      type: postType,
      title,
      description,
      category,
      location,
      tip: postType === 'Lost' ? tip : null,
      images,
      videos,
    };
    console.log('Updated post data:', postData);
    Alert.alert('Success', 'Post updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Custom Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Post</Text>
        <View style={styles.backButton} />
      </View>

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
              textAlignVertical="top"
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Category *</Text>
            <View style={styles.categoryContainer}>
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
                        fontWeight: category === cat ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
              placeholder="Enter location"
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
                keyboardType="numeric"
              />
              {tip.length > 0 && (
                <View style={[styles.tipInfoBox, { backgroundColor: colors.primaryLight + '20' }]}>
                  <Text style={[styles.tipInfoText, { color: colors.primary }]}>
                    💰 Reward: {tip} will be shown to finders
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
                <Text style={[styles.uploadButtonIcon, { color: colors.primary }]}>📷</Text>
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
                    <Text style={[styles.videoIcon, { color: colors.primary }]}>🎥</Text>
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
                <Text style={[styles.uploadButtonIcon, { color: colors.primary }]}>🎥</Text>
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

          {/* Update Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
          >
            <Text style={[styles.submitButtonText, { color: colors.textInverse }]}>
              Update Post
            </Text>
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
    paddingTop: 10,
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
  content: {
    padding: 20,
    paddingTop: 20,
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
  tipInfoBox: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 16,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
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
    width: (width - 80) / 3,
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
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
});

export default EditPostScreen;

