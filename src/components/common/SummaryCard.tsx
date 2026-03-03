import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string | number;
  onPress?: () => void;
  style?: ViewStyle;
  valueColor?: string;
}

export default function SummaryCard({
  icon,
  title,
  subtitle,
  value,
  onPress,
  style,
  valueColor = COLORS.primary,
}: Props) {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.card, SHADOW.small, style]}
      onPress={onPress}
      activeOpacity={0.8}>
      <Text style={styles.icon}>{icon}</Text>
      {value !== undefined && (
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      )}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 100,
  },
  icon: { fontSize: 26, marginBottom: 4 },
  value: { fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  title: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: 1,
  },
});
