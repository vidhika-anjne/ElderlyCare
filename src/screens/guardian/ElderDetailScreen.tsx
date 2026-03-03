import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { getLatestVitals } from '../../api/vitals';
import { getActiveAlerts, acknowledgeAlert } from '../../api/alerts';
import { getActiveMedications } from '../../api/medications';
import { getLabReports } from '../../api/labReports';
import {
  VitalRecordResponse,
  HealthAlertResponse,
  MedicationResponse,
  LabReportResponse,
  MainStackParamList,
  Page,
} from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';
import {
  LoadingState,
  AlertBanner,
  VitalCard,
  MedicationCard,
  LabReportCard,
  SummaryCard,
  EmptyState,
} from '../../components/common';

type RouteParams = RouteProp<MainStackParamList, 'ElderDetail'>;
type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function ElderDetailScreen() {
  const route = useRoute<RouteParams>();
  const navigation = useNavigation<Nav>();
  const { elderId, elderName } = route.params;

  const [vitals, setVitals] = useState<VitalRecordResponse[]>([]);
  const [alerts, setAlerts] = useState<HealthAlertResponse[]>([]);
  const [medications, setMedications] = useState<MedicationResponse[]>([]);
  const [labReports, setLabReports] = useState<LabReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [v, a, m, l] = await Promise.all([
        getLatestVitals(elderId),
        getActiveAlerts(elderId),
        getActiveMedications(elderId),
        getLabReports(elderId, 0, 5).then((r: Page<LabReportResponse>) => r.content),
      ]);
      setVitals(v);
      setAlerts(a);
      setMedications(m);
      setLabReports(l);
    } catch {}
  }, [elderId]);

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

  if (loading) return <LoadingState message={`Loading ${elderName}'s data…`} />;

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
      {/* Header */}
      <View style={[styles.banner, SHADOW.medium]}>
        <View style={styles.bannerAvatar}>
          <Text style={styles.bannerAvatarText}>
            {elderName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.bannerName}>{elderName}</Text>
        <Text style={styles.bannerSub}>Health Overview</Text>
      </View>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Active Alerts ({alerts.length})</Text>
          <AlertBanner alerts={alerts} onAcknowledge={handleAcknowledge} />
        </View>
      )}

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <SummaryCard
          icon="📊"
          title="Vitals"
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
          title="Meds"
          value={medications.length}
        />
      </View>

      {/* Latest Vitals */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Latest Vitals</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ElderVitalHistory', {
              elderId,
              elderName,
            })
          }
          activeOpacity={0.7}>
          <Text style={styles.viewAll}>View History →</Text>
        </TouchableOpacity>
      </View>
      {vitals.length === 0 ? (
        <EmptyState icon="📊" message="No vitals recorded" />
      ) : (
        vitals.map(v => <VitalCard key={v.id} vital={v} compact />)
      )}

      {/* Active Medications */}
      <Text style={styles.sectionTitle}>Active Medications</Text>
      {medications.length === 0 ? (
        <EmptyState icon="💊" message="No active medications" />
      ) : (
        medications.map(m => <MedicationCard key={m.id} medication={m} />)
      )}

      {/* Lab Reports */}
      <Text style={styles.sectionTitle}>Recent Lab Reports</Text>
      {labReports.length === 0 ? (
        <EmptyState icon="🧪" message="No lab reports" />
      ) : (
        labReports.map(l => <LabReportCard key={l.id} report={l} />)
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
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  bannerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  bannerAvatarText: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  bannerName: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: '#fff' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: FONT_SIZE.sm, marginTop: 2 },
  section: { marginBottom: SPACING.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    marginTop: SPACING.sm,
  },
  viewAll: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
});
