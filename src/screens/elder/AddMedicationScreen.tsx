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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useAuth } from '../../context/AuthContext';
import {
  createMedication,
  updateMedication,
} from '../../api/medications';
import { MainStackParamList } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

type RouteParams = RouteProp<MainStackParamList, 'AddMedication'>;

export default function AddMedicationScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteParams>();
  const { user } = useAuth();
  const existing = route.params?.medication;
  const isEditing = !!existing;

  const [medicineName, setMedicineName] = useState(existing?.medicineName ?? '');
  const [dosage, setDosage] = useState(existing?.dosage ?? '');
  const [frequency, setFrequency] = useState(existing?.frequency ?? '');
  const [reminderTime, setReminderTime] = useState(existing?.reminderTime ?? '');
  const [startDate, setStartDate] = useState(existing?.startDate ?? '');
  const [endDate, setEndDate] = useState(existing?.endDate ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const onStartDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(formatDate(selectedDate));
  };

  const onEndDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(formatDate(selectedDate));
  };

  const onTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const h = String(selectedDate.getHours()).padStart(2, '0');
      const min = String(selectedDate.getMinutes()).padStart(2, '0');
      setReminderTime(`${h}:${min}`);
    }
  };

  const handleSubmit = async () => {
    if (!medicineName.trim() || !dosage.trim() || !frequency.trim() || !startDate.trim()) {
      Alert.alert('Missing Fields', 'Name, dosage, frequency and start date are required.');
      return;
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim())) {
      Alert.alert('Invalid Date', 'Start date must be in YYYY-MM-DD format (e.g. 2026-03-04).');
      return;
    }
    if (endDate.trim() && !dateRegex.test(endDate.trim())) {
      Alert.alert('Invalid Date', 'End date must be in YYYY-MM-DD format (e.g. 2026-06-30).');
      return;
    }
    const timeRegex = /^\d{2}:\d{2}$/;
    if (reminderTime.trim() && !timeRegex.test(reminderTime.trim())) {
      Alert.alert('Invalid Time', 'Reminder time must be in HH:mm format (e.g. 08:00).');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      const payload = {
        elderId: user.id,
        medicineName: medicineName.trim(),
        dosage: dosage.trim(),
        frequency: frequency.trim(),
        reminderTime: reminderTime.trim() || undefined,
        startDate: startDate.trim(),
        endDate: endDate.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (isEditing && existing) {
        await updateMedication(existing.id, payload);
        Alert.alert('Updated', 'Medication updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await createMedication(payload);
        Alert.alert('Success', 'Medication added successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to save medication.';
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
        <View style={[styles.card, SHADOW.medium]}>
          <Text style={styles.cardTitle}>
            {isEditing ? '✏️ Edit Medication' : '💊 New Medication'}
          </Text>

          <Text style={styles.label}>Medicine Name *</Text>
          <TextInput
            style={styles.input}
            value={medicineName}
            onChangeText={setMedicineName}
            placeholder="e.g. Metformin"
            placeholderTextColor={COLORS.disabled}
            returnKeyType="next"
          />

          <Text style={styles.label}>Dosage *</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g. 500mg"
            placeholderTextColor={COLORS.disabled}
            returnKeyType="next"
          />

          <Text style={styles.label}>Frequency *</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="e.g. Twice daily"
            placeholderTextColor={COLORS.disabled}
            returnKeyType="next"
          />

          <Text style={styles.label}>Reminder Time (optional)</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.8}>
            <Text style={reminderTime ? styles.inputText : styles.placeholderText}>
              {reminderTime || 'Select time'}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={(() => {
                if (reminderTime) {
                  const [h, m] = reminderTime.split(':').map(Number);
                  const d = new Date(); d.setHours(h, m, 0, 0);
                  return d;
                }
                return new Date();
              })()}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}

          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowStartPicker(true)}
            activeOpacity={0.8}>
            <Text style={startDate ? styles.inputText : styles.placeholderText}>
              {startDate || 'Select date'}
            </Text>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startDate ? new Date(startDate + 'T00:00:00') : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onStartDateChange}
            />
          )}

          <Text style={styles.label}>End Date (optional)</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowEndPicker(true)}
            activeOpacity={0.8}>
            <Text style={endDate ? styles.inputText : styles.placeholderText}>
              {endDate || 'Select date'}
            </Text>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endDate ? new Date(endDate + 'T00:00:00') : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onEndDateChange}
            />
          )}

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional instructions…"
            placeholderTextColor={COLORS.disabled}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>
                {isEditing ? 'Update Medication' : 'Add Medication'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },
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
  textArea: { minHeight: 80, paddingTop: SPACING.sm },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },
  inputText: { fontSize: FONT_SIZE.md, color: COLORS.text },
  placeholderText: { fontSize: FONT_SIZE.md, color: COLORS.disabled },
});
