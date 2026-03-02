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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import { getMyChildren, getMyElders } from '../../api/relationships';
import { RelationshipResponse, MainStackParamList } from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

type Nav = NativeStackNavigationProp<MainStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [connections, setConnections] = useState<RelationshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isElder = user?.role === 'ELDER';

  const fetchConnections = useCallback(async () => {
    try {
      const data = isElder ? await getMyChildren() : await getMyElders();
      setConnections(data);
    } catch {
      // Silently fail on dashboard — user can refresh
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

  const roleBadgeColor = isElder ? '#7B1FA2' : COLORS.primary;
  const roleLabel = isElder ? '👴 Elder' : '👨‍👩‍👦 Guardian';
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
      {/* Welcome Banner */}
      <View style={[styles.banner, SHADOW.medium]}>
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: roleBadgeColor }]}>
            <Text style={styles.badgeText}>{roleLabel}</Text>
          </View>
        </View>
        <Text style={styles.bannerSub}>
          {isElder
            ? 'People who care are keeping an eye on you 💙'
            : 'You are helping keep your loved ones safe 💚'}
        </Text>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, SHADOW.small]}>
          <Text style={styles.statNumber}>{connections.length}</Text>
          <Text style={styles.statLabel}>{connectionLabel}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('Relationships')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>🔗</Text>
          <Text style={styles.actionLabel}>My Connections</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('RequestConnection')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>➕</Text>
          <Text style={styles.actionLabel}>
            {isElder ? 'Add Guardian' : 'Add Elder'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>👤</Text>
          <Text style={styles.actionLabel}>My Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Active Connections List */}
      <Text style={styles.sectionTitle}>{connectionLabel}</Text>
      {loading ? (
        <ActivityIndicator color={COLORS.primary} style={styles.loader} />
      ) : connections.length === 0 ? (
        <View style={[styles.emptyCard, SHADOW.small]}>
          <Text style={styles.emptyIcon}>👋</Text>
          <Text style={styles.emptyText}>No active connections yet.</Text>
          <Text style={styles.emptyHint}>
            Tap "
            {isElder ? 'Add Guardian' : 'Add Elder'}
            " to send a connection request.
          </Text>
        </View>
      ) : (
        connections.map(rel => {
          const other = isElder ? rel.child : rel.elder;
          return (
            <View key={rel.id} style={[styles.connectionCard, SHADOW.small]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {other.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.connInfo}>
                <Text style={styles.connName}>{other.name}</Text>
                <Text style={styles.connEmail}>{other.email}</Text>
                {other.phone && (
                  <Text style={styles.connMeta}>📞 {other.phone}</Text>
                )}
                <View style={[styles.statusBadge, styles.statusActive]}>
                  <Text style={styles.statusText}>● Active</Text>
                </View>
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

  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  bannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  welcome: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)' },
  userName: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#fff', marginTop: 2 },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  badgeText: { color: '#fff', fontSize: FONT_SIZE.xs, fontWeight: '700' },
  bannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.sm,
  },

  statsRow: { flexDirection: 'row', marginBottom: SPACING.md },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statNumber: { fontSize: FONT_SIZE.xxl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, marginTop: 2 },

  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },

  actionsGrid: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  actionBtn: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  actionIcon: { fontSize: 26, marginBottom: 4 },
  actionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },

  loader: { marginTop: SPACING.lg },

  emptyCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 40, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  emptyHint: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.subtext,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  connectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.lg, fontWeight: '700' },
  connInfo: { flex: 1 },
  connName: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  connEmail: { fontSize: FONT_SIZE.sm, color: COLORS.subtext, marginTop: 2 },
  connMeta: { fontSize: FONT_SIZE.xs, color: COLORS.subtext, marginTop: 2 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusActive: { backgroundColor: '#E8F5E9' },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.accent },
});
