import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAuth } from '@/context/AuthContext';

interface AuthGateProps {
  /** The feature name shown in the prompt, e.g. "Match", "Advisor" */
  feature: string;
  /** Icon name from the Feather icon set */
  icon: React.ComponentProps<typeof Feather>['name'];
  /** Short description of what the feature does */
  description: string;
  children: React.ReactNode;
}

export function AuthGate({ feature, icon, description, children }: AuthGateProps) {
  const { user } = useAuth();
  const colors = useColors();
  const insets = useSafeAreaInsets();

  if (user) return <>{children}</>;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Decorative blurred circle */}
      <View style={[styles.blob, { backgroundColor: colors.primary + '18' }]} />

      <View
        style={[
          styles.content,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 80 : 48), paddingBottom: insets.bottom + 40 },
        ]}
      >
        {/* Icon badge */}
        <View style={[styles.iconBadge, { backgroundColor: colors.secondary }]}>
          <Feather name={icon} size={36} color={colors.primary} />
        </View>

        {/* Lock indicator */}
        <View style={[styles.lockRow, { backgroundColor: colors.accent + '20' }]}>
          <Feather name="lock" size={12} color={colors.accent} />
          <Text style={[styles.lockLabel, { color: colors.accent, fontFamily: 'Inter_600SemiBold' }]}>
            Account Required
          </Text>
        </View>

        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Unlock {feature}
        </Text>
        <Text style={[styles.desc, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {description}
        </Text>

        {/* Perks list */}
        <View style={[styles.perksCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            'Personalised scholarship match scores',
            'Track applications & deadlines',
            'AI-powered advisor chat',
            'Save your profile across devices',
          ].map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <View style={[styles.perkDot, { backgroundColor: colors.success }]}>
                <Feather name="check" size={10} color="#FFFFFF" />
              </View>
              <Text style={[styles.perkText, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}>
                {perk}
              </Text>
            </View>
          ))}
        </View>

        {/* CTA buttons */}
        <Pressable
          onPress={() => router.push('/auth')}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
          ]}
        >
          <Feather name="user-plus" size={18} color="#FFFFFF" />
          <Text style={[styles.primaryBtnText, { fontFamily: 'Inter_700Bold' }]}>
            Create Free Account
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/auth')}
          style={({ pressed }) => [
            styles.secondaryBtn,
            { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
          ]}
        >
          <Text style={[styles.secondaryBtnText, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
            Already have an account? Sign in
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },
  blob: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: 'center',
    gap: 16,
  },
  iconBadge: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  lockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  lockLabel: { fontSize: 12 },
  title: { fontSize: 26, textAlign: 'center' },
  desc: { fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: -4 },
  perksCard: {
    width: '100%',
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
    marginTop: 4,
  },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  perkDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: { fontSize: 14, flex: 1 },
  primaryBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 15,
    borderRadius: 14,
    marginTop: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 16 },
  secondaryBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryBtnText: { fontSize: 14 },
});
