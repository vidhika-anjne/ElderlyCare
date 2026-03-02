import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, ScrollView} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen = ({navigation}: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ELDER'); // Default role

  const handleRegister = () => {
    // TODO: Connect to backend
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <Text>Register as: {role}</Text>
      <View style={styles.buttonRow}>
        <Button title="Register as Elder" onPress={() => setRole('ELDER')} />
        <Button title="Register as Child" onPress={() => setRole('CHILD')} />
      </View>
      <Button title="Register" onPress={handleRegister} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 20},
  title: {fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center'},
  input: {borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15},
  buttonRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20},
});

export default RegisterScreen;
