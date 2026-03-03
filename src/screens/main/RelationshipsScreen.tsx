import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  acceptRelationship,
  getMyChildren,
  getMyElders,
  getIncomingPendingRequests,
  getSentPendingRequests,
  revokeRelationship,
} from '../../api/relationships';
import { RelationshipResponse } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

export default function RelationshipsScreen() {
  const { user } = useAuth();
  const isElder = user?.role === 'ELDER';

  const [connections, setConnections] = useState<RelationshipResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RelationshipResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<RelationshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [activeData, incoming, sent] = await Promise.all([
        isElder ? getMyChildren() : getMyElders(),
        getIncomingPendingRequests(),
        getSentPendingRequests(),
      ]);
      setConnections(activeData);
      setIncomingRequests(incoming);
      setSentRequests(sent);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ?? 'Failed to load connections.';
      Alert.alert('Error', msg);
    }
  }, [isElder]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAll();
      setLoading(false);
    })();
  }, [fetchAll]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAll();
    setRefreshing(false);
  }, [fetchAll]);

  // ── Accept incoming request ────────────────────────────────────────────────
  const handleAccept = (rel: RelationshipResponse) => {
    const sender = rel.requestedById === rel.elder.id ? rel.elder : rel.child;
    Alert.alert(
      'Accept Request',
      `Accept monitoring request from ${sender.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            setActionLoading(rel.id);
            try {
              await acceptRelationship(rel.id);
              await fetchAll();
              Alert.alert('Connected!', `You are now connected with ${sender.name}.`);
            } catch (err: any) {
              const msg =
                err?.response?.data?.detail ?? 'Could not accept request.';
              Alert.alert('Error', msg);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  // ── Reject / Revoke ────────────────────────────────────────────────────────
  const handleReject = (rel: RelationshipResponse) => {
    const sender = rel.requestedById === rel.elder.id ? rel.elder : rel.child;
    Alert.alert(
      'Decline Request',
      `Decline monitoring request from ${sender.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(rel.id);
            try {
              await revokeRelationship(rel.id);
              await fetchAll();
            } catch (err: any) {
              const msg =
                err?.response?.data?.detail ?? 'Could not decline request.';
              Alert.alert('Error', msg);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

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
              await fetchAll();
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

  const handleCancelSent = (rel: RelationshipResponse) => {
    const other = isElder ? rel.child : rel.elder;
    Alert.alert(
      'Cancel Request',
      `Cancel your pending request to ${other.name}?`,
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Cancel Request',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(rel.id);
            try {
              await revokeRelationship(rel.id);
              await fetchAll();
            } catch (err: any) {
              const msg =
                err?.response?.data?.detail ?? 'Could not cancel request.';
              Alert.alert('Error', msg);
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const connectionLabel = isElder ? 'Active Guardians' : 'Elders You Monitor';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

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

      {/* ── Incoming Requests (Notifications) ───────────────────────────── */}
      {incomingRequests.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📩 Incoming Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{incomingRequests.length}</Text>
            </View>
          </View>
          <Text style={styles.sectionHint}>
            These people want to connect with you. Accept or decline.
          </Text>

          {incomingRequests.map(rel => {
            const sender = rel.requestedById === rel.elder.id ? rel.elder : rel.child;
            const isProcessing = actionLoading === rel.id;
            return (
              <View key={rel.id} style={[styles.requestCard, SHADOW.small]}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: '#FF6F00' }]}>
                    <Text style={styles.avatarText}>
                      {sender.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{sender.name}</Text>
                    <Text style={styles.userEmail}>{sender.email}</Text>
                    <Text style={styles.requestMeta}>
                      wants to {isElder ? 'monitor your health' : 'be monitored by you'}
                    </Text>
                    <Text style={styles.connDate}>
                      Sent{' '}
                      {new Date(rel.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.declineBtn, isProcessing && styles.btnDisabled]}
                    onPress={() => handleReject(rel)}
                    disabled={isProcessing}
                    activeOpacity={0.8}>
                    {isProcessing ? (
                      <ActivityIndicator color={COLORS.danger} size="small" />
                    ) : (
                      <Text style={styles.declineBtnText}>Decline</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.acceptBtn, isProcessing && styles.btnDisabled]}
                    onPress={() => handleAccept(rel)}
                    disabled={isProcessing}
                    activeOpacity={0.8}>
                    {isProcessing ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.acceptBtnText}>Accept</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* ── Sent Requests (Awaiting) ────────────────────────────────────── */}
      {sentRequests.length > 0 && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📤 Sent Requests</Text>
            <View style={[styles.badge, { backgroundColor: '#FFF3E0' }]}>
              <Text style={[styles.badgeText, { color: '#E65100' }]}>
                {sentRequests.length}
              </Text>
            </View>
          </View>
          <Text style={styles.sectionHint}>
            Waiting for the other person to accept your request.
          </Text>

          {sentRequests.map(rel => {
            const other = isElder ? rel.child : rel.elder;
            const isProcessing = actionLoading === rel.id;
            return (
              <View key={rel.id} style={[styles.sentCard, SHADOW.small]}>
                <View style={styles.cardTop}>
                  <View style={[styles.avatar, { backgroundColor: '#FFA726' }]}>
                    <Text style={styles.avatarText}>
                      {other.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{other.name}</Text>
                    <Text style={styles.userEmail}>{other.email}</Text>
                    <Text style={styles.connDate}>
                      Requested{' '}
                      {new Date(rel.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingText}>⏳ Pending</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.cancelBtn, isProcessing && styles.btnDisabled]}
                    onPress={() => handleCancelSent(rel)}
                    disabled={isProcessing}
                    activeOpacity={0.8}>
                    {isProcessing ? (
                      <ActivityIndicator color={COLORS.danger} size="small" />
                    ) : (
                      <Text style={styles.cancelBtnText}>Cancel</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* ── Active Connections ──────────────────────────────────────────── */}
      <Text style={styles.sectionTitle}>{connectionLabel}</Text>
      <Text style={styles.sectionHint}>
        Pull down to refresh. Tap Revoke to remove a connection.
      </Text>

      {connections.length === 0 ? (
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  sectionHint: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.subtext,
    marginBottom: SPACING.md,
  },

  badge: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: '#D32F2F',
  },

  // ── Incoming request card ─────────────────────────────────────────────────
  requestCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  requestMeta: {
    fontSize: FONT_SIZE.xs,
    color: '#E65100',
    fontWeight: '600',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    gap: SPACING.sm,
  },
  declineBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  declineBtnText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },
  acceptBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },

  // ── Sent request card ─────────────────────────────────────────────────────
  sentCard: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  pendingBadge: {
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  pendingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: '#E65100',
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.danger,
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },

  // ── Active connection card ────────────────────────────────────────────────
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
});
