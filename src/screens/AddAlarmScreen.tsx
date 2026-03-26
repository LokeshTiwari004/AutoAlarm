import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAlarmStore } from '../store/alarmStore';
import OffsetPicker from '../components/OffsetPicker';
import DaySelector from '../components/DaySelector';
import RingtonePicker from '../components/RingtonePicker';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getCurrentLocation } from '../services/locationService';
import { fetchSunrise, computeAlarmTime } from '../services/sunriseService';
import { stopPreview, getRingtoneById } from '../services/ringtoneService';

type NavProp = StackNavigationProp<RootStackParamList, 'AddAlarm'>;
type RoutePropType = RouteProp<RootStackParamList, 'AddAlarm'>;

export default function AddAlarmScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RoutePropType>();
  const existingAlarm = route.params?.alarm;

  const { addAlarm, updateAlarm } = useAlarmStore();

  const [label, setLabel] = useState(existingAlarm?.label ?? '');
  const [offsetMinutes, setOffsetMinutes] = useState(existingAlarm?.offsetMinutes ?? -30);
  const [repeatDays, setRepeatDays] = useState<number[]>(existingAlarm?.repeatDays ?? []);
  const [ringtone, setRingtone] = useState(existingAlarm?.ringtone ?? 'default');
  const [saving, setSaving] = useState(false);
  const [previewTime, setPreviewTime] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Compute preview time whenever offset changes
  useEffect(() => {
    let cancelled = false;
    const compute = async () => {
      setLoadingPreview(true);
      try {
        const coords = await getCurrentLocation();
        if (!coords || cancelled) return;
        const result = await fetchSunrise(coords);
        if (!result || cancelled) return;
        const alarmTime = computeAlarmTime(result.sunrise, offsetMinutes);
        if (!cancelled) {
          setPreviewTime(
            alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          );
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingPreview(false);
      }
    };
    compute();
    return () => { cancelled = true; };
  }, [offsetMinutes]);

  const handleSave = async () => {
    if (saving) return;
    await stopPreview(); // stop any playing ringtone preview
    setSaving(true);
    try {
      const draft = {
        label: label.trim() || 'Sunrise Alarm',
        offsetMinutes,
        repeatDays,
        ringtone,
        enabled: true,
      };
      if (existingAlarm) {
        await updateAlarm(existingAlarm.id, draft);
      } else {
        await addAlarm(draft);
      }
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save alarm. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Stop preview on unmount
  useEffect(() => {
    return () => { stopPreview(); };
  }, []);

  const selectedRingtone = getRingtoneById(ringtone);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Preview card */}
          <View style={styles.previewCard}>
            <Ionicons name="sunny" size={24} color={Colors.accent} />
            <View style={styles.previewRight}>
              <Text style={styles.previewLabel}>Next alarm at</Text>
              {loadingPreview ? (
                <ActivityIndicator color={Colors.accent} size="small" />
              ) : (
                <Text style={styles.previewTime}>{previewTime ?? '—'}</Text>
              )}
              <Text style={styles.previewNote}>
                {selectedRingtone.emoji} {selectedRingtone.label}
              </Text>
            </View>
          </View>

          {/* Label */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Alarm Label</Text>
            <TextInput
              style={styles.input}
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. Morning Run"
              placeholderTextColor={Colors.textMuted}
              maxLength={32}
              returnKeyType="done"
            />
          </View>

          {/* Offset */}
          <View style={styles.section}>
            <OffsetPicker offsetMinutes={offsetMinutes} onChange={setOffsetMinutes} />
          </View>

          {/* Repeat days */}
          <View style={styles.section}>
            <DaySelector selected={repeatDays} onChange={setRepeatDays} />
          </View>

          {/* Ringtone */}
          <View style={styles.section}>
            <RingtonePicker selected={ringtone} onChange={setRingtone} />
          </View>

          {/* Save */}
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <Ionicons name="checkmark" size={20} color={Colors.background} />
                <Text style={styles.saveBtnText}>
                  {existingAlarm ? 'Update Alarm' : 'Set Alarm'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
    gap: 16,
  },
  previewRight: { flex: 1 },
  previewLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  previewTime: {
    color: Colors.accent,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
  },
  previewNote: { color: Colors.textMuted, fontSize: 12, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  saveBtn: {
    backgroundColor: Colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveBtnText: { color: Colors.background, fontSize: 16, fontWeight: '700' },
});
