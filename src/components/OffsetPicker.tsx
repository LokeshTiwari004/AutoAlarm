import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
} from 'react-native';
import { Colors } from '../theme/colors';

interface Props {
  offsetMinutes: number;
  onChange: (offsetMinutes: number) => void;
}

const MINUTE_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180];

export default function OffsetPicker({ offsetMinutes, onChange }: Props) {
  const direction = offsetMinutes <= 0 ? 'before' : 'after';
  const absMinutes = Math.abs(offsetMinutes);

  // Local text state for the custom input field
  const [customText, setCustomText] = useState('');
  const isPreset = MINUTE_OPTIONS.includes(absMinutes);

  const setDirection = (dir: 'before' | 'after') => {
    const sign = dir === 'before' ? -1 : 1;
    onChange(sign * absMinutes);
  };

  const setMinutes = (m: number) => {
    const sign = direction === 'before' ? -1 : 1;
    setCustomText('');
    onChange(sign * m);
  };

  const handleCustomChange = (text: string) => {
    setCustomText(text);
    const num = parseInt(text, 10);
    if (!isNaN(num) && num >= 0 && num <= 1440) {
      const sign = direction === 'before' ? -1 : 1;
      onChange(sign * num);
    }
  };

  const formatOption = (m: number) => {
    if (m === 0) return '0m';
    const h = Math.floor(m / 60);
    const min = m % 60;
    if (h === 0) return `${min}m`;
    if (min === 0) return `${h}h`;
    return `${h}h ${min}m`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Alarm offset</Text>

      {/* Direction toggle */}
      <View style={styles.directionRow}>
        <TouchableOpacity
          style={[styles.dirBtn, direction === 'before' && styles.dirBtnActive]}
          onPress={() => setDirection('before')}
          activeOpacity={0.7}
        >
          <Text style={[styles.dirText, direction === 'before' && styles.dirTextActive]}>
            Before sunrise
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.dirBtn, direction === 'after' && styles.dirBtnActive]}
          onPress={() => setDirection('after')}
          activeOpacity={0.7}
        >
          <Text style={[styles.dirText, direction === 'after' && styles.dirTextActive]}>
            After sunrise
          </Text>
        </TouchableOpacity>
      </View>

      {/* Custom minute input */}
      <Text style={styles.subLabel}>Custom minutes</Text>
      <View style={styles.customRow}>
        <TextInput
          style={[styles.customInput, !isPreset && absMinutes > 0 && styles.customInputActive]}
          value={customText}
          onChangeText={handleCustomChange}
          placeholder={isPreset ? 'Type any value…' : String(absMinutes)}
          placeholderTextColor={!isPreset && absMinutes > 0 ? Colors.accent : Colors.textMuted}
          keyboardType="number-pad"
          maxLength={4}
          returnKeyType="done"
        />
        <Text style={styles.minLabel}>minutes</Text>
        {!isPreset && absMinutes > 0 && (
          <View style={styles.customBadge}>
            <Text style={styles.customBadgeText}>✓ {absMinutes}m</Text>
          </View>
        )}
      </View>

      {/* Preset chips */}
      <Text style={styles.subLabel}>Quick presets</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {MINUTE_OPTIONS.map((m) => {
          const active = isPreset && m === absMinutes;
          return (
            <TouchableOpacity
              key={m}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setMinutes(m)}
              activeOpacity={0.7}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {formatOption(m)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Preview */}
      <View style={styles.preview}>
        <Text style={styles.previewText}>
          {absMinutes === 0
            ? 'Alarm rings exactly at sunrise'
            : `Alarm rings ${formatOption(absMinutes)} ${direction} sunrise`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  subLabel: {
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 16,
    marginBottom: 10,
  },
  directionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dirBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dirBtnActive: {
    backgroundColor: Colors.accentDim,
    borderColor: Colors.accent,
  },
  dirText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  dirTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customInput: {
    flex: 1,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    color: Colors.text,
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },
  customInputActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
    color: Colors.accent,
  },
  minLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  customBadge: {
    backgroundColor: Colors.accent,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customBadgeText: {
    color: Colors.background,
    fontWeight: '700',
    fontSize: 13,
  },
  scrollView: {
    marginHorizontal: -4,
  },
  scrollContent: {
    paddingHorizontal: 4,
    gap: 8,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  chipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: Colors.background,
    fontWeight: '700',
  },
  preview: {
    marginTop: 14,
    backgroundColor: Colors.accentDim,
    borderRadius: 10,
    padding: 12,
  },
  previewText: {
    color: Colors.accent,
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});
