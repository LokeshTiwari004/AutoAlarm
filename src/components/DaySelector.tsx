import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

const DAYS = [
  { label: 'S', value: 0 },
  { label: 'M', value: 1 },
  { label: 'T', value: 2 },
  { label: 'W', value: 3 },
  { label: 'T', value: 4 },
  { label: 'F', value: 5 },
  { label: 'S', value: 6 },
];

interface Props {
  selected: number[];
  onChange: (days: number[]) => void;
}

export default function DaySelector({ selected, onChange }: Props) {
  const toggle = (day: number) => {
    if (selected.includes(day)) {
      onChange(selected.filter((d) => d !== day));
    } else {
      onChange([...selected, day].sort());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Repeat</Text>
      <View style={styles.row}>
        {DAYS.map((d) => {
          const active = selected.includes(d.value);
          return (
            <TouchableOpacity
              key={d.value}
              style={[styles.day, active && styles.dayActive]}
              onPress={() => toggle(d.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, active && styles.dayTextActive]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.hint}>
        {selected.length === 0
          ? 'One-time alarm'
          : 'Repeats on selected days'}
      </Text>
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
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  day: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  dayText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  dayTextActive: {
    color: Colors.background,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 8,
  },
});
