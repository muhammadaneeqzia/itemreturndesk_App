import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';


const AppModal = ({
  visible,
  onRequestClose,
  title,
  message,
  buttons = [],
  dismissOnBackdropPress = true,
  loading = false,
}) => {
  const { colors } = useTheme();

  const hide = () => {
    if (!loading) onRequestClose();
  };

  const handleBackdrop = () => {
    if (dismissOnBackdropPress && !loading) hide();
  };

  const runPress = async (btn) => {
    if (loading) return;
    try {
      await btn.onPress?.({ hide });
    } catch (e) {
      console.error('AppModal button error:', e);
    } finally {
      hide();
    }
  };

  const layoutVertical = buttons.length >= 3;

  const buttonStyle = (variant) => {
    const base = [styles.btn, layoutVertical ? styles.btnFull : styles.btnFlex];
    switch (variant) {
      case 'destructive':
        return [...base, { backgroundColor: colors.error }];
      case 'cancel':
        return [
          ...base,
          {
            backgroundColor: colors.surfaceMuted || colors.background,
            borderWidth: 1,
            borderColor: colors.border,
          },
        ];
      case 'secondary':
        return [...base, { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }];
      case 'primary':
      default:
        return [...base, { backgroundColor: colors.primary }];
    }
  };

  const buttonTextColor = (variant) => {
    if (variant === 'cancel' || variant === 'secondary') return colors.text;
    return colors.textInverse;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={hide}>
      <TouchableWithoutFeedback onPress={handleBackdrop}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {title ? (
                <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
              ) : null}
              {message ? (
                <ScrollView style={styles.messageScroll} keyboardShouldPersistTaps="handled">
                  <Text style={[styles.message, { color: colors.textSecondary }]}>{message}</Text>
                </ScrollView>
              ) : null}

              {loading ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color={colors.primary} />
                </View>
              ) : (
                <View style={[styles.actions, layoutVertical ? styles.actionsCol : styles.actionsRow]}>
                  {buttons.map((btn, index) => (
                    <TouchableOpacity
                      key={`${btn.text}-${index}`}
                      style={buttonStyle(btn.variant)}
                      onPress={() => runPress(btn)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.btnText, { color: buttonTextColor(btn.variant) }]}>{btn.text}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  messageScroll: {
    maxHeight: 220,
    marginBottom: 16,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  loadingRow: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  actions: {
    gap: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  actionsCol: {
    flexDirection: 'column',
  },
  btn: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnFlex: {
    minWidth: 100,
  },
  btnFull: {
    width: '100%',
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AppModal;
