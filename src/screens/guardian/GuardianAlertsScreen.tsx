import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { getMyElders } from '../../api/relationships';
import {
  getActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
} from '../../api/alerts';
import {
  RelationshipResponse,
  HealthAlertResponse,
} from '../../types';
import { COLORS, FONT_SIZE, SPACING } from '../../theme';
import { AlertBanner, LoadingState, EmptyState } from '../../components/common';

export default function GuardianAlertsScreen() {
  useAuth(); // ensure authenticated

  const [alerts, setAlerts] = useState<HealthAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = useCallback(async () => {
    try {
      // Fetch all elders, then all their active alerts
      const elders = await getMyElders();
      const allAlerts: HealthAlertResponse[] = [];
      await Promise.all(
        elders.map(async (rel: RelationshipResponse) => {
          try {
            const elderAlerts = await getActiveAlerts(rel.elder.id);
            allAlerts.push(...elderAlerts);
          } catch {}
        }),
      );
      // Sort by createdAt descending
      allAlerts.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      setAlerts(allAlerts);
    } catch {}
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchAlerts();
      setLoading(false);
    })();
  }, [fetchAlerts]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAlerts();
    setRefreshing(false);
  }, [fetchAlerts]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      await fetchAlerts();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail ?? 'Could not acknowledge.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      await fetchAlerts();
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail ?? 'Could not resolve.');
    }
  };

  if (loading) return <LoadingState message="Loading alerts from all elders…" />;

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.list}
      data={alerts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={styles.alertWrapper}>
          <Text style={styles.elderLabel}>👴 {item.elderName}</Text>
          <AlertBanner
            alerts={[item]}
            onAcknowledge={handleAcknowledge}
            onResolve={handleResolve}
          />
        </View>
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="✅"
          message="No active alerts"
          hint="All elders' readings are within normal range"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  alertWrapper: { marginBottom: SPACING.sm },
  elderLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.subtext,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
