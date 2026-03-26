import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Alarm } from '../types/alarm';
import { formatOffsetLabel } from '../services/alarmService';
import { getRingtoneById } from '../services/ringtoneService';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface Props {
  alarm: Alarm;
  onToggle: () => void;
  onPress: () => void;
  onDelete: () => void;
}

export default function AlarmCard({ alarm, onToggle, onPress, onDelete }: Props) {
  const opacity = useRef(new Animated.Value(alarm.enabled ? 1 : 0.5)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: alarm.enabled ? 1 : 0.5,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [alarm.enabled]);

  const offsetLabel = formatOffsetLabel(alarm.offsetMinutes);
  const ringtone = getRingtoneById(alarm.ringtone ?? 'default');

  const repeatLabel =
    alarm.repeatDays.length === 0
      ? 'One-time'
      : alarm.repeatDays.length === 7
      ? 'Every day'
      : alarm.repeatDays.length === 5 &&
        !alarm.repeatDays.includes(0) &&
        !alarm.repeatDays.includes(6)
      ? 'Weekdays'
      : alarm.repeatDays.length === 2 &&
        alarm.repeatDays.includes(0) &&
        alarm.repeatDays.includes(6)
      ? 'Weekends'
      : alarm.repeatDays.map((d) => DAY_LABELS[d]).join(' ');

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Animated.View style={[styles.card, { opacity }]}>
        {/* Left side */}
        <View style={styles.left}>
          <View style={[styles.accentBar, !alarm.enabled && styles.accentBarOff]} />
          <View style={styles.content}>
            <Text style={styles.label} numberOfLines={1}>
              {alarm.label || 'Sunrise Alarm'}
            </Text>
            <Text style={styles.offset}>{offsetLabel}</Text>
            <Text style={styles.repeat}>{repeatLabel}</Text>
            <Text style={styles.ringtone}>{ringtone.emoji} {ringtone.label}</Text>
          </View>
        </View>

        {/* Right side */}
        <View style={styles.right}>
          <Switch
            value={alarm.enabled}
            onValueChange={onToggle}
            trackColor={{ false: Colors.border, true: Colors.accentDim }}
            thumbColor={alarm.enabled ? Colors.accent : Colors.textMuted}
          />
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={onDelete}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    alignSelf: 'stretch',
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginRight: 14,
  },
  accentBarOff: {
    backgroundColor: Colors.border,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingRight: 8,
  },
  label: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  offset: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  repeat: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  ringtone: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  right: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  deleteBtn: {
    padding: 4,
  },
});
