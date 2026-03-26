import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Alarm } from '../types/alarm';
import { fetchSunrise, computeAlarmTime } from './sunriseService';
import { getCurrentLocation } from './locationService';
import { getRingtoneById } from './ringtoneService';

// ─── Notification channel setup ─────────────────────────────────────────────

export async function setupNotifications() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarm', {
      name: 'Alarms',
      description: 'Sunrise offset alarm notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 500, 250, 500, 250, 500],
      lightColor: '#F5A623',
      lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      sound: 'default',
      bypassDnd: true,
    });
  }

  await Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// ─── Scheduling ──────────────────────────────────────────────────────────────

/**
 * Schedules notifications for an alarm for the next 14 days.
 * Returns the list of notification IDs that were created.
 */
export async function scheduleAlarm(alarm: Alarm): Promise<string[]> {
  if (!alarm.enabled) return [];

  const coords = await getCurrentLocation();
  if (!coords) {
    console.warn('Cannot schedule alarm: no location');
    return [];
  }

  const notificationIds: string[] = [];
  const now = new Date();

  // Schedule for the next 3 days to align with cache limits and avoid excessive API hits
  for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + dayOffset);

    // Check if this day-of-week is selected (or it's a one-time alarm on day 0)
    const dayOfWeek = targetDate.getDay(); // 0=Sun … 6=Sat
    const isRepeating = alarm.repeatDays.length > 0;

    if (isRepeating && !alarm.repeatDays.includes(dayOfWeek)) continue;
    if (!isRepeating && dayOffset > 0) break; // one-time: only schedule once

    const sunriseData = await fetchSunrise(coords, targetDate);
    if (!sunriseData) continue;

    const alarmTime = computeAlarmTime(sunriseData.sunrise, alarm.offsetMinutes);

    // Skip if the alarm time is in the past
    if (alarmTime <= now) {
      if (!isRepeating) break; // one-time, no future date possible today
      continue;
    }

    const ringtone = getRingtoneById(alarm.ringtone ?? 'default');
    const offsetLabel = formatOffsetLabel(alarm.offsetMinutes);
    const timeLabel = alarmTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: alarm.label || 'Sunrise Alarm',
          body: `${offsetLabel} — ${timeLabel}`,
          sound: ringtone.notificationSound,
          data: { alarmId: alarm.id },
          ...(Platform.OS === 'android' && { channelId: 'alarm' }),
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: alarmTime,
        },
      });
      notificationIds.push(id);
    } catch (e) {
      console.warn('Failed to schedule notification:', e);
    }
  }

  return notificationIds;
}

/**
 * Cancels all notifications associated with an alarm.
 */
export async function cancelAlarm(alarm: Alarm): Promise<void> {
  for (const id of alarm.notificationIds) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch (e) {
      // Already fired or cancelled
    }
  }
}

/**
 * Reschedules all enabled alarms — call on app startup to refresh the 14-day window.
 */
export async function rescheduleAll(alarms: Alarm[]): Promise<Map<string, string[]>> {
  const updated = new Map<string, string[]>();
  for (const alarm of alarms) {
    if (!alarm.enabled) continue;
    await cancelAlarm(alarm);
    const ids = await scheduleAlarm(alarm);
    updated.set(alarm.id, ids);
  }
  return updated;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatOffsetLabel(offsetMinutes: number): string {
  const abs = Math.abs(offsetMinutes);
  if (abs === 0) return 'At sunrise';
  const direction = offsetMinutes < 0 ? 'before' : 'after';
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  return `${parts.join(' ')} ${direction} sunrise`;
}
