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
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useAuth } from '../../context/AuthContext';
import { createLabReport } from '../../api/labReports';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

export default function AddLabReportScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [testName, setTestName] = useState('');
  const [result, setResult] = useState('');
  const [testDate, setTestDate] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const onDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setTestDate(`${y}-${m}-${d}`);
    }
  };

  const handleSubmit = async () => {
    if (!testName.trim() || !result.trim() || !testDate.trim()) {
      Alert.alert('Missing Fields', 'Test name, result and test date are required.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(testDate.trim())) {
      Alert.alert('Invalid Date', 'Test date must be in YYYY-MM-DD format.');
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      await createLabReport({
        elderId: user.id,
        testName: testName.trim(),
        result: result.trim(),
        testDate: testDate.trim(),
        fileUrl: fileUrl.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      Alert.alert('Success', 'Lab report added successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to add lab report.';
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
          <Text style={styles.cardTitle}>🧪 Upload Lab Report</Text>

          <Text style={styles.label}>Test Name *</Text>
          <TextInput
            style={styles.input}
            value={testName}
            onChangeText={setTestName}
            placeholder="e.g. Complete Blood Count"
            placeholderTextColor={COLORS.disabled}
            returnKeyType="next"
          />

          <Text style={styles.label}>Result *</Text>
          <TextInput
            style={styles.input}
            value={result}
            onChangeText={setResult}
            placeholder="e.g. Normal / 6.5 mmol/L"
            placeholderTextColor={COLORS.disabled}
            returnKeyType="next"
          />

          <Text style={styles.label}>Test Date *</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
            activeOpacity={0.8}>
            <Text style={testDate ? styles.inputText : styles.placeholderText}>
              {testDate || 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={testDate ? new Date(testDate + 'T00:00:00') : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}

          <Text style={styles.label}>File URL (optional)</Text>
          <TextInput
            style={styles.input}
            value={fileUrl}
            onChangeText={setFileUrl}
            placeholder="https://example.com/report.pdf"
            placeholderTextColor={COLORS.disabled}
            autoCapitalize="none"
            keyboardType="url"
            returnKeyType="next"
          />

          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Doctor comments, follow-ups…"
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
              <Text style={styles.submitText}>Save Lab Report</Text>
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
