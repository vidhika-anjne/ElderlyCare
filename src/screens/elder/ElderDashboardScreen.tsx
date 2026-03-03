import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '../../context/AuthContext';
import { getLatestVitals } from '../../api/vitals';
import { getActiveAlerts, acknowledgeAlert } from '../../api/alerts';
import { getActiveMedications } from '../../api/medications';
import { getIncomingPendingRequests, getSentPendingRequests } from '../../api/relationships';
import {
  VitalRecordResponse,
  HealthAlertResponse,
  MedicationResponse,
  RelationshipResponse,
  MainStackParamList,
} from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';
import {
  LoadingState,
  AlertBanner,
  VitalCard,
  MedicationCard,
  SummaryCard,
  EmptyState,
} from '../../components/common';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function ElderDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [vitals, setVitals] = useState<VitalRecordResponse[]>([]);
  const [alerts, setAlerts] = useState<HealthAlertResponse[]>([]);
  const [medications, setMedications] = useState<MedicationResponse[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<RelationshipResponse[]>([]);
  const [sentRequests, setSentRequests] = useState<RelationshipResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      const [v, a, m, incoming, sent] = await Promise.all([
        getLatestVitals(user.id),
        getActiveAlerts(user.id),
        getActiveMedications(user.id),
        getIncomingPendingRequests(),
        getSentPendingRequests(),
      ]);
      setVitals(v);
      setAlerts(a);
      setMedications(m);
      setIncomingRequests(incoming);
      setSentRequests(sent);
    } catch {}
  }, [user]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchData();
      setLoading(false);
    })();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      await fetchData();
    } catch {}
  };

  if (loading) return <LoadingState message="Loading your health data…" />;

  const abnormalCount = vitals.filter(v => v.isAbnormal).length;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }>
      {/* Welcome */}
      <View style={[styles.banner, SHADOW.medium]}>
        <Text style={styles.welcome}>Good day,</Text>
        <Text style={styles.name}>{user?.name} 👴</Text>
        <Text style={styles.bannerSub}>Here's your health overview</Text>
      </View>

      {/* Pending Request Notifications */}
      {incomingRequests.length > 0 && (
        <TouchableOpacity
          style={[styles.requestNotification, SHADOW.small]}
          onPress={() => navigation.navigate('Relationships')}
          activeOpacity={0.8}>
          <Text style={styles.requestNotifIcon}>📩</Text>
          <View style={styles.requestNotifContent}>
            <Text style={styles.requestNotifTitle}>
              {incomingRequests.length} Incoming Request{incomingRequests.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.requestNotifHint}>
              Tap to view and accept connection requests
            </Text>
          </View>
          <View style={styles.requestBadge}>
            <Text style={styles.requestBadgeText}>{incomingRequests.length}</Text>
          </View>
        </TouchableOpacity>
      )}

      {sentRequests.length > 0 && (
        <TouchableOpacity
          style={[styles.sentNotification, SHADOW.small]}
          onPress={() => navigation.navigate('Relationships')}
          activeOpacity={0.8}>
          <Text style={styles.requestNotifIcon}>📤</Text>
          <View style={styles.requestNotifContent}>
            <Text style={styles.sentNotifTitle}>
              {sentRequests.length} Pending Sent Request{sentRequests.length > 1 ? 's' : ''}
            </Text>
            <Text style={styles.requestNotifHint}>
              Waiting for acceptance
            </Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Active Alerts</Text>
          <AlertBanner alerts={alerts} onAcknowledge={handleAcknowledge} />
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <SummaryCard
          icon="📊"
          title="Vitals Tracked"
          value={vitals.length}
        />
        <SummaryCard
          icon="⚠️"
          title="Abnormal"
          value={abnormalCount}
          valueColor={abnormalCount > 0 ? COLORS.danger : COLORS.accent}
        />
        <SummaryCard
          icon="💊"
          title="Active Meds"
          value={medications.length}
        />
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('AddVital')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>📝</Text>
          <Text style={styles.actionLabel}>Add Vital</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('VitalHistory', {})}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionLabel}>Vital History</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('AddLabReport')}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>🧪</Text>
          <Text style={styles.actionLabel}>Add Lab Report</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, SHADOW.small]}
          onPress={() => navigation.navigate('AddMedication', {})}
          activeOpacity={0.8}>
          <Text style={styles.actionIcon}>💊</Text>
          <Text style={styles.actionLabel}>Add Medication</Text>
        </TouchableOpacity>
      </View>

      {/* Latest Vitals */}
      <Text style={styles.sectionTitle}>Latest Vitals</Text>
      {vitals.length === 0 ? (
        <EmptyState
          icon="📊"
          message="No vitals recorded yet"
          hint="Tap 'Add Vital' to record your first reading"
        />
      ) : (
        vitals.map(v => <VitalCard key={v.id} vital={v} compact />)
      )}

      {/* Active Medications */}
      <Text style={styles.sectionTitle}>Active Medications</Text>
      {medications.length === 0 ? (
        <EmptyState
          icon="💊"
          message="No active medications"
          hint="Tap 'Add Medication' to add one"
        />
      ) : (
        medications.slice(0, 3).map(m => (
          <MedicationCard key={m.id} medication={m} />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },
  banner: {
    backgroundColor: '#7B1FA2',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  welcome: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.8)' },
  name: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#fff', marginTop: 2 },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.sm, marginTop: SPACING.xs },
  section: { marginBottom: SPACING.md },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  actionBtn: {
    width: '48%',
    flexGrow: 1,
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
  // Pending request notifications
  requestNotification: {
    backgroundColor: '#FFF8E1',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6F00',
  },
  sentNotification: {
    backgroundColor: '#FFF3E0',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA726',
  },
  requestNotifIcon: { fontSize: 28, marginRight: SPACING.sm },
  requestNotifContent: { flex: 1 },
  requestNotifTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#E65100',
  },
  sentNotifTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: '#F57C00',
  },
  requestNotifHint: {
    fontSize: FONT_SIZE.xs,
    color: '#795548',
    marginTop: 2,
  },
  requestBadge: {
    backgroundColor: '#FF6F00',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  requestBadgeText: {
    color: '#fff',
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
  },
});
