import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { HealthAlertResponse } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../theme';

interface Props {
  alerts: HealthAlertResponse[];
  onAcknowledge?: (id: string) => void;
  onResolve?: (id: string) => void;
}

export default function AlertBanner({ alerts, onAcknowledge, onResolve }: Props) {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.container}>
      {alerts.map(alert => {
        const isCritical = alert.severity === 'CRITICAL';
        const bgColor = isCritical ? '#FFEBEE' : '#FFF3E0';
        const borderColor = isCritical ? COLORS.danger : COLORS.warning;
        const iconColor = isCritical ? COLORS.danger : COLORS.warning;
        const icon = isCritical ? '🚨' : '⚠️';

        return (
          <View
            key={alert.id}
            style={[
              styles.banner,
              { backgroundColor: bgColor, borderLeftColor: borderColor },
            ]}>
            <View style={styles.header}>
              <Text style={styles.icon}>{icon}</Text>
              <View style={styles.textContainer}>
                <View style={styles.titleRow}>
                  <Text style={[styles.severity, { color: iconColor }]}>
                    {alert.severity}
                  </Text>
                  <Text style={styles.time}>
                    {new Date(alert.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>
                <Text style={styles.message}>{alert.message}</Text>
              </View>
            </View>
            {alert.status === 'ACTIVE' && (onAcknowledge || onResolve) && (
              <View style={styles.actions}>
                {onAcknowledge && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.ackBtn]}
                    onPress={() => onAcknowledge(alert.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.ackText}>Acknowledge</Text>
                  </TouchableOpacity>
                )}
                {onResolve && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.resolveBtn]}
                    onPress={() => onResolve(alert.id)}
                    activeOpacity={0.7}>
                    <Text style={styles.resolveText}>Resolve</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            {alert.status !== 'ACTIVE' && (
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>
                  {alert.status === 'ACKNOWLEDGED' ? '👁 Acknowledged' : '✅ Resolved'}
                  {alert.acknowledgedByName
                    ? ` by ${alert.acknowledgedByName}`
                    : ''}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: SPACING.sm },
  banner: {
    borderRadius: RADIUS.md,
    borderLeftWidth: 4,
    padding: SPACING.md,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 22, marginRight: SPACING.sm, marginTop: 2 },
  textContainer: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  severity: { fontSize: FONT_SIZE.xs, fontWeight: '800', letterSpacing: 0.5 },
  time: { fontSize: FONT_SIZE.xs, color: COLORS.subtext },
  message: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  actionBtn: {
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  ackBtn: { backgroundColor: '#E3F2FD' },
  ackText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.primary },
  resolveBtn: { backgroundColor: '#E8F5E9' },
  resolveText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.accent },
  statusRow: { marginTop: SPACING.xs },
  statusText: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, fontStyle: 'italic' },
});
