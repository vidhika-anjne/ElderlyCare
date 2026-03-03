import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

interface Props {
  icon: string;
  message: string;
  hint?: string;
}

export default function EmptyState({ icon, message, hint }: Props) {
  return (
    <View style={[styles.card, SHADOW.small]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.message}>{message}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  icon: { fontSize: 40, marginBottom: SPACING.sm },
  message: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  hint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
});
