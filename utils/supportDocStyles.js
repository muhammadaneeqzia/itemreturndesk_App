import { StyleSheet } from 'react-native';
import { space } from './layout';

export const supportDocStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: space.lg,
    marginBottom: space.sm,
  },
  sectionTitleFirst: {
    marginTop: 0,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: space.md,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: space.xs,
    paddingLeft: space.sm,
  },
  linkButton: {
    marginTop: space.md,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  linkButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
