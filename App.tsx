/**
 * Elderly Care — React Native App
 * Consumes the elderly-care-backend Spring Boot API.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import { MedicalProvider } from './src/context/MedicalContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1565C0" />
      <AuthProvider>
        <MedicalProvider>
          <AppNavigator />
        </MedicalProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
