import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alarm, AlarmDraft } from '../types/alarm';
import { scheduleAlarm, cancelAlarm } from '../services/alarmService';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface AlarmStore {
  alarms: Alarm[];
  addAlarm: (draft: AlarmDraft) => Promise<void>;
  updateAlarm: (id: string, draft: AlarmDraft) => Promise<void>;
  deleteAlarm: (id: string) => Promise<void>;
  toggleAlarm: (id: string) => Promise<void>;
  updateNotificationIds: (id: string, notificationIds: string[]) => void;
}

export const useAlarmStore = create<AlarmStore>()(
  persist(
    (set, get) => ({
      alarms: [],

      addAlarm: async (draft) => {
        const alarm: Alarm = {
          ...draft,
          id: uuidv4(),
          notificationIds: [],
          createdAt: Date.now(),
        };
        set((s) => ({ alarms: [...s.alarms, alarm] }));
        const ids = await scheduleAlarm(alarm);
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === alarm.id ? { ...a, notificationIds: ids } : a
          ),
        }));
      },

      updateAlarm: async (id, draft) => {
        const existing = get().alarms.find((a) => a.id === id);
        if (existing) await cancelAlarm(existing);

        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, ...draft, notificationIds: [] } : a
          ),
        }));

        const updated = get().alarms.find((a) => a.id === id)!;
        const ids = await scheduleAlarm(updated);
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, notificationIds: ids } : a
          ),
        }));
      },

      deleteAlarm: async (id) => {
        const alarm = get().alarms.find((a) => a.id === id);
        if (alarm) await cancelAlarm(alarm);
        set((s) => ({ alarms: s.alarms.filter((a) => a.id !== id) }));
      },

      toggleAlarm: async (id) => {
        const alarm = get().alarms.find((a) => a.id === id);
        if (!alarm) return;

        if (alarm.enabled) {
          // Disable: cancel all notifications
          await cancelAlarm(alarm);
          set((s) => ({
            alarms: s.alarms.map((a) =>
              a.id === id ? { ...a, enabled: false, notificationIds: [] } : a
            ),
          }));
        } else {
          // Enable: re-schedule
          set((s) => ({
            alarms: s.alarms.map((a) =>
              a.id === id ? { ...a, enabled: true } : a
            ),
          }));
          const updated = { ...alarm, enabled: true };
          const ids = await scheduleAlarm(updated);
          set((s) => ({
            alarms: s.alarms.map((a) =>
              a.id === id ? { ...a, notificationIds: ids } : a
            ),
          }));
        }
      },

      updateNotificationIds: (id, notificationIds) => {
        set((s) => ({
          alarms: s.alarms.map((a) =>
            a.id === id ? { ...a, notificationIds } : a
          ),
        }));
      },
    }),
    {
      name: 'autoalarm-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
