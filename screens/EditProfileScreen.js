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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { useAppModal } from '../context/ModalContext';
import AppIcon from '../components/AppIcon';
import ScreenHeader from '../components/ScreenHeader';
import { radii, shadowSoft, space } from '../utils/layout';

const EditProfileScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const { showAlert, showModal } = useAppModal();
  
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [uploadedVideo, setUploadedVideo] = useState(null);

  useEffect(() => {
    // Request permissions on mount
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
          showAlert(
            'Permissions Required',
            'Sorry, we need camera and media library permissions to upload images!'
          );
        }
      }
    })();
  }, []);

  useEffect(() => {
    // Load user data if available
    if (user) {
      setFullName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setLocation(user.location || '');
      setProfileImage(user.profileImage || null);
    }
  }, [user]);

  const handleSave = () => {
    if (!fullName.trim()) {
      showAlert('Error', 'Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert('Error', 'Please enter a valid email address');
      return;
    }

    // TODO: Implement API call to update profile
    // Include profileImage and uploadedVideo in the update
    const profileData = {
      name: fullName,
      email: email,
      phone: phone,
      bio: bio,
      location: location,
      profileImage: profileImage,
      video: uploadedVideo,
    };

    console.log('Profile data to save:', profileData);
    
    showAlert('Success', 'Profile updated successfully!', () => navigation.goBack());
  };

  const handleChangePhoto = () => {
    showModal({
      title: 'Select Photo',
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick image from gallery');
      console.error(error);
    }
  };

  const handleUploadVideo = () => {
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
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedVideo(result.assets[0].uri);
        showAlert('Success', 'Video uploaded successfully!');
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
        quality: 0.8,
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedVideo(result.assets[0].uri);
        showAlert('Success', 'Video uploaded successfully!');
      }
    } catch (error) {
      showAlert('Error', 'Failed to pick video from gallery');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader title="Edit Profile" onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Profile Picture Section */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatarContainer, { backgroundColor: colors.primary }]}>
              {profileImage ? (
                <Image source={{ uri: profileImage }} style={styles.avatarImage} />
              ) : (
                <Text style={[styles.avatarText, { color: colors.textInverse }]}>
                  {fullName.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.changePhotoButton, { backgroundColor: colors.primary }]}
              onPress={handleChangePhoto}
            >
              <Text style={[styles.changePhotoText, { color: colors.textInverse }]}>
                {profileImage ? 'Change Photo' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textTertiary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Phone Number Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your phone number"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          {/* Location Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Location</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your location"
              placeholderTextColor={colors.textTertiary}
              value={location}
              onChangeText={setLocation}
              autoCapitalize="words"
            />
          </View>

          {/* Bio Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Tell us about yourself..."
              placeholderTextColor={colors.textTertiary}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
            />
            <Text style={[styles.charCount, { color: colors.textTertiary }]}>
              {bio.length}/200
            </Text>
          </View>

          {/* Video Upload Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Upload Video (Optional)</Text>
            <TouchableOpacity
              style={[styles.videoButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={handleUploadVideo}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {uploadedVideo ? (
                  <AppIcon name="checkmarkCircle" size={20} color={colors.success} />
                ) : (
                  <AppIcon name="videocam" size={20} color={colors.primary} />
                )}
                <Text style={[styles.videoButtonText, { color: colors.textSecondary }]}>
                  {uploadedVideo ? 'Video uploaded' : 'Upload video'}
                </Text>
              </View>
            </TouchableOpacity>
            {uploadedVideo && (
              <View style={[styles.videoInfo, { backgroundColor: colors.primaryLight + '20' }]}>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                  <AppIcon name="videocam" size={18} color={colors.primary} style={{ marginRight: 8 }} />
                  <Text style={[styles.videoInfoText, { color: colors.primary }]}>
                    Video selected successfully
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setUploadedVideo(null)}
                  style={styles.removeVideoButton}
                >
                  <Text style={[styles.removeVideoText, { color: colors.error }]}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: colors.textInverse }]}>
              Save Changes
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
    paddingTop: space.sm,
  },
  content: {
    padding: space.md,
    paddingTop: space.md,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: space.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.35)',
    ...shadowSoft,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  changePhotoButton: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radii.xl,
    ...shadowSoft,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
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
  charCount: {
    fontSize: 12,
    marginTop: 6,
    textAlign: 'right',
  },
  videoButton: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  videoInfo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  videoInfoText: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  removeVideoButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  removeVideoText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButton: {
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
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EditProfileScreen;

