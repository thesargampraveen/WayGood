import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { COLORS, CARD_SHADOW } from '../theme';

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter your email and password');
      return;
    }
    setError('');
    setBusy(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not connect to the server');
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>अ</Text>
          </View>
          <Text style={styles.appName}>Bhasha</Text>
          <Text style={styles.tagline}>Learn Hindi • Marathi • English</Text>
        </View>

        {/* Form */}
        <View style={[styles.card, CARD_SHADOW]}>
          {error !== '' && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={COLORS.subtext}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.subtext}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={busy}>
            {busy ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>New here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.switchLink}>Create an account</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoText: { fontSize: 42, color: '#FFF', fontWeight: 'bold' },
  appName: { fontSize: 32, fontWeight: 'bold', color: COLORS.text },
  tagline: { fontSize: 14, color: COLORS.subtext, marginTop: 4 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
  },
  error: {
    color: COLORS.danger,
    backgroundColor: COLORS.dangerLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  label: { fontSize: 13, color: COLORS.subtext, marginBottom: 6, marginTop: 10 },
  input: {
    backgroundColor: COLORS.bg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  switchRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  switchText: { color: COLORS.subtext },
  switchLink: { color: COLORS.primary, fontWeight: 'bold' },
});

export default LoginScreen;
