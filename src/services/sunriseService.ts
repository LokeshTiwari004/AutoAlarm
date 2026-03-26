import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coords } from './locationService';

export interface SunriseSunsetResult {
  sunrise: Date;
  sunset: Date;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const CACHE_DAYS = 3;
const CACHE_PREFIX = 'sunrise_cache_';

/** Round coords to 2 decimal places (~1.1 km grid) to use as cache key */
function coordKey(coords: Coords): string {
  return `${coords.latitude.toFixed(2)}_${coords.longitude.toFixed(2)}`;
}

function cacheKey(coords: Coords, date: Date): string {
  return `${CACHE_PREFIX}${coordKey(coords)}_${formatDate(date)}`;
}

interface CachedEntry {
  sunriseMs: number;
  sunsetMs: number;
  fetchedAt: number;
}

/** Returns cached result or null if not found / expired (older than 12 h) */
async function getCached(
  coords: Coords,
  date: Date
): Promise<SunriseSunsetResult | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(coords, date));
    if (!raw) return null;
    const entry: CachedEntry = JSON.parse(raw);
    // Expire after 12 hours (in case of API corrections)
    if (Date.now() - entry.fetchedAt > 12 * 60 * 60 * 1000) return null;
    return {
      sunrise: new Date(entry.sunriseMs),
      sunset: new Date(entry.sunsetMs),
    };
  } catch {
    return null;
  }
}

async function setCache(
  coords: Coords,
  date: Date,
  result: SunriseSunsetResult
): Promise<void> {
  try {
    const entry: CachedEntry = {
      sunriseMs: result.sunrise.getTime(),
      sunsetMs: result.sunset.getTime(),
      fetchedAt: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey(coords, date), JSON.stringify(entry));
  } catch {
    // cache write failure is non-fatal
  }
}

/** Purge cache entries older than CACHE_DAYS to limit storage usage */
export async function purgeSunriseCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(now.getDate() - CACHE_DAYS);

    const toDelete = keys.filter((k) => {
      if (!k.startsWith(CACHE_PREFIX)) return false;
      // Key format: sunrise_cache_{lat}_{lng}_{YYYY-MM-DD}
      const datePart = k.split('_').slice(-1)[0]; // last segment is the date
      if (!datePart || datePart.length !== 10) return false;
      return new Date(datePart) < cutoff;
    });

    if (toDelete.length > 0) {
      await AsyncStorage.multiRemove(toDelete);
    }
  } catch {
    // non-fatal
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

/**
 * Fetches sunrise/sunset for the given coords and date.
 * Results are cached per (location-grid, date) for up to 12 hours
 * and purged after CACHE_DAYS (3) days.
 */
export async function fetchSunrise(
  coords: Coords,
  date: Date = new Date()
): Promise<SunriseSunsetResult | null> {
  // 1. Try cache first
  const cached = await getCached(coords, date);
  if (cached) {
    console.log('[sunriseService] cache hit for', formatDate(date));
    return cached;
  }

  // 2. Fetch from API
  try {
    const dateStr = formatDate(date);
    const url = `https://api.sunrisesunset.io/json?lat=${coords.latitude}&lng=${coords.longitude}&date=${dateStr}`;
    const res = await fetch(url);
    const json = await res.json();
    if (json.status !== 'OK') return null;

    const { sunrise: sunriseStr, sunset: sunsetStr, utc_offset } = json.results;
    const utcOffsetMinutes: number =
      typeof utc_offset === 'number' ? utc_offset : parseInt(utc_offset, 10) || 0;

    const result: SunriseSunsetResult = {
      sunrise: parseTimeString(sunriseStr, date, utcOffsetMinutes),
      sunset: parseTimeString(sunsetStr, date, utcOffsetMinutes),
    };

    // 3. Cache the result
    await setCache(coords, date, result);

    console.log('[sunriseService] fetched & cached for', dateStr);
    return result;
  } catch (e) {
    console.warn('Sunrise API error:', e);
    return null;
  }
}

/**
 * Computes the alarm fire Date = sunrise + offsetMinutes.
 * offsetMinutes > 0 => after sunrise, < 0 => before sunrise.
 */
export function computeAlarmTime(sunrise: Date, offsetMinutes: number): Date {
  return new Date(sunrise.getTime() + offsetMinutes * 60 * 1000);
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseTimeString(
  timeStr: string,
  date: Date,
  utcOffsetMinutes: number
): Date {
  const match = timeStr.match(/(\d+):(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) {
    console.warn('Could not parse time string:', timeStr);
    return date;
  }

  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = parseInt(match[3], 10);
  const period = match[4].toUpperCase();

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  const y = date.getFullYear();
  const mo = date.getMonth();
  const d = date.getDate();

  const utcMs =
    Date.UTC(y, mo, d, hours, minutes, seconds) - utcOffsetMinutes * 60 * 1000;

  return new Date(utcMs);
}
