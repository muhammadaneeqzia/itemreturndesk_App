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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  
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
          Alert.alert(
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
      Alert.alert('Error', 'Please enter your full name');
      return;
    }
    
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
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
    
    Alert.alert('Success', 'Profile updated successfully!', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  const handleChangePhoto = () => {
    Alert.alert(
      'Select Photo',
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
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
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image from gallery');
      console.error(error);
    }
  };

  const handleUploadVideo = () => {
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
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedVideo(result.assets[0].uri);
        Alert.alert('Success', 'Video uploaded successfully!');
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
        videoMaxDuration: 60, // 60 seconds max
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadedVideo(result.assets[0].uri);
        Alert.alert('Success', 'Video uploaded successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick video from gallery');
      console.error(error);
    }
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={styles.backButton} />
      </View>

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
              <Text style={[styles.videoButtonText, { color: colors.textSecondary }]}>
                {uploadedVideo ? '✓ Video Uploaded' : '+ Upload Video'}
              </Text>
            </TouchableOpacity>
            {uploadedVideo && (
              <View style={[styles.videoInfo, { backgroundColor: colors.primaryLight + '20' }]}>
                <Text style={[styles.videoInfoText, { color: colors.primary }]}>
                  📹 Video selected successfully
                </Text>
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
    marginBottom: 16,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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

