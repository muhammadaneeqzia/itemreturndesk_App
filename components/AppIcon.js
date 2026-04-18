import React from 'react';
import { Ionicons } from '@expo/vector-icons';

/**
 * Semantic name → Ionicons glyph (Expo vector icons).
 * Use: <AppIcon name="search" color={colors.primary} size={24} />
 */
const ICON_MAP = {
  add: 'add',
  arrowBack: 'arrow-back',
  chevronForward: 'chevron-forward',
  close: 'close',
  checkmark: 'checkmark',
  checkmarkCircle: 'checkmark-circle',
  warning: 'warning',
  alertCircle: 'alert-circle',
  mail: 'mail',
  mailOutline: 'mail-outline',
  call: 'call',
  person: 'person',
  personCircle: 'person-circle',
  personOutline: 'person-outline',
  lockClosed: 'lock-closed',
  lockClosedOutline: 'lock-closed-outline',
  key: 'key',
  camera: 'camera',
  image: 'image',
  images: 'images',
  videocam: 'videocam',
  location: 'location',
  locationOutline: 'location-outline',
  cash: 'cash',
  search: 'search',
  cube: 'cube',
  cubeOutline: 'cube-outline',
  bulb: 'bulb',
  bulbOutline: 'bulb-outline',
  shield: 'shield',
  shieldCheckmark: 'shield-checkmark',
  documentText: 'document-text',
  documentTextOutline: 'document-text-outline',
  statsChart: 'stats-chart',
  globe: 'globe',
  save: 'save',
  refresh: 'refresh',
  helpCircle: 'help-circle',
  helpCircleOutline: 'help-circle-outline',
  book: 'book',
  bookOutline: 'book-outline',
  informationCircle: 'information-circle',
  moon: 'moon',
  sunny: 'sunny',
  phonePortrait: 'phone-portrait-outline',
  megaphone: 'megaphone',
  people: 'people',
  flag: 'flag',
  trash: 'trash',
  filter: 'filter',
  options: 'options',
  settingsOutline: 'settings-outline',
  calendarOutline: 'calendar-outline',
  home: 'home',
  homeOutline: 'home-outline',
  notifications: 'notifications',
  notificationsOutline: 'notifications-outline',
  chatbubbles: 'chatbubbles',
  chatbubblesOutline: 'chatbubbles-outline',
  grid: 'grid',
  gridOutline: 'grid-outline',
  layers: 'layers',
  layersOutline: 'layers-outline',
  eye: 'eye',
  eyeOff: 'eye-off',
  cellular: 'phone-portrait-outline',
  chatboxEllipses: 'chatbox-ellipses',
  sparkles: 'sparkles',
  ribbon: 'ribbon',
  logOutOutline: 'log-out-outline',
  createOutline: 'create-outline',
  construct: 'construct',
  ellipseOutline: 'ellipse-outline',
  logoWhatsapp: 'logo-whatsapp',
};

const FALLBACK = 'help-circle-outline';

/**
 * @param {object} props
 * @param {keyof typeof ICON_MAP | string} props.name
 * @param {string} [props.color]
 * @param {number} [props.size]
 * @param {import('react-native').StyleProp<import('react-native').ViewStyle>} [props.style]
 */
const AppIcon = ({ name, color = '#64748B', size = 22, style }) => {
  const glyph = ICON_MAP[name] || FALLBACK;
  return <Ionicons name={glyph} size={size} color={color} style={style} />;
};

export default AppIcon;
