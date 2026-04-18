import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BubblesBackground from '../components/BubblesBackground';
import AppIcon from '../components/AppIcon';

const { width } = Dimensions.get('window');

const OnboardingScreen = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <BubblesBackground />
      
      <View style={styles.content}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
          <AppIcon name="cube" size={56} color="#FFFFFF" />
        </View>

        {/* App Info */}
        <Text style={[styles.title, { color: colors.text }]}>
          Item Return Desk
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your Campus Lost & Found Hub
        </Text>

        <View style={styles.infoContainer}>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            • Quickly create Lost or Found posts{'\n'}
            • Add clear photos and categories{'\n'}
            • Search and filter by keyword, category, and time{'\n'}
            • Contact finders securely through the app{'\n'}
            • View recent listings from last 24 hours
          </Text>
        </View>

        {/* Signup Button */}
        <TouchableOpacity
          style={[styles.signupButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={[styles.signupButtonText, { color: colors.textInverse }]}>
            Sign Up
          </Text>
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  infoContainer: {
    width: width - 80,
    marginBottom: 40,
  },
  infoText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'left',
  },
  signupButton: {
    width: width - 80,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 16,
  },
  loginLink: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;

