import React from 'react';
import { Text, StyleSheet } from 'react-native';

const SimpleIcon = ({ name, size = 24, color, focused }) => {
  // Simple unicode-based icons that work everywhere
  const getIcon = () => {
    switch (name) {
      case 'home':
        return focused ? '⌂' : '⌂'; // Home symbol
      case 'person':
        return focused ? '☺' : '☻'; // Person symbol
      case 'settings':
        return focused ? '⚙' : '⚙'; // Settings gear
      case 'posts':
        return focused ? '📝' : '📄'; // Posts/Document symbol
      case 'chat':
        return focused ? '💬' : '💭'; // Chat/Messages symbol
      case 'notifications':
        return focused ? '🔔' : '🔕'; // Notifications symbol
      default:
        return '•';
    }
  };

  return (
    <Text style={[styles.icon, { fontSize: size, color, fontWeight: focused ? 'bold' : 'normal' }]}>
      {getIcon()}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
  },
});

export default SimpleIcon;

