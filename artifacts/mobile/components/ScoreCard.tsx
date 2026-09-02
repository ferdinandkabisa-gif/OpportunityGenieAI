import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';

interface ScoreStat {
  label: string;
  stars: number; // 0-5
}

interface ScoreCardProps {
  score: number;
  stats: ScoreStat[];
}

function StarRow({ label, stars }: ScoreStat) {
  const colors = useColors();
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        {label}
      </Text>
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              { backgroundColor: i < stars ? colors.accent : colors.border },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export function ScoreCard({ score, stats }: ScoreCardProps) {
  const colors = useColors();

  const scoreColor =
    score >= 75 ? colors.success :
    score >= 50 ? colors.accent :
    colors.destructive;

  const label =
    score >= 75 ? 'Strong Profile' :
    score >= 50 ? 'Developing' :
    'Needs Work';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View style={styles.scoreCircle}>
          <View style={[styles.circleBg, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreNum, { color: scoreColor, fontFamily: 'Inter_700Bold' }]}>
              {score}
            </Text>
            <Text style={[styles.scoreOf, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              /100
            </Text>
          </View>
          <Text style={[styles.scoreLabel, { color: scoreColor, fontFamily: 'Inter_600SemiBold' }]}>
            {label}
          </Text>
        </View>
        <View style={styles.statsColumn}>
          {stats.slice(0, 5).map((s) => (
            <StarRow key={s.label} label={s.label} stars={s.stars} />
          ))}
        </View>
      </View>
      {stats.length > 5 && (
        <View style={styles.extraStats}>
          {stats.slice(5).map((s) => (
            <StarRow key={s.label} label={s.label} stars={s.stars} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginHorizontal: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  scoreCircle: {
    alignItems: 'center',
  },
  circleBg: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  scoreNum: {
    fontSize: 32,
    lineHeight: 38,
  },
  scoreOf: {
    fontSize: 11,
  },
  scoreLabel: {
    fontSize: 11,
  },
  statsColumn: {
    flex: 1,
    gap: 6,
  },
  extraStats: {
    marginTop: 12,
    gap: 6,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 11,
    flex: 1,
  },
  stars: {
    flexDirection: 'row',
    gap: 3,
  },
  star: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
});
