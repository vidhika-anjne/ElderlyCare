import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import { getVitalsByElder, getVitalsByType, getVitalTrend } from '../../api/vitals';
import {
  VitalRecordResponse,
  VitalType,
  MainStackParamList,
  Page,
} from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';
import { VitalCard, LoadingState, EmptyState } from '../../components/common';

const FILTER_OPTIONS: { type: VitalType | 'ALL'; label: string }[] = [
  { type: 'ALL', label: 'All' },
  { type: 'BLOOD_SUGAR', label: '🩸 Sugar' },
  { type: 'BLOOD_PRESSURE', label: '💉 BP' },
  { type: 'HEART_RATE', label: '❤️ HR' },
  { type: 'OXYGEN_SATURATION', label: '🫁 O₂' },
  { type: 'TEMPERATURE', label: '🌡️ Temp' },
];

type RouteParams = RouteProp<MainStackParamList, 'ElderVitalHistory'>;

export default function ElderVitalHistoryScreen() {
  const route = useRoute<RouteParams>();
  const { elderId, elderName } = route.params;
  const initialType = route.params?.vitalType;

  const [filter, setFilter] = useState<VitalType | 'ALL'>(initialType ?? 'ALL');
  const [records, setRecords] = useState<VitalRecordResponse[]>([]);
  const [trendData, setTrendData] = useState<VitalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      try {
        let result: Page<VitalRecordResponse>;
        if (filter === 'ALL') {
          result = await getVitalsByElder(elderId, pageNum, 20);
        } else {
          result = await getVitalsByType(elderId, filter, pageNum, 20);
        }
        setRecords(prev =>
          append ? [...prev, ...result.content] : result.content,
        );
        setHasMore(!result.last);
        setPage(pageNum);
      } catch {}
    },
    [elderId, filter],
  );

  // Fetch trend when filter is a specific type
  const fetchTrend = useCallback(async () => {
    if (filter === 'ALL') {
      setTrendData([]);
      return;
    }
    try {
      const to = new Date().toISOString();
      const from = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const data = await getVitalTrend(elderId, filter, from, to);
      setTrendData(data);
    } catch {
      setTrendData([]);
    }
  }, [elderId, filter]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchPage(0), fetchTrend()]);
      setLoading(false);
    })();
  }, [fetchPage, fetchTrend]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchPage(0), fetchTrend()]);
    setRefreshing(false);
  }, [fetchPage, fetchTrend]);

  const onEndReached = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchPage(page + 1, true);
    setLoadingMore(false);
  }, [hasMore, loadingMore, page, fetchPage]);

  const handleFilterChange = (type: VitalType | 'ALL') => {
    setFilter(type);
    setRecords([]);
    setTrendData([]);
  };

  if (loading) return <LoadingState message={`Loading ${elderName}'s vitals…`} />;

  // Simple text-based trend visualization
  const renderTrendChart = () => {
    if (trendData.length < 2) return null;

    const values = trendData.map(d => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    return (
      <View style={[styles.trendCard, SHADOW.small]}>
        <Text style={styles.trendTitle}>📈 30-Day Trend</Text>
        <View style={styles.trendChart}>
          {trendData.slice(-15).map((d, i) => {
            const height = Math.max(8, ((d.value - min) / range) * 80);
            return (
              <View key={d.id || i} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height,
                      backgroundColor: d.isAbnormal
                        ? COLORS.danger
                        : COLORS.primary,
                    },
                  ]}
                />
                <Text style={styles.barLabel}>
                  {new Date(d.recordedAt).getDate()}
                </Text>
              </View>
            );
          })}
        </View>
        <View style={styles.trendMeta}>
          <Text style={styles.trendMetaText}>
            Min: {min.toFixed(1)} · Max: {max.toFixed(1)} · Avg:{' '}
            {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}
          </Text>
          <Text style={styles.trendMetaText}>
            {trendData.filter(d => d.isAbnormal).length} abnormal of{' '}
            {trendData.length} readings
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.flex}>
      {/* Filter chips */}
      <View style={styles.filterRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={FILTER_OPTIONS}
          keyExtractor={item => item.type}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip,
                filter === item.type && styles.chipActive,
              ]}
              onPress={() => handleFilterChange(item.type)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.chipText,
                  filter === item.type && styles.chipTextActive,
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderTrendChart}
        renderItem={({ item }) => <VitalCard vital={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="📊"
            message="No vital readings found"
            hint={`No readings for ${elderName}`}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <Text style={styles.loadingMore}>Loading more…</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  filterRow: {
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  chip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: '#ECEFF1',
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.subtext },
  chipTextActive: { color: '#fff' },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
  loadingMore: {
    textAlign: 'center',
    color: COLORS.subtext,
    fontSize: FONT_SIZE.sm,
    paddingVertical: SPACING.md,
  },
  trendCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  trendTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  trendChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
    paddingBottom: SPACING.sm,
  },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: {
    width: 12,
    borderRadius: 3,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 9,
    color: COLORS.subtext,
    marginTop: 2,
  },
  trendMeta: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  trendMetaText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.subtext,
    textAlign: 'center',
  },
});
