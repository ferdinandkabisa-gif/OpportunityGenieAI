import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { getMatchLabel, type Scholarship } from '@/constants/scholarships';
import { useTracker } from '@/context/TrackerContext';

interface ScholarshipCardProps {
  scholarship: Scholarship;
  matchScore: number;
  onSave?: () => void;
}

export function ScholarshipCard({ scholarship, matchScore, onSave }: ScholarshipCardProps) {
  const colors = useColors();
  const { applications, addApplication, removeApplication } = useTracker();
  const { label: matchLabel, color: matchColor } = getMatchLabel(matchScore);

  const isSaved = applications.some((a) => a.scholarshipName === scholarship.name);

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isSaved) {
      const existing = applications.find((a) => a.scholarshipName === scholarship.name);
      if (existing) removeApplication(existing.id);
    } else {
      addApplication({
        scholarshipName: scholarship.name,
        university: scholarship.provider,
        country: scholarship.country,
        amount: scholarship.amount,
        deadline: scholarship.deadline,
        status: 'saved',
        notes: '',
      });
    }
    onSave?.();
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <Text style={[styles.name, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={2}>
            {scholarship.name}
          </Text>
          <Text style={[styles.provider, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {scholarship.provider}
          </Text>
        </View>
        <View style={[styles.matchBadge, { backgroundColor: matchColor + '20' }]}>
          <Text style={[styles.matchPct, { color: matchColor, fontFamily: 'Inter_700Bold' }]}>
            {matchScore}%
          </Text>
          <Text style={[styles.matchLabel, { color: matchColor, fontFamily: 'Inter_500Medium' }]}>
            {matchLabel}
          </Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={2}>
        {scholarship.description}
      </Text>

      <View style={styles.infoRow}>
        <InfoChip icon="map-pin" text={scholarship.country} colors={colors} />
        <InfoChip icon="dollar-sign" text={scholarship.amount} colors={colors} />
        <InfoChip icon="clock" text={scholarship.deadline} colors={colors} />
      </View>

      <View style={styles.footer}>
        <View style={styles.tags}>
          {scholarship.tags.slice(0, 2).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.tagText, { color: colors.secondaryForeground, fontFamily: 'Inter_500Medium' }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, { opacity: pressed ? 0.7 : 1 }]}
        >
          <Feather
            name={isSaved ? 'bookmark' : 'bookmark'}
            size={20}
            color={isSaved ? colors.primary : colors.mutedForeground}
            style={{ opacity: isSaved ? 1 : 0.5 }}
          />
        </Pressable>
      </View>
    </View>
  );
}

function InfoChip({ icon, text, colors }: { icon: string; text: string; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={styles.chip}>
      <Feather name={icon as 'map-pin'} size={11} color={colors.mutedForeground} />
      <Text style={[styles.chipText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  titleBlock: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    marginBottom: 2,
  },
  provider: {
    fontSize: 12,
  },
  matchBadge: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
    minWidth: 68,
  },
  matchPct: {
    fontSize: 18,
  },
  matchLabel: {
    fontSize: 10,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chipText: {
    fontSize: 11,
    maxWidth: 100,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
  },
  saveBtn: {
    padding: 4,
  },
});
