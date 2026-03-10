import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList, Role } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<Nav>();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const onDobChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDobPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const y = selectedDate.getFullYear();
      const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const d = String(selectedDate.getDate()).padStart(2, '0');
      setDateOfBirth(`${y}-${m}-${d}`);
    }
  };

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password || !role) {
      Alert.alert(
        'Missing fields',
        'Name, email, password and role are required.',
      );
      return;
    }
    if (password.length < 8) {
      Alert.alert('Weak password', 'Password must be at least 8 characters.');
      return;
    }
    if (
      dateOfBirth &&
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth)
    ) {
      Alert.alert(
        'Invalid date',
        'Date of birth must be in YYYY-MM-DD format.',
      );
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
        role,
        dateOfBirth: dateOfBirth || undefined,
      });
      // AppNavigator picks up the new token automatically
    } catch (err: any) {
      console.error('[RegisterScreen] registration error:', err);
      if (err?.response) {
        console.error('[RegisterScreen] response status:', err.response.status);
        console.error('[RegisterScreen] response data:', JSON.stringify(err.response.data));
      }
      const errors = err?.response?.data?.errors;
      if (errors) {
        const msgs = Object.values(errors).join('\n');
        Alert.alert('Validation Error', msgs);
      } else {
        const msg =
          err?.response?.data?.detail ??
          err?.response?.data?.message ??
          'Registration failed. Please try again.';
        Alert.alert('Registration Failed', msg);
      }
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>🏥 Elderly Care</Text>
          <Text style={styles.subtitle}>Create your account</Text>
        </View>

        {/* Card */}
        <View style={[styles.card, SHADOW.medium]}>
          <Text style={styles.title}>Register</Text>

          {/* Role Selector */}
          <Text style={styles.label}>I am a…</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'ELDER' && styles.roleBtnActive,
              ]}
              onPress={() => setRole('ELDER')}
              activeOpacity={0.8}>
              <Text style={styles.roleIcon}>👴</Text>
              <Text
                style={[
                  styles.roleLabel,
                  role === 'ELDER' && styles.roleLabelActive,
                ]}>
                Elder
              </Text>
              <Text
                style={[
                  styles.roleDesc,
                  role === 'ELDER' && styles.roleDescActive,
                ]}>
                Being monitored
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleBtn,
                role === 'CHILD' && styles.roleBtnActive,
              ]}
              onPress={() => setRole('CHILD')}
              activeOpacity={0.8}>
              <Text style={styles.roleIcon}>👨‍👩‍👦</Text>
              <Text
                style={[
                  styles.roleLabel,
                  role === 'CHILD' && styles.roleLabelActive,
                ]}>
                Guardian
              </Text>
              <Text
                style={[
                  styles.roleDesc,
                  role === 'CHILD' && styles.roleDescActive,
                ]}>
                Monitoring an elder
              </Text>
            </TouchableOpacity>
          </View>

          {/* Name */}
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Jane Smith"
            placeholderTextColor={COLORS.disabled}
            autoCapitalize="words"
            returnKeyType="next"
          />

          {/* Email */}
          <Text style={styles.label}>Email Address *</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.disabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Password */}
          <Text style={styles.label}>Password * (min 8 chars)</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={COLORS.disabled}
              secureTextEntry={!showPassword}
              returnKeyType="next"
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(v => !v)}>
              <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone Number (optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+1234567890"
            placeholderTextColor={COLORS.disabled}
            keyboardType="phone-pad"
            returnKeyType="next"
          />

          {/* Date of Birth */}
          <Text style={styles.label}>Date of Birth (optional)</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDobPicker(true)}
            activeOpacity={0.8}>
            <Text style={dateOfBirth ? styles.inputText : styles.placeholderText}>
              {dateOfBirth || 'Select date'}
            </Text>
          </TouchableOpacity>
          {showDobPicker && (
            <DateTimePicker
              value={dateOfBirth ? new Date(dateOfBirth + 'T00:00:00') : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDobChange}
              maximumDate={new Date()}
            />
          )}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.linkRow}>
            <Text style={styles.linkText}>
              Already have an account?{' '}
              <Text style={styles.linkAccent}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: SPACING.lg, paddingBottom: SPACING.xl },
  header: { alignItems: 'center', marginBottom: SPACING.lg, marginTop: SPACING.md },
  appTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.subtext, marginTop: SPACING.xs },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
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
  passwordRow: { position: 'relative' },
  passwordInput: { paddingRight: 50 },
  eyeBtn: { position: 'absolute', right: 12, top: Platform.OS === 'ios' ? 12 : 10 },
  eyeText: { fontSize: 18 },

  // Role selector
  roleRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.sm,
  },
  roleBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  roleBtnActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#E3F2FD',
  },
  roleIcon: { fontSize: 28, marginBottom: 4 },
  roleLabel: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.subtext,
  },
  roleLabelActive: { color: COLORS.primary },
  roleDesc: { fontSize: FONT_SIZE.xs, color: COLORS.disabled, textAlign: 'center', marginTop: 2 },
  roleDescActive: { color: COLORS.primaryLight },

  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },

  linkRow: { alignItems: 'center', marginTop: SPACING.md },
  linkText: { fontSize: FONT_SIZE.sm, color: COLORS.subtext },
  linkAccent: { color: COLORS.primary, fontWeight: '700' },
  inputText: { fontSize: FONT_SIZE.md, color: COLORS.text },
  placeholderText: { fontSize: FONT_SIZE.md, color: COLORS.disabled },
});
