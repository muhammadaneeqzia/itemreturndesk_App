import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../utils';

const ThemeContext = createContext();

const THEME_STORAGE_KEY = '@app_theme_mode';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState(null); // null initially while loading
  const [colors, setColors] = useState(lightTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Update colors when themeMode changes
  useEffect(() => {
    if (themeMode !== null) {
      setColors(themeMode === 'dark' ? darkTheme : lightTheme);
      saveTheme(themeMode);
    }
  }, [themeMode]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme) {
        setThemeMode(savedTheme);
      } else {
        // If no saved theme, use system preference
        setThemeMode(systemColorScheme || 'light');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      // Fallback to system preference on error
      setThemeMode(systemColorScheme || 'light');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTheme = async (theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setThemeMode(prevMode => {
      const newMode = prevMode === 'dark' ? 'light' : 'dark';
      return newMode;
    });
  };

  const value = {
    colors,
    themeMode,
    toggleTheme,
    isDark: themeMode === 'dark',
    isLoading,
  };

  // Don't render children until theme is loaded
  if (isLoading || themeMode === null) {
    return null; // or a loading spinner
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

