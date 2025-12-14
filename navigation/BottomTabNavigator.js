import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import SimpleIcon from '../components/SimpleIcon';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MyPostsScreen from '../screens/MyPostsScreen';
import ChatListScreen from '../screens/ChatListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  const { colors, isDark } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: 'normal',
          fontFamily: undefined,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          headerTitle: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <SimpleIcon name="home" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MyPosts"
        component={MyPostsScreen}
        options={{
          tabBarLabel: 'My Posts',
          headerTitle: 'My Posts',
          tabBarIcon: ({ color, size, focused }) => (
            <SimpleIcon name="posts" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatListScreen}
        options={{
          tabBarLabel: 'My Chats',
          headerTitle: 'My Chats',
          tabBarIcon: ({ color, size, focused }) => (
            <SimpleIcon name="chat" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarLabel: 'Activity',
          headerTitle: 'Notifications',
          tabBarIcon: ({ color, size, focused }) => (
            <SimpleIcon name="notifications" size={size} color={color} focused={focused} />
          ),
          tabBarBadge: undefined, // Will be updated dynamically by NotificationsScreen
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          headerTitle: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <SimpleIcon name="person" size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

