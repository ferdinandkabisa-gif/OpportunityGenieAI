import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  GRADING_SYSTEMS,
  convertToGPA4,
  useProfile,
} from '@/context/ProfileContext';
import { useAuth } from '@/context/AuthContext';
import { AuthGate } from '@/components/AuthGate';

function SectionHeader({ title }: { title: string }) {
  const colors = useColors();
  return (
    <Text style={[styles.sectionTitle, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}>
      {title}
    </Text>
  );
}

function FieldInput({
  label, value, onChange, placeholder, keyboardType = 'default', colors,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        keyboardType={keyboardType}
        style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.secondary, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
      />
    </View>
  );
}

function GPAConverter() {
  const colors = useColors();
  const { profile, updateProfile } = useProfile();
  const [showSystems, setShowSystems] = useState(false);

  const selectedSystem = GRADING_SYSTEMS.find((g) => g.value === profile.gradingSystem) ?? GRADING_SYSTEMS[0];
  const converted = convertToGPA4(profile.gradingSystem, profile.localGrade);

  return (
    <View style={[styles.converterCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.converterTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
        GPA Converter
      </Text>
      <Text style={[styles.converterSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
        Convert your local grade to the 4.0 scale
      </Text>

      {/* System picker */}
      <Pressable
        onPress={() => setShowSystems(!showSystems)}
        style={[styles.systemPicker, { backgroundColor: colors.secondary, borderColor: colors.border }]}
      >
        <View>
          <Text style={[styles.systemLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{selectedSystem.label}</Text>
          <Text style={[styles.systemDesc, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{selectedSystem.description}</Text>
        </View>
        <Feather name={showSystems ? 'chevron-up' : 'chevron-down'} size={18} color={colors.mutedForeground} />
      </Pressable>

      {showSystems && (
        <View style={[styles.systemList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {GRADING_SYSTEMS.map((gs) => (
            <Pressable
              key={gs.value}
              onPress={() => {
                updateProfile({ gradingSystem: gs.value });
                setShowSystems(false);
              }}
              style={({ pressed }) => [
                styles.systemOption,
                {
                  backgroundColor: gs.value === profile.gradingSystem ? colors.secondary : 'transparent',
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.systemLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>{gs.label}</Text>
              <Text style={[styles.systemDesc, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>{gs.description}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Grade input */}
      <View style={styles.gradeRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
            Enter your grade
          </Text>
          <TextInput
            value={profile.localGrade}
            onChangeText={(v) => updateProfile({ localGrade: v })}
            placeholder={selectedSystem.value === 'british' ? 'e.g. Second Class Upper' : selectedSystem.value === 'german' ? 'e.g. 1.7' : 'e.g. 78'}
            placeholderTextColor={colors.mutedForeground}
            style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.secondary, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
          />
        </View>
        {converted > 0 && (
          <View style={[styles.resultBox, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
            <Text style={[styles.resultNum, { color: colors.primary, fontFamily: 'Inter_700Bold' }]}>
              {converted.toFixed(2)}
            </Text>
            <Text style={[styles.resultLabel, { color: colors.primary, fontFamily: 'Inter_400Regular' }]}>GPA</Text>
          </View>
        )}
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, updateProfile, saveProfile } = useProfile();
  const { user, logout } = useAuth();

  const handleSave = async () => {
    await saveProfile();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your profile has been updated. Scholarship matches will reflect your new data.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  const degreeOptions: { label: string; value: 'bachelor' | 'master' | 'phd' }[] = [
    { label: 'Bachelor', value: 'bachelor' },
    { label: 'Master', value: 'master' },
    { label: 'PhD', value: 'phd' },
  ];

  return (
    <AuthGate
      feature="Profile"
      icon="user"
      description="Build your scholarship profile — GPA, test scores, research experience — and unlock personalised match scores."
    >
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16), paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title + Account Info */}
        <View style={[styles.pageHeader, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }]}>
          <View>
            <Text style={[styles.pageTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
              Your Profile
            </Text>
            <Text style={[styles.pageSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Accurate data improves your matches
            </Text>
          </View>
        </View>

        {/* Account card */}
        {user && (
          <View style={[styles.accountCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.accountAvatar, { backgroundColor: colors.primary }]}>
              <Text style={[styles.accountAvatarText, { fontFamily: 'Inter_700Bold' }]}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.accountName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]}>
                {user.name}
              </Text>
              <Text style={[styles.accountEmail, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
                {user.email}
              </Text>
            </View>
          </View>
        )}

        {/* GPA Converter */}
        <GPAConverter />

        {/* Personal Info */}
        <SectionHeader title="Personal Information" />
        <FieldInput label="Full Name" value={profile.name} onChange={(v) => updateProfile({ name: v })} placeholder="Your full name" colors={colors} />
        <FieldInput label="Nationality" value={profile.nationality} onChange={(v) => updateProfile({ nationality: v })} placeholder="e.g. Nigerian" colors={colors} />
        <FieldInput label="Field of Study" value={profile.fieldOfStudy} onChange={(v) => updateProfile({ fieldOfStudy: v })} placeholder="e.g. Computer Science" colors={colors} />

        {/* Degree Level */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground, fontFamily: 'Inter_500Medium' }]}>
            Target Degree
          </Text>
          <View style={styles.degreeRow}>
            {degreeOptions.map((opt) => {
              const active = profile.degreeLevel === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => updateProfile({ degreeLevel: opt.value })}
                  style={({ pressed }) => [
                    styles.degreeBtn,
                    { backgroundColor: active ? colors.primary : colors.secondary, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Text style={[
                    styles.degreeBtnText,
                    { color: active ? colors.primaryForeground : colors.mutedForeground, fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular' },
                  ]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Test Scores */}
        <SectionHeader title="Test Scores" />
        <FieldInput label="IELTS Overall" value={profile.ielts > 0 ? String(profile.ielts) : ''} onChange={(v) => updateProfile({ ielts: parseFloat(v) || 0 })} placeholder="e.g. 7.0" keyboardType="decimal-pad" colors={colors} />
        <FieldInput label="TOEFL iBT" value={profile.toefl > 0 ? String(profile.toefl) : ''} onChange={(v) => updateProfile({ toefl: parseInt(v, 10) || 0 })} placeholder="e.g. 100" keyboardType="numeric" colors={colors} />
        <FieldInput label="GRE Total" value={profile.gre > 0 ? String(profile.gre) : ''} onChange={(v) => updateProfile({ gre: parseInt(v, 10) || 0 })} placeholder="e.g. 320" keyboardType="numeric" colors={colors} />

        {/* Academic Strength */}
        <SectionHeader title="Academic Strength" />
        <FieldInput label="Publications / Papers" value={profile.publications > 0 ? String(profile.publications) : ''} onChange={(v) => updateProfile({ publications: parseInt(v, 10) || 0 })} placeholder="Number of publications" keyboardType="numeric" colors={colors} />
        <FieldInput label="Awards / Honours" value={profile.awards > 0 ? String(profile.awards) : ''} onChange={(v) => updateProfile({ awards: parseInt(v, 10) || 0 })} placeholder="Number of awards" keyboardType="numeric" colors={colors} />
        <FieldInput label="Volunteer Experience (months)" value={profile.volunteerMonths > 0 ? String(profile.volunteerMonths) : ''} onChange={(v) => updateProfile({ volunteerMonths: parseInt(v, 10) || 0 })} placeholder="Total months of volunteering" keyboardType="numeric" colors={colors} />
        <FieldInput label="Leadership Roles" value={profile.leadershipRoles > 0 ? String(profile.leadershipRoles) : ''} onChange={(v) => updateProfile({ leadershipRoles: parseInt(v, 10) || 0 })} placeholder="Number of leadership positions" keyboardType="numeric" colors={colors} />
        <FieldInput label="Work Experience (years)" value={profile.workYears > 0 ? String(profile.workYears) : ''} onChange={(v) => updateProfile({ workYears: parseFloat(v) || 0 })} placeholder="Years of relevant experience" keyboardType="decimal-pad" colors={colors} />

        {/* Documents */}
        <SectionHeader title="Documents Ready" />
        <View style={styles.toggleRow}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              Recommendation Letters
            </Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              At least 2 strong letters
            </Text>
          </View>
          <Switch
            value={profile.hasLOR}
            onValueChange={(v) => updateProfile({ hasLOR: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
        <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: colors.foreground, fontFamily: 'Inter_500Medium' }]}>
              Statement of Purpose
            </Text>
            <Text style={[styles.toggleSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Drafted SOP / personal statement
            </Text>
          </View>
          <Switch
            value={profile.hasSOP}
            onValueChange={(v) => updateProfile({ hasSOP: v })}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Save */}
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [styles.saveBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1, marginTop: 24 }]}
        >
          <Feather name="check" size={18} color="#FFFFFF" />
          <Text style={[styles.saveBtnText, { fontFamily: 'Inter_600SemiBold' }]}>
            Save Profile
          </Text>
        </Pressable>

        {/* Sign Out */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.saveBtn,
            { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.destructive, opacity: pressed ? 0.7 : 1, marginTop: 12 },
          ]}
        >
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.saveBtnText, { color: colors.destructive, fontFamily: 'Inter_600SemiBold' }]}>
            Sign Out
          </Text>
        </Pressable>
      </ScrollView>
    </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 4 },
  pageHeader: { marginBottom: 16 },
  pageTitle: { fontSize: 24, marginBottom: 4 },
  pageSub: { fontSize: 13 },
  sectionTitle: { fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 20, marginBottom: 8 },
  fieldWrap: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  degreeRow: { flexDirection: 'row', gap: 8 },
  degreeBtn: { flex: 1, borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  degreeBtnText: { fontSize: 14 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  toggleLabel: { fontSize: 14, marginBottom: 2 },
  toggleSub: { fontSize: 11 },
  saveBtn: { borderRadius: 14, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  saveBtnText: { color: '#FFFFFF', fontSize: 16 },
  accountCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 8 },
  accountAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  accountAvatarText: { color: '#FFFFFF', fontSize: 20 },
  accountName: { fontSize: 16, marginBottom: 2 },
  accountEmail: { fontSize: 13 },
  // Converter
  converterCard: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 20 },
  converterTitle: { fontSize: 17, marginBottom: 2 },
  converterSub: { fontSize: 12, marginBottom: 14 },
  systemPicker: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 4 },
  systemLabel: { fontSize: 14 },
  systemDesc: { fontSize: 11, marginTop: 1 },
  systemList: { borderRadius: 10, borderWidth: 1, marginBottom: 8, overflow: 'hidden' },
  systemOption: { paddingHorizontal: 14, paddingVertical: 10 },
  gradeRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-end', marginTop: 8 },
  resultBox: { borderRadius: 12, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center', minWidth: 70 },
  resultNum: { fontSize: 22 },
  resultLabel: { fontSize: 11 },
});
