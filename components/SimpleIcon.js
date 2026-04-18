import React from 'react';
import AppIcon from './AppIcon';

/**
 * Tab bar icons — uses {@link AppIcon} with filled/outline by focus.
 */
const SimpleIcon = ({ name, size = 24, color, focused }) => {
  const iconName = (() => {
    switch (name) {
      case 'home':
        return focused ? 'home' : 'homeOutline';
      case 'person':
        return focused ? 'person' : 'personOutline';
      case 'settings':
        return 'options';
      case 'posts':
        return focused ? 'layers' : 'layersOutline';
      case 'chat':
        return focused ? 'chatbubbles' : 'chatbubblesOutline';
      case 'notifications':
        return focused ? 'notifications' : 'notificationsOutline';
      default:
        return 'helpCircleOutline';
    }
  })();

  return <AppIcon name={iconName} size={size} color={color} />;
};

export default SimpleIcon;
