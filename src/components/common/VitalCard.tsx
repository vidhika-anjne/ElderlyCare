import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VitalRecordResponse } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

const VITAL_ICONS: Record<string, string> = {
  BLOOD_SUGAR: '🩸',
  BLOOD_PRESSURE: '💉',
  HEART_RATE: '❤️',
  OXYGEN_SATURATION: '🫁',
  TEMPERATURE: '🌡️',
};

interface Props {
  vital: VitalRecordResponse;
  compact?: boolean;
}

export default function VitalCard({ vital, compact = false }: Props) {
  const icon = VITAL_ICONS[vital.vitalType] ?? '📊';
  const displayValue =
    vital.vitalType === 'BLOOD_PRESSURE' && vital.secondaryValue
      ? `${vital.value}/${vital.secondaryValue}`
      : `${vital.value}`;

  return (
    <View
      style={[
        styles.card,
        SHADOW.small,
        vital.isAbnormal && styles.abnormal,
      ]}>
      <View style={styles.row}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.typeName}>
            {vital.vitalTypeDisplayName}
          </Text>
          {!compact && (
            <Text style={styles.time}>
              {new Date(vital.recordedAt).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </View>
        <View style={styles.valueCol}>
          <Text
            style={[
              styles.value,
              vital.isAbnormal && styles.abnormalText,
            ]}>
            {displayValue}
          </Text>
          <Text style={styles.unit}>{vital.unit}</Text>
        </View>
      </View>
      {vital.isAbnormal && (
        <View style={styles.abnormalBadge}>
          <Text style={styles.abnormalBadgeText}>⚠ Abnormal</Text>
        </View>
      )}
      {!compact && vital.notes ? (
        <Text style={styles.notes}>📝 {vital.notes}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  abnormal: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { fontSize: 28, marginRight: SPACING.sm },
  info: { flex: 1 },
  typeName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  time: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, marginTop: 2 },
  valueCol: { alignItems: 'flex-end' },
  value: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  abnormalText: { color: COLORS.danger },
  unit: { fontSize: FONT_SIZE.xs, color: COLORS.subtext },
  abnormalBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginTop: SPACING.xs,
  },
  abnormalBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.danger,
  },
  notes: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.subtext,
    marginTop: SPACING.xs,
    fontStyle: 'italic',
  },
});
