import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { ModalProvider } from './context/ModalContext';
import AppNavigator from './navigation/AppNavigator';
import AuthNavigator from './navigation/AuthNavigator';
import SplashScreen from './screens/SplashScreen';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const RootStack = createNativeStackNavigator();


const SPLASH_MIN_MS = 2000; 
const SPLASH_EXIT_MS = 520;

const AppContent = () => {
  const { isDark, isLoading: themeLoading, colors } = useTheme();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [splashExiting, setSplashExiting] = useState(false);

  useEffect(() => {
    if (themeLoading || authLoading) {
      setSplashExiting(false);
      return;
    }
    // After theme + auth ready: wait until exit animation can run, then unmount splash
    const exitStart = Math.max(0, SPLASH_MIN_MS - SPLASH_EXIT_MS);
    const exitTimer = setTimeout(() => setSplashExiting(true), exitStart);
    const hideTimer = setTimeout(() => setShowSplash(false), SPLASH_MIN_MS);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [themeLoading, authLoading]);



  if (themeLoading || authLoading || showSplash) {
    return <SplashScreen exiting={splashExiting} />;
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
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <NotificationProvider>
              <ModalProvider>
                <AppContent />
              </ModalProvider>
            </NotificationProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
