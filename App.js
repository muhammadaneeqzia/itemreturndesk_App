import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import SplashScreen from './screens/SplashScreen';
import { Platform } from 'react-native';

const RootStack = createNativeStackNavigator();

const AppContent = () => {
  const { isDark, isLoading: themeLoading, colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for minimum 2 seconds and wait for both theme and auth to load
    if (!themeLoading && !authLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [themeLoading, authLoading]);

  if (themeLoading || authLoading || showSplash) {
    return <SplashScreen />;
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <NavigationContainer
        theme={{
          dark: isDark,
          colors: {
            primary: colors.primary,
            background: colors.background,
            card: colors.card,
            text: colors.text,
            border: colors.border,
            notification: colors.primary,
          },
          fonts: {
            regular: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif',
                default: 'System',
              }),
              fontWeight: 'normal',
            },
            medium: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif-medium',
                default: 'System',
              }),
              fontWeight: 'normal',
            },
            bold: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif',
                default: 'System',
              }),
              fontWeight: 'bold',
            },
            heavy: {
              fontFamily: Platform.select({
                ios: 'System',
                android: 'sans-serif',
                default: 'System',
              }),
              fontWeight: 'bold',
            },
          },
        }}
      >
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <RootStack.Screen name="Main" component={AppNavigator} />
          ) : (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
