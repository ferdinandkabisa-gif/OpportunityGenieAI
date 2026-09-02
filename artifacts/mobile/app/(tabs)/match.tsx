import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useProfile } from '@/context/ProfileContext';
import { SCHOLARSHIPS, computeMatchScore } from '@/constants/scholarships';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { AuthGate } from '@/components/AuthGate';

type Filter = 'all' | 'excellent' | 'competitive' | 'longshot';

const FILTERS: { key: Filter; label: string; min: number; max: number }[] = [
  { key: 'all',        label: 'All',        min: 0,  max: 100 },
  { key: 'excellent',  label: 'Excellent',  min: 75, max: 100 },
  { key: 'competitive',label: 'Competitive',min: 50, max: 74 },
  { key: 'longshot',   label: 'Long Shot',  min: 0,  max: 49 },
];

export default function MatchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const [filter, setFilter] = useState<Filter>('all');

  const scored = useMemo(() =>
    SCHOLARSHIPS
      .map((s) => ({
        scholarship: s,
        score: computeMatchScore(s, {
          cgpa4: profile.cgpa4,
          ielts: profile.ielts,
          level: profile.degreeLevel,
        }),
      }))
      .sort((a, b) => b.score - a.score),
    [profile.cgpa4, profile.ielts, profile.degreeLevel]
  );

  const activeFilter = FILTERS.find((f) => f.key === filter)!;
  const visible = scored.filter((s) => s.score >= activeFilter.min && s.score <= activeFilter.max);

  return (
    <AuthGate
      feature="Match"
      icon="zap"
      description="See all 112 scholarships ranked by your personal match score based on your CGPA, test scores, and degree level."
    >
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.headerArea,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), backgroundColor: colors.background },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Scholarship Matches
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {scored.length} scholarships ranked for your profile
        </Text>

        {/* Filter chips */}
        <View style={styles.filters}>
          {FILTERS.map((f) => {
            const active = filter === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={({ pressed }) => [
                  styles.chip,
                  {
                    backgroundColor: active ? colors.primary : colors.secondary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? colors.primaryForeground : colors.mutedForeground,
                      fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular',
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.scholarship.id}
        renderItem={({ item }) => (
          <ScholarshipCard
            scholarship={item.scholarship}
            matchScore={item.score}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 90) },
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyIcon, { color: colors.border }]}>—</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              No scholarships in this category
            </Text>
          </View>
        }
        scrollEnabled={visible.length > 0}
      />
    </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 14 },
  filters: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  chipText: { fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 12 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyText: { fontSize: 15 },
});
