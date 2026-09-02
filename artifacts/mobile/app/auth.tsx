import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

type Mode = 'login' | 'register';

export default function AuthScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  const handleSubmit = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const result =
      mode === 'login'
        ? await login(email, password)
        : await register(name, email, password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Something went wrong.');
    // On success, _layout.tsx redirect handles navigation automatically
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="auto" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo / brand mark */}
          <View style={styles.logoWrap}>
            <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
              <Feather name="award" size={32} color="#FFFFFF" />
            </View>
            <Text style={[styles.appName, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              ScholarshipAI
            </Text>
            <Text style={[styles.tagline, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Find scholarships you're most likely to win
            </Text>
          </View>

          {/* Tab switcher */}
          <View style={[styles.tabRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
            <Pressable
              onPress={() => switchMode('login')}
              style={[
                styles.tabBtn,
                mode === 'login' && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: mode === 'login' ? '#FFFFFF' : colors.mutedForeground },
                  { fontFamily: 'Inter_600SemiBold' },
                ]}
              >
                Sign In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => switchMode('register')}
              style={[
                styles.tabBtn,
                mode === 'register' && { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: mode === 'register' ? '#FFFFFF' : colors.mutedForeground },
                  { fontFamily: 'Inter_600SemiBold' },
                ]}
              >
                Create Account
              </Text>
            </Pressable>
          </View>

          {/* Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              {mode === 'login' ? 'Welcome back 👋' : 'Get started today 🎓'}
            </Text>
            <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              {mode === 'login'
                ? 'Sign in to continue to your scholarship dashboard'
                : 'Create an account to track and match scholarships'}
            </Text>

            {/* Name field (register only) */}
            {mode === 'register' && (
              <View style={styles.fieldWrap}>
                <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                  Full Name
                </Text>
                <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Feather name="user" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="Your full name"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="words"
                    style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                  />
                </View>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                Email Address
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="mail" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={[styles.label, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
                Password
              </Text>
              <View style={[styles.inputRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="lock" size={16} color={colors.mutedForeground} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Your password'}
                  placeholderTextColor={colors.mutedForeground}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  style={[styles.input, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                  <Feather
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={16}
                    color={colors.mutedForeground}
                  />
                </Pressable>
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <View style={[styles.errorBox, { backgroundColor: '#FEF2F2', borderColor: '#FECACA' }]}>
                <Feather name="alert-circle" size={14} color="#EF4444" />
                <Text style={[styles.errorText, { fontFamily: 'Inter_400Regular' }]}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <Pressable
              onPress={handleSubmit}
              disabled={loading}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: colors.primary, opacity: pressed || loading ? 0.85 : 1 },
              ]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={[styles.submitText, { fontFamily: 'Inter_700Bold' }]}>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                  </Text>
                  <Feather name="arrow-right" size={18} color="#FFFFFF" />
                </>
              )}
            </Pressable>

            {/* Switch mode inline link */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              </Text>
              <Pressable onPress={() => switchMode(mode === 'login' ? 'register' : 'login')}>
                <Text style={[styles.switchLink, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
                  {mode === 'login' ? 'Create one' : 'Sign in'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Footer note */}
          <Text style={[styles.footer, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            Your data is stored securely on your device.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  logoWrap: { alignItems: 'center', gap: 10, marginBottom: 4 },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: { fontSize: 26 },
  tagline: { fontSize: 13, textAlign: 'center' },
  tabRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabText: { fontSize: 14 },
  card: {
    borderRadius: 20,
    padding: 24,
    gap: 16,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 22 },
  cardSub: { fontSize: 13, lineHeight: 19, marginTop: -8 },
  fieldWrap: { gap: 6 },
  label: { fontSize: 12 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  inputIcon: {},
  input: { flex: 1, fontSize: 15 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  errorText: { color: '#EF4444', fontSize: 13, flex: 1 },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 4,
  },
  submitText: { color: '#FFFFFF', fontSize: 16 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
  switchText: { fontSize: 13 },
  switchLink: { fontSize: 13 },
  footer: { fontSize: 11, textAlign: 'center' },
});
