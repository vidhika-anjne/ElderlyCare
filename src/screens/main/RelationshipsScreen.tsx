import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  acceptRelationship,
  getMyChildren,
  getMyElders,
  revokeRelationship,
} from '../../api/relationships';
import { RelationshipResponse } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

export default function RelationshipsScreen() {
  const { user } = useAuth();
  const isElder = user?.role === 'ELDER';

  const [connections, setConnections] = useState<RelationshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Accept by ID form
  const [acceptId, setAcceptId] = useState('');
  const [acceptLoading, setAcceptLoading] = useState(false);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchConnections = useCallback(async () => {
    try {
      const data = isElder ? await getMyChildren() : await getMyElders();
      setConnections(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? 'Failed to load connections.';
      Alert.alert('Error', msg);
    }
  }, [isElder]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchConnections();
      setLoading(false);
    })();
  }, [fetchConnections]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConnections();
    setRefreshing(false);
  }, [fetchConnections]);

  // ── Revoke ─────────────────────────────────────────────────────────────────
  const handleRevoke = (rel: RelationshipResponse) => {
    const other = isElder ? rel.child : rel.elder;
    Alert.alert(
      'Revoke Connection',
      `Remove ${other.name} from your connections?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(rel.id);
            try {
              await revokeRelationship(rel.id);
              await fetchConnections();
            } catch (err: any) {
              const msg =
                err?.response?.data?.detail ?? 'Could not revoke connection.';
              Alert.alert('Error', msg);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  // ── Accept by ID ───────────────────────────────────────────────────────────
  const handleAccept = async () => {
    if (!acceptId.trim()) {
      Alert.alert('Missing ID', 'Enter the Relationship ID to accept.');
      return;
    }
    setAcceptLoading(true);
    try {
      await acceptRelationship(acceptId.trim());
      setAcceptId('');
      await fetchConnections();
      Alert.alert('Success', 'Connection accepted! You are now connected.');
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.response?.data?.message ??
        'Could not accept connection. Check the ID and try again.';
      Alert.alert('Error', msg);
    } finally {
      setAcceptLoading(false);
    }
  };

  const connectionLabel = isElder ? 'Active Guardians' : 'Elders You Monitor';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }>

      {/* ── Active Connections ──────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{connectionLabel}</Text>
      <Text style={styles.sectionHint}>
        Pull down to refresh. Tap Revoke to remove a connection.
      </Text>

      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : connections.length === 0 ? (
        <View style={[styles.emptyCard, SHADOW.small]}>
          <Text style={styles.emptyIcon}>🔗</Text>
          <Text style={styles.emptyText}>No active connections</Text>
          <Text style={styles.emptyHint}>
            Send a connection request from the Dashboard.
          </Text>
        </View>
      ) : (
        connections.map(rel => {
          const other = isElder ? rel.child : rel.elder;
          const isRevoking = actionLoading === rel.id;
          return (
            <View key={rel.id} style={[styles.card, SHADOW.small]}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: isElder ? COLORS.primary : '#7B1FA2' },
                  ]}>
                  <Text style={styles.avatarText}>
                    {other.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{other.name}</Text>
                  <Text style={styles.userEmail}>{other.email}</Text>
                  {other.phone && (
                    <Text style={styles.userMeta}>📞 {other.phone}</Text>
                  )}
                  <Text style={styles.connDate}>
                    Connected{' '}
                    {new Date(rel.updatedAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
              <View style={styles.cardActions}>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>● Active</Text>
                </View>
                <TouchableOpacity
                  style={[styles.revokeBtn, isRevoking && styles.btnDisabled]}
                  onPress={() => handleRevoke(rel)}
                  disabled={isRevoking}
                  activeOpacity={0.8}>
                  {isRevoking ? (
                    <ActivityIndicator color={COLORS.danger} size="small" />
                  ) : (
                    <Text style={styles.revokeBtnText}>Revoke</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* ── Accept Incoming Request ─────────────────────────────────────── */}
      <View style={[styles.acceptCard, SHADOW.small]}>
        <Text style={styles.acceptTitle}>✅ Accept an Incoming Request</Text>
        <Text style={styles.acceptHint}>
          When someone sends you a monitoring request, they'll share a
          Relationship ID with you. Enter it below to accept.
        </Text>
        <TextInput
          style={styles.input}
          value={acceptId}
          onChangeText={setAcceptId}
          placeholder="Paste Relationship ID here"
          placeholderTextColor={COLORS.disabled}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="done"
          onSubmitEditing={handleAccept}
        />
        <TouchableOpacity
          style={[styles.acceptBtn, acceptLoading && styles.btnDisabled]}
          onPress={handleAccept}
          disabled={acceptLoading}
          activeOpacity={0.8}>
          {acceptLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptBtnText}>Accept Connection</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },

  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  sectionHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.subtext,
    marginBottom: SPACING.md,
  },

  loader: { marginTop: SPACING.lg },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyIcon: { fontSize: 38, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  emptyHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  userInfo: { flex: 1 },
  userName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  userEmail: { fontSize: FONT_SIZE.sm, color: COLORS.subtext, marginTop: 2 },
  userMeta: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, marginTop: 2 },
  connDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.disabled,
    marginTop: 4,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.accent },
  revokeBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  revokeBtnText: { color: COLORS.danger, fontSize: FONT_SIZE.sm, fontWeight: '700' },
  btnDisabled: { opacity: 0.5 },

  // Accept form
  acceptCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
  },
  acceptTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  acceptHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.subtext,
    marginBottom: SPACING.md,
    lineHeight: 20,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.md : 10,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    backgroundColor: '#F8FAFC',
    marginBottom: SPACING.sm,
  },
  acceptBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.md,
    paddingVertical: 13,
    alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: '700' },
});
