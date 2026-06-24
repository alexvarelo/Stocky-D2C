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
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../lib/AuthContext';
import { DottedLine } from '../components/DottedLine';

export function LoginScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    setLoading(true);
    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Printer slot visual */}
        <View style={styles.printerSlot}>
          <View style={styles.slotLine} />
        </View>

        {/* Receipt-style login card */}
        <View style={styles.receiptCard}>
          {/* Zigzag top */}
          <View style={styles.zigzagRow}>
            {Array.from({ length: 30 }, (_, i) => (
              <View key={i} style={styles.zigzagDown} />
            ))}
          </View>

          <View style={styles.receiptBody}>
            <Text style={styles.logo}>STOCKY</Text>
            <Text style={styles.subtitle}>TICKET PRINTER</Text>

            <DottedLine />

            <Text style={styles.sectionTitle}>AUTHENTICATION</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="your@email.com"
                placeholderTextColor={colors.inkFaint}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.inkFaint}
                secureTextEntry
              />
            </View>

            <DottedLine />

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.paper} />
              ) : (
                <Text style={styles.loginButtonText}>PRINT ACCESS</Text>
              )}
            </TouchableOpacity>

            <DottedLine />

            <Text style={styles.footerText}>SECURE CONNECTION</Text>
            <Text style={styles.footerSubtext}>powered by supabase</Text>
          </View>

          {/* Zigzag bottom */}
          <View style={styles.zigzagRow}>
            {Array.from({ length: 30 }, (_, i) => (
              <View key={i} style={styles.zigzagUp} />
            ))}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const TRIANGLE_SIZE = 12;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  printerSlot: {
    alignItems: 'center',
    marginBottom: 20,
  },
  slotLine: {
    width: '80%',
    height: 4,
    backgroundColor: colors.surface,
    borderRadius: 2,
  },
  receiptCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  zigzagRow: {
    flexDirection: 'row',
    overflow: 'hidden',
    height: TRIANGLE_SIZE,
  },
  zigzagDown: {
    width: 0,
    height: 0,
    borderLeftWidth: TRIANGLE_SIZE / 2,
    borderRightWidth: TRIANGLE_SIZE / 2,
    borderBottomWidth: TRIANGLE_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colors.paper,
    borderTopWidth: 0,
  },
  zigzagUp: {
    width: 0,
    height: 0,
    borderLeftWidth: TRIANGLE_SIZE / 2,
    borderRightWidth: TRIANGLE_SIZE / 2,
    borderTopWidth: TRIANGLE_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.paper,
    borderBottomWidth: 0,
  },
  receiptBody: {
    backgroundColor: colors.paper,
    paddingHorizontal: 28,
    paddingVertical: 24,
    alignItems: 'center',
  },
  logo: {
    fontFamily: 'SpaceMono',
    fontSize: 36,
    fontWeight: '900',
    color: colors.ink,
    letterSpacing: 10,
  },
  subtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: colors.inkLight,
    letterSpacing: 5,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 4,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 2,
    marginBottom: 6,
  },
  input: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.paperEdge,
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  loginButton: {
    width: '100%',
    backgroundColor: colors.ink,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '800',
    color: colors.paper,
    letterSpacing: 3,
  },
  footerText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: colors.inkFaint,
    letterSpacing: 3,
  },
  footerSubtext: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: colors.inkFaint,
    marginTop: 2,
  },
});
