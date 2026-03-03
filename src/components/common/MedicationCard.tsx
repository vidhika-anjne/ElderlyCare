import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MedicationResponse } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

interface Props {
  medication: MedicationResponse;
  onEdit?: (med: MedicationResponse) => void;
  onToggle?: (med: MedicationResponse) => void;
}

export default function MedicationCard({ medication, onEdit, onToggle }: Props) {
  const isActive = medication.isActive;

  return (
    <View style={[styles.card, SHADOW.small, !isActive && styles.inactive]}>
      <View style={styles.row}>
        <Text style={styles.icon}>💊</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{medication.medicineName}</Text>
          <Text style={styles.dosage}>
            {medication.dosage} · {medication.frequency}
          </Text>
          {medication.reminderTime && (
            <Text style={styles.meta}>⏰ Reminder: {medication.reminderTime}</Text>
          )}
          <Text style={styles.meta}>
            📅 {medication.startDate}
            {medication.endDate ? ` → ${medication.endDate}` : ' → Ongoing'}
          </Text>
          {medication.notes && (
            <Text style={styles.notes}>📝 {medication.notes}</Text>
          )}
        </View>
        <View style={styles.actions}>
          <View
            style={[
              styles.badge,
              isActive ? styles.activeBadge : styles.inactiveBadge,
            ]}>
            <Text
              style={[
                styles.badgeText,
                isActive ? styles.activeText : styles.inactiveText,
              ]}>
              {isActive ? '● Active' : '○ Stopped'}
            </Text>
          </View>
        </View>
      </View>
      {(onEdit || onToggle) && (
        <View style={styles.actionRow}>
          {onEdit && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => onEdit(medication)}
              activeOpacity={0.7}>
              <Text style={styles.editText}>✏️ Edit</Text>
            </TouchableOpacity>
          )}
          {onToggle && (
            <TouchableOpacity
              style={styles.toggleBtn}
              onPress={() => onToggle(medication)}
              activeOpacity={0.7}>
              <Text style={styles.toggleText}>
                {isActive ? '⏸ Pause' : '▶️ Resume'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
  inactive: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'flex-start' },
  icon: { fontSize: 28, marginRight: SPACING.sm, marginTop: 2 },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  dosage: { fontSize: FONT_SIZE.sm, color: COLORS.subtext, marginTop: 2 },
  meta: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, marginTop: 2 },
  notes: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.subtext,
    fontStyle: 'italic',
    marginTop: 4,
  },
  actions: { marginLeft: SPACING.sm },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  activeBadge: { backgroundColor: '#E8F5E9' },
  inactiveBadge: { backgroundColor: '#ECEFF1' },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  activeText: { color: COLORS.accent },
  inactiveText: { color: COLORS.subtext },
  actionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  editBtn: {
    backgroundColor: '#E3F2FD',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  editText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.primary },
  toggleBtn: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  toggleText: { fontSize: FONT_SIZE.xs, fontWeight: '700', color: COLORS.warning },
});
