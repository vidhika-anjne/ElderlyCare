import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  getAlertsByElder,
  acknowledgeAlert,
  resolveAlert,
} from '../../api/alerts';
import { HealthAlertResponse, Page } from '../../types';
import { COLORS, SPACING } from '../../theme';
import { AlertBanner, LoadingState, EmptyState } from '../../components/common';

export default function AlertsScreen() {
  const { user } = useAuth();

  const [alerts, setAlerts] = useState<HealthAlertResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      if (!user) return;
      try {
        const result: Page<HealthAlertResponse> = await getAlertsByElder(
          user.id,
          pageNum,
          20,
        );
        setAlerts(prev =>
          append ? [...prev, ...result.content] : result.content,
        );
        setHasMore(!result.last);
        setPage(pageNum);
      } catch {}
    },
    [user],
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchPage(0);
      setLoading(false);
    })();
  }, [fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(0);
    setRefreshing(false);
  }, [fetchPage]);

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      await fetchPage(0);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail ?? 'Could not acknowledge alert.');
    }
  };

  const handleResolve = async (id: string) => {
    try {
      await resolveAlert(id);
      await fetchPage(0);
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.detail ?? 'Could not resolve alert.');
    }
  };

  if (loading) return <LoadingState message="Loading alerts…" />;

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.list}
      data={alerts}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <AlertBanner
          alerts={[item]}
          onAcknowledge={handleAcknowledge}
          onResolve={handleResolve}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
        />
      }
      onEndReached={() => {
        if (hasMore) fetchPage(page + 1, true);
      }}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={
        <EmptyState
          icon="✅"
          message="No alerts"
          hint="All your readings are within normal range"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
});
