import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import {
  getMedications,
  toggleMedication,
} from '../../api/medications';
import {
  MedicationResponse,
  MainStackParamList,
  Page,
} from '../../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, SPACING } from '../../theme';
import { MedicationCard, LoadingState, EmptyState } from '../../components/common';

type Nav = NativeStackNavigationProp<MainStackParamList>;

export default function MedicationsScreen() {
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();

  const [meds, setMeds] = useState<MedicationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPage = useCallback(
    async (pageNum: number, append = false) => {
      if (!user) return;
      try {
        const result: Page<MedicationResponse> = await getMedications(
          user.id,
          pageNum,
          20,
        );
        setMeds(prev =>
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

  // Refetch when navigating back after adding/editing
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPage(0);
    });
    return unsubscribe;
  }, [navigation, fetchPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPage(0);
    setRefreshing(false);
  }, [fetchPage]);

  const handleToggle = async (med: MedicationResponse) => {
    try {
      await toggleMedication(med.id);
      await fetchPage(0);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err?.response?.data?.detail ?? 'Could not toggle medication.',
      );
    }
  };

  const handleEdit = (med: MedicationResponse) => {
    navigation.navigate('AddMedication', { medication: med });
  };

  if (loading) return <LoadingState message="Loading medications…" />;

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.list}
      data={meds}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <MedicationCard
          medication={item}
          onEdit={handleEdit}
          onToggle={handleToggle}
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
          icon="💊"
          message="No medications yet"
          hint="Add your first medication from the dashboard"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, paddingBottom: SPACING.xl },
});
