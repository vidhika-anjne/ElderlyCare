import React from 'react';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import {
  AuthStackParamList,
  MainStackParamList,
  ElderTabParamList,
  GuardianTabParamList,
} from '../types';
import { COLORS, FONT_SIZE } from '../theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Shared screens
import ProfileScreen from '../screens/main/ProfileScreen';
import RelationshipsScreen from '../screens/main/RelationshipsScreen';
import RequestConnectionScreen from '../screens/main/RequestConnectionScreen';

// Elder screens
import ElderDashboardScreen from '../screens/elder/ElderDashboardScreen';
import AddVitalScreen from '../screens/elder/AddVitalScreen';
import VitalHistoryScreen from '../screens/elder/VitalHistoryScreen';
import MedicationsScreen from '../screens/elder/MedicationsScreen';
import AddMedicationScreen from '../screens/elder/AddMedicationScreen';
import AddLabReportScreen from '../screens/elder/AddLabReportScreen';
import AlertsScreen from '../screens/elder/AlertsScreen';

// Guardian screens
import GuardianDashboardScreen from '../screens/guardian/GuardianDashboardScreen';
import ElderDetailScreen from '../screens/guardian/ElderDetailScreen';
import ElderVitalHistoryScreen from '../screens/guardian/ElderVitalHistoryScreen';
import GuardianAlertsScreen from '../screens/guardian/GuardianAlertsScreen';

enableScreens();

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const ElderTab = createBottomTabNavigator<ElderTabParamList>();
const GuardianTab = createBottomTabNavigator<GuardianTabParamList>();

// ── Tab icon helper ───────────────────────────────────────────────────────────
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
  );
}

// ── Auth Navigator ────────────────────────────────────────────────────────────
function AuthNavigator() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

// ── Elder Bottom Tabs ─────────────────────────────────────────────────────────
function ElderTabNavigator() {
  return (
    <ElderTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#7B1FA2',
        tabBarInactiveTintColor: COLORS.subtext,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <ElderTab.Screen
        name="ElderHome"
        component={ElderDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <ElderTab.Screen
        name="Vitals"
        component={VitalHistoryScreen}
        options={{
          tabBarLabel: 'Vitals',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <ElderTab.Screen
        name="Medications"
        component={MedicationsScreen}
        options={{
          tabBarLabel: 'Meds',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💊" focused={focused} />,
        }}
      />
      <ElderTab.Screen
        name="Alerts"
        component={AlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
      <ElderTab.Screen
        name="ElderProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </ElderTab.Navigator>
  );
}

// ── Guardian Bottom Tabs ──────────────────────────────────────────────────────
function GuardianTabNavigator() {
  return (
    <GuardianTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.subtext,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <GuardianTab.Screen
        name="GuardianHome"
        component={GuardianDashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <GuardianTab.Screen
        name="Elders"
        component={RelationshipsScreen}
        options={{
          tabBarLabel: 'Connections',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔗" focused={focused} />,
        }}
      />
      <GuardianTab.Screen
        name="GuardianAlerts"
        component={GuardianAlertsScreen}
        options={{
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🔔" focused={focused} />,
        }}
      />
      <GuardianTab.Screen
        name="GuardianProfile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </GuardianTab.Navigator>
  );
}

// ── Main Stack Navigator ──────────────────────────────────────────────────────
function MainNavigator() {
  const { user } = useAuth();
  const isElder = user?.role === 'ELDER';

  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: isElder ? '#7B1FA2' : COLORS.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', fontSize: 18 },
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}>
      {/* Tab root (no header — tabs handle their own layout) */}
      {isElder ? (
        <MainStack.Screen
          name="ElderTabs"
          component={ElderTabNavigator}
          options={{ title: 'Elderly Care', headerBackVisible: false }}
        />
      ) : (
        <MainStack.Screen
          name="GuardianTabs"
          component={GuardianTabNavigator}
          options={{ title: 'Guardian Panel', headerBackVisible: false }}
        />
      )}

      {/* Shared stack screens */}
      <MainStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <MainStack.Screen
        name="Relationships"
        component={RelationshipsScreen}
        options={{ title: 'My Connections' }}
      />
      <MainStack.Screen
        name="RequestConnection"
        component={RequestConnectionScreen}
        options={{ title: isElder ? 'Add Guardian' : 'Add Elder' }}
      />

      {/* Elder-only stack screens */}
      <MainStack.Screen
        name="AddVital"
        component={AddVitalScreen}
        options={{ title: 'Record Vital' }}
      />
      <MainStack.Screen
        name="VitalHistory"
        component={VitalHistoryScreen}
        options={{ title: 'Vital History' }}
      />
      <MainStack.Screen
        name="AddMedication"
        component={AddMedicationScreen}
        options={({ route }) => ({
          title: route.params?.medication ? 'Edit Medication' : 'Add Medication',
        })}
      />
      <MainStack.Screen
        name="AddLabReport"
        component={AddLabReportScreen}
        options={{ title: 'Upload Lab Report' }}
      />

      {/* Guardian-only stack screens */}
      <MainStack.Screen
        name="ElderDetail"
        component={ElderDetailScreen}
        options={({ route }) => ({
          title: route.params?.elderName ?? 'Elder Details',
        })}
      />
      <MainStack.Screen
        name="ElderVitalHistory"
        component={ElderVitalHistoryScreen}
        options={({ route }) => ({
          title: `${route.params?.elderName}'s Vitals`,
        })}
      />
    </MainStack.Navigator>
  );
}

// ── Root Navigator ────────────────────────────────────────────────────────────
export default function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
