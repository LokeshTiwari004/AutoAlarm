import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { RINGTONES } from '../services/ringtoneService';

interface Props {
  selected: string;
  onChange: (ringtoneId: string) => void;
}

export default function RingtonePicker({ selected, onChange }: Props) {
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  // One animated value per ringtone for the pulse effect
  const pulseAnims = useRef<Record<string, Animated.Value>>(
    Object.fromEntries(RINGTONES.map((r) => [r.id, new Animated.Value(1)]))
  ).current;

  const handlePreview = (ringtoneId: string) => {
    console.log('[RingtonePicker] preview pressed:', ringtoneId);
    if (previewingId === ringtoneId) {
      setPreviewingId(null);
      return;
    }
    setPreviewingId(ringtoneId);
    // Pulse animation: scale button up and down 3 times
    const anim = pulseAnims[ringtoneId];
    Animated.sequence([
      Animated.timing(anim, { toValue: 1.4, duration: 130, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.9, duration: 130, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.3, duration: 130, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 0.9, duration: 130, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1.0, duration: 130, useNativeDriver: true }),
    ]).start(() => setPreviewingId(null));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ringtone</Text>
      {RINGTONES.map((ringtone) => {
        const isSelected = selected === ringtone.id;
        const isPreviewing = previewingId === ringtone.id;

        return (
          <View
            key={ringtone.id}
            style={[styles.row, isSelected && styles.rowSelected]}
          >
            {/* Left: selects ringtone */}
            <Pressable
              style={styles.selectArea}
              onPress={() => onChange(ringtone.id)}
              android_ripple={{ color: Colors.accentDim }}
            >
              <Text style={styles.emoji}>{ringtone.emoji}</Text>
              <Text style={[styles.name, isSelected && styles.nameSelected]}>
                {ringtone.label}
              </Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.accent} />
              )}
            </Pressable>

            {/* Right: animated preview button */}
            <Animated.View style={{ transform: [{ scale: pulseAnims[ringtone.id] }] }}>
              <TouchableOpacity
                style={[styles.previewBtn, isPreviewing && styles.previewBtnActive]}
                onPress={() => handlePreview(ringtone.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={isPreviewing ? 'musical-note' : 'play'}
                  size={14}
                  color={isPreviewing ? Colors.background : Colors.textSecondary}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
        );
      })}

      <Text style={styles.note}>
        🎧 Audio preview available in native build
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 8 },
  label: {
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 8,
    overflow: 'hidden',
  },
  rowSelected: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentDim,
  },
  selectArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  emoji: { fontSize: 20, width: 28, textAlign: 'center' },
  name: { flex: 1, color: Colors.text, fontSize: 15, fontWeight: '500' },
  nameSelected: { color: Colors.accent, fontWeight: '600' },
  previewBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtnActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  note: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
  },
});
