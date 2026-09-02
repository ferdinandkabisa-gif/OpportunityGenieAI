import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useProfile } from '@/context/ProfileContext';
import { useTracker } from '@/context/TrackerContext';
import { useAuth } from '@/context/AuthContext';
import { ScoreCard } from '@/components/ScoreCard';
import { ScholarshipCard } from '@/components/ScholarshipCard';
import { SCHOLARSHIPS, computeMatchScore } from '@/constants/scholarships';

const COUNTRY_FILTERS = ['All', 'UK', 'USA', 'Europe', 'Asia', 'Australia', 'Africa', 'Canada'];

function matchesRegion(country: string, filter: string) {
  if (filter === 'All') return true;
  const c = country.toLowerCase();
  if (filter === 'UK') return c.includes('united kingdom') || c.includes('uk');
  if (filter === 'USA') return c.includes('united states') || c.includes('usa');
  if (filter === 'Europe') return [
    'europe', 'germany', 'france', 'sweden', 'netherlands', 'switzerland',
    'belgium', 'austria', 'denmark', 'finland', 'italy', 'hungary', 'poland',
    'czech', 'norway', 'multiple countries',
  ].some((k) => c.includes(k));
  if (filter === 'Asia') return [
    'japan', 'china', 'south korea', 'singapore', 'taiwan', 'thailand',
    'malaysia', 'turkey', 'india', 'indonesia', 'bangladesh', 'pakistan',
    'vietnam', 'philippines', 'sri lanka', 'multiple countries',
  ].some((k) => c.includes(k));
  if (filter === 'Australia') return c.includes('australia') || c.includes('new zealand');
  if (filter === 'Africa') return [
    'nigeria', 'ghana', 'kenya', 'ethiopia', 'south africa', 'morocco',
    'egypt', 'multiple countries',
  ].some((k) => c.includes(k));
  if (filter === 'Canada') return c.includes('canada');
  return true;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, readinessScore } = useProfile();
  const { applications } = useTracker();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');

  const topMatches = useMemo(() =>
    SCHOLARSHIPS
      .map((s) => ({
        scholarship: s,
        score: computeMatchScore(s, {
          cgpa4: profile.cgpa4,
          ielts: profile.ielts,
          level: profile.degreeLevel,
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3),
    [profile.cgpa4, profile.ielts, profile.degreeLevel],
  );

  const latestScholarships = useMemo(() => {
    const q = search.toLowerCase();
    return SCHOLARSHIPS.filter((s) => {
      const regionOk = matchesRegion(s.country, regionFilter);
      if (!regionOk) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.provider.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [search, regionFilter]);

  const stats = [
    { label: 'CGPA', stars: profile.cgpa4 >= 3.7 ? 5 : profile.cgpa4 >= 3.3 ? 4 : profile.cgpa4 >= 3.0 ? 3 : profile.cgpa4 > 0 ? 2 : 0 },
    { label: 'IELTS', stars: profile.ielts >= 7.5 ? 5 : profile.ielts >= 7.0 ? 4 : profile.ielts >= 6.5 ? 3 : profile.ielts > 0 ? 2 : 0 },
    { label: 'Research', stars: Math.min(5, profile.publications * 2) },
    { label: 'Leadership', stars: Math.min(5, profile.leadershipRoles * 2) },
    { label: 'Experience', stars: Math.min(5, profile.workYears + profile.volunteerMonths > 0 ? 2 : 0) },
    { label: 'Documents', stars: (profile.hasLOR ? 2 : 0) + (profile.hasSOP ? 3 : 0) },
  ];

  const activeCount = applications.filter((a) => ['applied', 'interview', 'visa'].includes(a.status)).length;
  const savedCount = applications.filter((a) => a.status === 'saved').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;

  const firstName = user?.name?.split(' ')[0] ?? profile.name?.split(' ')[0] ?? null;
  const greeting = firstName ? `Hi, ${firstName} 👋` : 'Explore Scholarships';
  const isProfileEmpty = profile.cgpa4 === 0 && profile.ielts === 0;
  const isGuest = !user;

  // Sections rendered inside FlatList header
  const ListHeader = (
    <View>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.greeting, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {greeting}
          </Text>
          <Text style={[styles.headline, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            {isGuest ? 'Find Your Scholarship' : 'Scholarship Readiness'}
          </Text>
        </View>
        {isGuest ? (
          <Pressable
            onPress={() => router.push('/auth')}
            style={[styles.avatarBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="log-in" size={18} color="#FFFFFF" />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.avatarBtn, { backgroundColor: colors.secondary }]}
          >
            <Feather name="user" size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>

      {/* ── Guest Banner ── */}
      {isGuest && (
        <Pressable
          onPress={() => router.push('/auth')}
          style={({ pressed }) => [
            styles.guestBanner,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1, marginHorizontal: 16, marginBottom: 14 },
          ]}
        >
          <View style={styles.guestBannerLeft}>
            <Feather name="unlock" size={18} color="#FFFFFF" />
            <View>
              <Text style={[styles.guestBannerTitle, { fontFamily: 'Inter_700Bold' }]}>
                Create a free account
              </Text>
              <Text style={[styles.guestBannerSub, { fontFamily: 'Inter_400Regular' }]}>
                Unlock Match scores, Tracker, Advisor & more
              </Text>
            </View>
          </View>
          <Feather name="arrow-right" size={16} color="#FFFFFF" />
        </Pressable>
      )}

      {/* ── Readiness Score (members only) ── */}
      {!isGuest && <ScoreCard score={readinessScore} stats={stats} />}

      {/* ── Profile CTA ── */}
      {!isGuest && isProfileEmpty && (
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          style={({ pressed }) => [
            styles.ctaBanner,
            { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1, marginHorizontal: 16, marginTop: 12 },
          ]}
        >
          <Feather name="edit-3" size={16} color="#FFFFFF" />
          <Text style={[styles.ctaText, { fontFamily: 'Inter_600SemiBold' }]}>
            Set up your profile to see your matches
          </Text>
          <Feather name="chevron-right" size={16} color="#FFFFFF" />
        </Pressable>
      )}

      {/* ── Stats Row (members only) ── */}
      {!isGuest && (
        <View style={[styles.statsRow, { marginHorizontal: 16, marginTop: 16 }]}>
          <StatBox label="Active" value={activeCount} color={colors.primary} colors={colors} />
          <StatBox label="Saved" value={savedCount} color={colors.accent} colors={colors} />
          <StatBox label="Accepted" value={acceptedCount} color={colors.success} colors={colors} />
        </View>
      )}

      {/* ── Top Matches (members only) ── */}
      {!isGuest && (
        <>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Top Matches
            </Text>
            <Pressable onPress={() => router.push('/(tabs)/match')}>
              <Text style={[styles.seeAll, { color: colors.primary, fontFamily: 'Inter_500Medium' }]}>
                See all
              </Text>
            </Pressable>
          </View>
          <View style={{ paddingHorizontal: 16 }}>
            {topMatches.map(({ scholarship, score }) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                matchScore={score}
              />
            ))}
          </View>
        </>
      )}

      {/* ── Latest Scholarships header + search ── */}
      <View style={[styles.sectionHeader, { marginTop: 28 }]}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Latest Scholarships
          </Text>
          <Text style={[styles.sectionSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {latestScholarships.length} opportunities worldwide
          </Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.secondary, borderColor: colors.border, marginHorizontal: 16, marginBottom: 10 }]}>
        <Feather name="search" size={16} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search scholarships, countries…"
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground, fontFamily: 'Inter_400Regular' }]}
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <Feather name="x" size={15} color={colors.mutedForeground} />
          </Pressable>
        )}
      </View>

      {/* Region filter chips */}
      <FlatList
        data={COUNTRY_FILTERS}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 10 }}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setRegionFilter(item)}
            style={[
              styles.chip,
              {
                backgroundColor: regionFilter === item ? colors.primary : colors.secondary,
                borderColor: regionFilter === item ? colors.primary : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.chipText,
                {
                  color: regionFilter === item ? '#FFFFFF' : colors.mutedForeground,
                  fontFamily: 'Inter_500Medium',
                },
              ]}
            >
              {item}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );

  return (
    <FlatList
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: 100 },
      ]}
      showsVerticalScrollIndicator={false}
      data={latestScholarships}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Feather name="search" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            No scholarships match your search.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={{ paddingHorizontal: 16 }}>
          <ScholarshipCard
            scholarship={item}
            matchScore={computeMatchScore(item, {
              cgpa4: profile.cgpa4,
              ielts: profile.ielts,
              level: profile.degreeLevel,
            })}
          />
        </View>
      )}
    />
  );
}

function StatBox({
  label, value, color, colors,
}: {
  label: string;
  value: number;
  color: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.statValue, { color, fontFamily: 'Inter_700Bold' }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  greeting: { fontSize: 13, marginBottom: 2 },
  headline: { fontSize: 22 },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  ctaText: { color: '#FFFFFF', fontSize: 13, flex: 1 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statBox: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  statValue: { fontSize: 26 },
  statLabel: { fontSize: 11, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: { fontSize: 18 },
  sectionSub: { fontSize: 12, marginTop: 2 },
  seeAll: { fontSize: 13 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: { fontSize: 13 },
  emptyWrap: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14 },
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  guestBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  guestBannerTitle: { color: '#FFFFFF', fontSize: 14 },
  guestBannerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 1 },
});
