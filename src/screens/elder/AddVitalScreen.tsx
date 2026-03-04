import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import { recordVital } from '../../api/vitals';
import { VitalType } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

const VITAL_OPTIONS: { type: VitalType; label: string; icon: string; unit: string }[] = [
  { type: 'BLOOD_SUGAR', label: 'Blood Sugar', icon: '🩸', unit: 'mg/dL' },
  { type: 'BLOOD_PRESSURE', label: 'Blood Pressure', icon: '💉', unit: 'mmHg' },
  { type: 'HEART_RATE', label: 'Heart Rate', icon: '❤️', unit: 'bpm' },
  { type: 'OXYGEN_SATURATION', label: 'Oxygen Saturation', icon: '🫁', unit: '%' },
  { type: 'TEMPERATURE', label: 'Temperature', icon: '🌡️', unit: '°F' },
];

export default function AddVitalScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [selectedType, setSelectedType] = useState<VitalType | null>(null);
  const [value, setValue] = useState('');
  const [secondaryValue, setSecondaryValue] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedOption = VITAL_OPTIONS.find(o => o.type === selectedType);
  const isBP = selectedType === 'BLOOD_PRESSURE';

  const handleSubmit = async () => {
    if (!selectedType) {
      Alert.alert('Select Type', 'Please select a vital type.');
      return;
    }
    if (!value.trim() || isNaN(Number(value))) {
      Alert.alert('Invalid Value', 'Please enter a valid numeric value.');
      return;
    }
    if (isBP && (!secondaryValue.trim() || isNaN(Number(secondaryValue)))) {
      Alert.alert('Invalid Value', 'Please enter a valid diastolic value.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await recordVital({
        elderId: user.id,
        vitalType: selectedType,
        value: Number(value),
        secondaryValue: isBP ? Number(secondaryValue) : undefined,
        unit: selectedOption!.unit,
        recordedAt: new Date().toISOString(),
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Vital reading recorded successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to record vital. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {/* Vital Type Selector */}
        <Text style={styles.sectionTitle}>Select Vital Type</Text>
        <View style={styles.typeGrid}>
          {VITAL_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.type}
              style={[
                styles.typeBtn,
                SHADOW.small,
                selectedType === opt.type && styles.typeBtnActive,
              ]}
              onPress={() => setSelectedType(opt.type)}
              activeOpacity={0.8}>
              <Text style={styles.typeIcon}>{opt.icon}</Text>
              <Text
                style={[
                  styles.typeLabel,
                  selectedType === opt.type && styles.typeLabelActive,
                ]}>
                {opt.label}
              </Text>
              <Text style={styles.typeUnit}>{opt.unit}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedType && (
          <View style={[styles.card, SHADOW.medium]}>
            <Text style={styles.cardTitle}>
              {selectedOption?.icon} Enter {selectedOption?.label}
            </Text>

            {/* Primary value */}
            <Text style={styles.label}>
              {isBP ? 'Systolic (Top Number)' : 'Value'} ({selectedOption?.unit})
            </Text>
            <TextInput
              style={styles.input}
              value={value}
              onChangeText={setValue}
              placeholder={isBP ? 'e.g. 120' : 'e.g. 98.6'}
              placeholderTextColor={COLORS.disabled}
              keyboardType="decimal-pad"
              returnKeyType={isBP ? 'next' : 'done'}
            />

            {/* Diastolic for BP */}
            {isBP && (
              <>
                <Text style={styles.label}>Diastolic (Bottom Number) (mmHg)</Text>
                <TextInput
                  style={styles.input}
                  value={secondaryValue}
                  onChangeText={setSecondaryValue}
                  placeholder="e.g. 80"
                  placeholderTextColor={COLORS.disabled}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                />
              </>
            )}

            {/* Notes */}
            <Text style={styles.label}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any additional notes…"
              placeholderTextColor={COLORS.disabled}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Record Vital</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  typeBtn: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  typeIcon: { fontSize: 28, marginBottom: 4 },
  typeLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.subtext,
    textAlign: 'center',
  },
  typeLabelActive: { color: COLORS.primary },
  typeUnit: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.disabled,
    marginTop: 2,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  cardTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : 10,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
  },
  textArea: {
    minHeight: 80,
    paddingTop: SPACING.sm,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
