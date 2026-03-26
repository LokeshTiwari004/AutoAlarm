export interface Alarm {
  id: string;
  label: string;
  /** Positive = after sunrise, negative = before sunrise */
  offsetMinutes: number;
  /** 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat. Empty = one-time */
  repeatDays: number[];
  enabled: boolean;
  /** Ringtone identifier — maps to a bundled sound or 'default' */
  ringtone: string;
  /** Expo notification identifiers so we can cancel them */
  notificationIds: string[];
  createdAt: number;
}

export type AlarmDraft = Omit<Alarm, 'id' | 'notificationIds' | 'createdAt'>;
