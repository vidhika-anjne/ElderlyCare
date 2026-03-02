import React from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Dashboard'>;

const DashboardScreen = ({navigation}: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ElderlyCare Dashboard</Text>
      <Text style={styles.subtitle}>Welcome to your care portal.</Text>
      <View style={styles.menuBox}>
         <Text>No Active Relationships yet.</Text>
      </View>
      <Button title="Logout" onPress={() => navigation.replace('Login')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f5f5f5'},
  title: {fontSize: 26, fontWeight: 'bold', marginBottom: 10},
  subtitle: {fontSize: 16, color: '#666', marginBottom: 30},
  menuBox: {backgroundColor: 'white', padding: 20, borderRadius: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 20},
});

export default DashboardScreen;
