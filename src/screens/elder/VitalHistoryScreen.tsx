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

import { useAuth } from '../../context/AuthContext';
import { getVitalsByElder, getVitalsByType } from '../../api/vitals';
import {
  VitalRecordResponse,
  VitalType,
  MainStackParamList,
  Page,
} from '../../types';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../theme';
import { VitalCard, LoadingState, EmptyState } from '../../components/common';

const FILTER_OPTIONS: { type: VitalType | 'ALL'; label: string }[] = [
  { type: 'ALL', label: 'All' },
  { type: 'BLOOD_SUGAR', label: '🩸 Sugar' },
  { type: 'BLOOD_PRESSURE', label: '💉 BP' },
  { type: 'HEART_RATE', label: '❤️ HR' },
  { type: 'OXYGEN_SATURATION', label: '🫁 O₂' },
  { type: 'TEMPERATURE', label: '🌡️ Temp' },
];

type RouteParams = RouteProp<MainStackParamList, 'VitalHistory'>;

export default function VitalHistoryScreen() {
  const route = useRoute<RouteParams>();
  const { user } = useAuth();
  const initialType = route.params?.vitalType;

  const [filter, setFilter] = useState<VitalType | 'ALL'>(initialType ?? 'ALL');
  const [records, setRecords] = useState<VitalRecordResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      if (!user) return;
      try {
        let result: Page<VitalRecordResponse>;
        if (filter === 'ALL') {
          result = await getVitalsByElder(user.id, pageNum, 20);
        } else {
          result = await getVitalsByType(user.id, filter, pageNum, 20);
        }
        setRecords(prev =>
          append ? [...prev, ...result.content] : result.content,
        );
        setHasMore(!result.last);
        setPage(pageNum);
      } catch {}
    },
    [user, filter],
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

  const onEndReached = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    await fetchPage(page + 1, true);
    setLoadingMore(false);
  }, [hasMore, loadingMore, page, fetchPage]);

  const handleFilterChange = (type: VitalType | 'ALL') => {
    setFilter(type);
    setRecords([]);
  };

  if (loading) return <LoadingState message="Loading vitals history…" />;

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

      {/* Records list */}
      <FlatList
        data={records}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
            hint="Record your first vital reading to see history here"
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
});
