import { Vibration } from 'react-native';

export interface Ringtone {
  id: string;
  label: string;
  emoji: string;
  /** expo-notifications sound value */
  notificationSound: string;
  hasPreview: boolean;
}

export const RINGTONES: Ringtone[] = [
  { id: 'default',  label: 'Default',       emoji: '🔔', notificationSound: 'default', hasPreview: true  },
  { id: 'gentle',   label: 'Gentle',        emoji: '🎵', notificationSound: 'default', hasPreview: true  },
  { id: 'sunrise',  label: 'Sunrise',       emoji: '🌅', notificationSound: 'default', hasPreview: true  },
  { id: 'bell',     label: 'Bell',          emoji: '🛎️', notificationSound: 'default', hasPreview: true  },
  { id: 'digital',  label: 'Digital',       emoji: '📟', notificationSound: 'default', hasPreview: true  },
  { id: 'vibrate',  label: 'Vibrate only',  emoji: '📳', notificationSound: 'default', hasPreview: true  },
];

export function getRingtoneById(id: string): Ringtone {
  return RINGTONES.find((r) => r.id === id) ?? RINGTONES[0];
}

/**
 * Vibrates the device in a pattern unique to the ringtone.
 * Uses RN Vibration API — works on all Android devices.
 */
export async function previewRingtone(ringtone: Ringtone): Promise<void> {
  switch (ringtone.id) {
    case 'gentle':
      // One short pulse
      Vibration.vibrate([0, 80]);
      break;
    case 'vibrate':
      // Long strong pulse
      Vibration.vibrate([0, 400, 100, 400]);
      break;
    case 'bell':
      // Three short bursts
      Vibration.vibrate([0, 100, 80, 100, 80, 100]);
      break;
    case 'digital':
      // Rapid staccato
      Vibration.vibrate([0, 50, 40, 50, 40, 50, 40, 50]);
      break;
    case 'sunrise':
      // Gentle rising pattern
      Vibration.vibrate([0, 60, 60, 100, 60, 150]);
      break;
    default:
      // Default: two medium pulses
      Vibration.vibrate([0, 200, 100, 200]);
      break;
  }
}

export async function stopPreview(): Promise<void> {
  Vibration.cancel();
}

