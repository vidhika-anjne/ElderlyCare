import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { requestRelationship } from '../../api/relationships';
import { RelationshipResponse } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

export default function RequestConnectionScreen() {
  const { user } = useAuth();
  const isElder = user?.role === 'ELDER';

  const [targetEmail, setTargetEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RelationshipResponse | null>(null);

  const handleSendRequest = async () => {
    if (!targetEmail.trim()) {
      Alert.alert('Missing Email', 'Please enter the email address to connect with.');
      return;
    }
    if (targetEmail.trim().toLowerCase() === user?.email) {
      Alert.alert('Invalid', 'You cannot send a request to yourself.');
      return;
    }

    setLoading(true);
    try {
      const res = await requestRelationship({
        targetEmail: targetEmail.trim().toLowerCase(),
      });
      setResult(res);
      setTargetEmail('');
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Failed to send request. Make sure the email is registered and has the correct role.';
      Alert.alert('Request Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleNewRequest = () => {
    setResult(null);
    setTargetEmail('');
  };

  const targetRoleLabel = isElder ? 'Guardian (CHILD account)' : 'Elder (ELDER account)';
  const targetRoleEmoji = isElder ? '👨‍👩‍👦' : '👴';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">

      {/* Info Banner */}
      <View style={[styles.infoBanner, SHADOW.small]}>
        <Text style={styles.infoBannerIcon}>{targetRoleEmoji}</Text>
        <View style={styles.infoBannerText}>
          <Text style={styles.infoBannerTitle}>
            {isElder ? 'Add a Guardian' : 'Add an Elder to Monitor'}
          </Text>
          <Text style={styles.infoBannerDesc}>
            {isElder
              ? 'Enter the email of a Guardian (CHILD account). They will receive a connection request to accept.'
              : 'Enter the email of an Elder. They will receive a connection request to accept.'}
          </Text>
        </View>
      </View>

      {result === null ? (
        /* ── Send Form ───────────────────────────────────────────────────── */
        <View style={[styles.card, SHADOW.medium]}>
          <Text style={styles.cardTitle}>Send Connection Request</Text>

          <Text style={styles.label}>
            {targetRoleEmoji} Email of {targetRoleLabel}
          </Text>
          <TextInput
            style={styles.input}
            value={targetEmail}
            onChangeText={setTargetEmail}
            placeholder="their@email.com"
            placeholderTextColor={COLORS.disabled}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={handleSendRequest}
          />

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSendRequest}
            disabled={loading}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>Send Request</Text>
            )}
          </TouchableOpacity>

          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              ℹ️ The connection is PENDING until the other person accepts it.
              Both parties must have opposite roles (ELDER ↔ CHILD).
            </Text>
          </View>
        </View>
      ) : (
        /* ── Success State ─────────────────────────────────────────────── */
        <View style={[styles.card, SHADOW.medium]}>
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>🎉</Text>
            <Text style={styles.successTitle}>Request Sent!</Text>
          </View>

          <Text style={styles.successDesc}>
            Your connection request is now{' '}
            <Text style={styles.pendingBold}>PENDING</Text>. Share the
            Relationship ID below with{' '}
            <Text style={styles.pendingBold}>
              {result.status === 'PENDING'
                ? (isElder ? result.child.name : result.elder.name)
                : 'the other person'}
            </Text>{' '}
            so they can accept it from the{' '}
            <Text style={styles.pendingBold}>My Connections</Text> screen.
          </Text>

          {/* Relationship ID display */}
          <View style={styles.idBox}>
            <Text style={styles.idLabel}>Relationship ID (long-press to copy)</Text>
            <Text selectable style={styles.idValue}>{result.id}</Text>
          </View>

          {/* Summary */}
          <View style={styles.summaryBox}>
            <Row label="Elder" value={result.elder.name} sub={result.elder.email} />
            <Row label="Guardian" value={result.child.name} sub={result.child.email} />
            <Row
              label="Status"
              value={result.status}
              valueStyle={{ color: COLORS.warning, fontWeight: '700' }}
            />
          </View>

          <TouchableOpacity
            style={styles.newBtn}
            onPress={handleNewRequest}
            activeOpacity={0.8}>
            <Text style={styles.newBtnText}>Send Another Request</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function Row({
  label,
  value,
  sub,
  valueStyle,
}: {
  label: string;
  value: string;
  sub?: string;
  valueStyle?: object;
}) {
  return (
    <View style={rowStyles.container}>
      <Text style={rowStyles.label}>{label}</Text>
      <View>
        <Text style={[rowStyles.value, valueStyle]}>{value}</Text>
        {sub && <Text style={rowStyles.sub}>{sub}</Text>}
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.subtext, fontWeight: '600' },
  value: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '600', textAlign: 'right' },
  sub: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, textAlign: 'right' },
});

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoBannerIcon: { fontSize: 28, marginRight: SPACING.sm },
  infoBannerText: { flex: 1 },
  infoBannerTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 2,
  },
  infoBannerDesc: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20 },

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
  btn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },

  noteBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginTop: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.warning,
  },
  noteText: { fontSize: FONT_SIZE.xs, color: '#5D4037', lineHeight: 18 },

  // ─ Success ─
  successHeader: { alignItems: 'center', marginBottom: SPACING.md },
  successIcon: { fontSize: 48, marginBottom: SPACING.xs },
  successTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.accent },
  successDesc: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  pendingBold: { fontWeight: '700', color: COLORS.text },

  idBox: {
    backgroundColor: '#F3E5F5',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CE93D8',
  },
  idLabel: { fontSize: FONT_SIZE.xs, color: '#6A1B9A', fontWeight: '700', marginBottom: 6 },
  idValue: {
    fontSize: FONT_SIZE.sm,
    color: '#4A148C',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    textAlign: 'center',
  },

  summaryBox: {
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    marginBottom: SPACING.md,
  },

  newBtn: {
    backgroundColor: '#E8F5E9',
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  newBtnText: { color: COLORS.accent, fontSize: FONT_SIZE.md, fontWeight: '700' },
});


