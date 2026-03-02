import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import { useAuth } from '../../context/AuthContext';
import { COLORS, FONT_SIZE, RADIUS, SPACING, SHADOW } from '../../theme';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => logout(),
        },
      ],
    );
  };

  const isElder = user?.role === 'ELDER';
  const roleColor = isElder ? '#7B1FA2' : COLORS.primary;
  const roleLabel = isElder ? '👴 Elder' : '👨‍👩‍👦 Guardian';

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : undefined;

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}>
      {/* Avatar & Name */}
      <View style={[styles.avatarCard, SHADOW.medium]}>
        <View style={[styles.avatar, { backgroundColor: roleColor }]}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <View style={[styles.badge, { backgroundColor: roleColor }]}>
          <Text style={styles.badgeText}>{roleLabel}</Text>
        </View>
        <View style={[styles.activeBadge, user?.active ? styles.activeBadgeOn : styles.activeBadgeOff]}>
          <Text style={styles.activeBadgeText}>
            {user?.active ? '● Active account' : '○ Inactive account'}
          </Text>
        </View>
      </View>

      {/* Info Card */}
      <View style={[styles.card, SHADOW.small]}>
        <Text style={styles.cardTitle}>Account Information</Text>

        <InfoRow icon="✉️" label="Email" value={user?.email} />
        <InfoRow icon="📞" label="Phone" value={user?.phone} />
        <InfoRow icon="🎂" label="Date of Birth" value={user?.dateOfBirth} />
        <InfoRow icon="📅" label="Member Since" value={memberSince} />
        <InfoRow icon="🔑" label="User ID" value={user?.id} />
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={[styles.logoutBtn, SHADOW.small]}
        onPress={handleLogout}
        activeOpacity={0.8}>
        <Text style={styles.logoutText}>🚪 Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.md, paddingBottom: SPACING.xl },

  avatarCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { color: '#fff', fontSize: FONT_SIZE.xxl, fontWeight: '800' },
  name: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  badge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    marginBottom: SPACING.sm,
  },
  badgeText: { color: '#fff', fontSize: FONT_SIZE.sm, fontWeight: '700' },
  activeBadge: {
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
  },
  activeBadgeOn: { backgroundColor: '#E8F5E9' },
  activeBadgeOff: { backgroundColor: '#FFEBEE' },
  activeBadgeText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.subtext },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.sm,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoIcon: { fontSize: 18, marginRight: SPACING.sm, marginTop: 2 },
  infoContent: { flex: 1 },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.subtext,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: { fontSize: FONT_SIZE.md, color: COLORS.text },

  logoutBtn: {
    backgroundColor: '#FFEBEE',
    borderRadius: RADIUS.md,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    color: COLORS.danger,
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
  },
});
