import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../context/ThemeContext';
import BottomTabNavigator from './BottomTabNavigator';
import DetailsScreen from '../screens/DetailsScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import LostPostsScreen from '../screens/LostPostsScreen';
import FoundPostsScreen from '../screens/FoundPostsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ContactScreen from '../screens/ContactScreen';
import EditPostScreen from '../screens/EditPostScreen';
import AdminPanelScreen from '../screens/AdminPanelScreen';
import ReportPostScreen from '../screens/ReportPostScreen';
import ChatScreen from '../screens/ChatScreen';
import PostSuccessScreen from '../screens/PostSuccessScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import SecuritySettingsScreen from '../screens/SecuritySettingsScreen';
import TermsPrivacyScreen from '../screens/TermsPrivacyScreen';
import HelpCenterScreen from '../screens/HelpCenterScreen';
import ContactSupportScreen from '../screens/ContactSupportScreen';
import UserGuideScreen from '../screens/UserGuideScreen';
import AboutAppScreen from '../screens/AboutAppScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: 'bold',
          fontFamily: undefined,
        },
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="LostPosts"
        component={LostPostsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="FoundPosts"
        component={FoundPostsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="AdminPanel"
        component={AdminPanelScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ReportPost"
        component={ReportPostScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="PostSuccess"
        component={PostSuccessScreen}
        options={{
          headerShown: false,
          presentation: 'card',
          gestureEnabled: false, // Prevent swipe back
        }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="TermsPrivacy"
        component={TermsPrivacyScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="HelpCenter"
        component={HelpCenterScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="ContactSupport"
        component={ContactSupportScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="UserGuide"
        component={UserGuideScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
      <Stack.Screen
        name="AboutApp"
        component={AboutAppScreen}
        options={{ headerShown: false, presentation: 'card' }}
      />
    </Stack.Navigator>
  );
};

export default StackNavigator;

