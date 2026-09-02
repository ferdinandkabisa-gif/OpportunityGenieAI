import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  ApplicationStatus,
  STATUS_CONFIG,
  TrackedApplication,
  useTracker,
} from '@/context/TrackerContext';
import { AuthGate } from '@/components/AuthGate';

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ApplicationStatus[];

function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, color, bg } = STATUS_CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color, fontFamily: 'Inter_600SemiBold' }]}>{label}</Text>
    </View>
  );
}

function AppCard({
  app,
  onStatusChange,
  onDelete,
}: {
  app: TrackedApplication;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onDelete: (id: string) => void;
}) {
  const colors = useColors();
  const [showStatuses, setShowStatuses] = useState(false);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.cardTop}>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.foreground, fontFamily: 'Inter_600SemiBold' }]} numberOfLines={1}>
            {app.scholarshipName}
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {app.provider ?? app.university} · {app.country}
          </Text>
        </View>
        <Pressable
          onPress={() => onDelete(app.id)}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}
        >
          <Feather name="trash-2" size={16} color={colors.destructive} />
        </Pressable>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaChip}>
          <Feather name="calendar" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
            {app.deadline}
          </Text>
        </View>
        <View style={styles.metaChip}>
          <Feather name="dollar-sign" size={11} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]} numberOfLines={1}>
            {app.amount}
          </Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Pressable onPress={() => { Haptics.selectionAsync(); setShowStatuses(!showStatuses); }}>
          <StatusBadge status={app.status} />
        </Pressable>
        {showStatuses && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusScroll}>
            {ALL_STATUSES.map((s) => (
              <Pressable
                key={s}
                onPress={() => {
                  onStatusChange(app.id, s);
                  setShowStatuses(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={({ pressed }) => [
                  styles.statusOption,
                  { backgroundColor: STATUS_CONFIG[s].bg, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.statusOptionText, { color: STATUS_CONFIG[s].color, fontFamily: 'Inter_500Medium' }]}>
                  {STATUS_CONFIG[s].label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

function AddModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addApplication } = useTracker();
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [country, setCountry] = useState('');
  const [amount, setAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    addApplication({
      scholarshipName: name.trim(),
      university: university.trim() || 'Unknown',
      country: country.trim() || 'Unknown',
      amount: amount.trim() || 'Unknown',
      deadline: deadline.trim() || 'TBD',
      status: 'saved',
      notes: '',
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setName(''); setUniversity(''); setCountry(''); setAmount(''); setDeadline('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modal, { backgroundColor: colors.background, paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
            Track Application
          </Text>
          <Pressable onPress={onClose}>
            <Feather name="x" size={22} color={colors.mutedForeground} />
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled">
          <Field label="Scholarship Name *" value={name} onChange={setName} placeholder="e.g. Chevening Scholarship" colors={colors} />
          <Field label="Provider / University" value={university} onChange={setUniversity} placeholder="e.g. UK Government" colors={colors} />
          <Field label="Country" value={country} onChange={setCountry} placeholder="e.g. United Kingdom" colors={colors} />
          <Field label="Funding Amount" value={amount} onChange={setAmount} placeholder="e.g. Full funding" colors={colors} />
          <Field label="Deadline" value={deadline} onChange={setDeadline} placeholder="e.g. Nov 5" colors={colors} />
        </ScrollView>
        <Pressable
          onPress={handleAdd}
          style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 }]}
        >
          <Text style={[styles.addBtnText, { color: colors.primaryForeground, fontFamily: 'Inter_600SemiBold' }]}>
            Add to Tracker
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder, colors }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
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
        style={[styles.fieldInput, { color: colors.foreground, backgroundColor: colors.secondary, borderColor: colors.border, fontFamily: 'Inter_400Regular' }]}
      />
    </View>
  );
}

export default function TrackerScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { applications, updateStatus, removeApplication } = useTracker();
  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | 'all'>('all');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = filterStatus === 'all'
    ? applications
    : applications.filter((a) => a.status === filterStatus);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Application', 'Remove this application from your tracker?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          removeApplication(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const STATUS_FILTERS: { key: ApplicationStatus | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'saved', label: 'Saved' },
    { key: 'applied', label: 'Applied' },
    { key: 'interview', label: 'Interview' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'rejected', label: 'Rejected' },
  ];

  return (
    <AuthGate
      feature="Tracker"
      icon="list"
      description="Track every application — deadlines, status updates, and interview stages — all in one place."
    >
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.headerArea, { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 16) }]}>
        <Text style={[styles.title, { color: colors.foreground, fontFamily: 'Inter_700Bold' }]}>
          Applications
        </Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
          {applications.length} tracked · {applications.filter((a) => a.status === 'applied').length} applied
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {STATUS_FILTERS.map((f) => {
            const active = filterStatus === f.key;
            return (
              <Pressable
                key={f.key}
                onPress={() => setFilterStatus(f.key)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: active ? colors.primary : colors.secondary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? colors.primaryForeground : colors.mutedForeground, fontFamily: active ? 'Inter_600SemiBold' : 'Inter_400Regular' }]}>
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AppCard app={item} onStatusChange={updateStatus} onDelete={handleDelete} />
        )}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + (Platform.OS === 'web' ? 34 : 100) }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Feather name="inbox" size={40} color={colors.border} />
            <Text style={[styles.emptyText, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              No applications tracked yet
            </Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground, fontFamily: 'Inter_400Regular' }]}>
              Save scholarships from Match tab or add manually
            </Text>
          </View>
        }
        scrollEnabled={!!filtered.length}
      />

      {/* FAB */}
      <Pressable
        onPress={() => setShowAdd(true)}
        style={({ pressed }) => [
          styles.fab,
          { backgroundColor: colors.primary, bottom: insets.bottom + (Platform.OS === 'web' ? 34 : 90), opacity: pressed ? 0.85 : 1 },
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <AddModal visible={showAdd} onClose={() => setShowAdd(false)} />
    </View>
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { paddingHorizontal: 16, paddingBottom: 12 },
  title: { fontSize: 24, marginBottom: 4 },
  subtitle: { fontSize: 13, marginBottom: 12 },
  filterScroll: { marginHorizontal: -2 },
  chip: { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginHorizontal: 2 },
  chipText: { fontSize: 13 },
  list: { paddingHorizontal: 16, paddingTop: 8 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 10 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardInfo: { flex: 1, marginRight: 8 },
  cardName: { fontSize: 15, marginBottom: 2 },
  cardSub: { fontSize: 12 },
  cardMeta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, maxWidth: 120 },
  cardFooter: { flexDirection: 'column', gap: 8 },
  badge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11 },
  statusScroll: { maxHeight: 36 },
  statusOption: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6 },
  statusOptionText: { fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyText: { fontSize: 15, marginTop: 6 },
  emptyHint: { fontSize: 12, textAlign: 'center', maxWidth: 220 },
  fab: { position: 'absolute', right: 20, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  // Modal
  modal: { flex: 1, paddingHorizontal: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  fieldInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  addBtn: { borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  addBtnText: { fontSize: 16 },
});
