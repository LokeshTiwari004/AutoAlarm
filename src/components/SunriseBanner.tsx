import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { getCurrentLocation, getLocationName, Coords } from '../services/locationService';
import { fetchSunrise } from '../services/sunriseService';

export default function SunriseBanner() {
  const [loading, setLoading] = useState(true);
  const [sunriseTime, setSunriseTime] = useState<string | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = await getCurrentLocation();
      if (!coords) {
        setError('Location unavailable');
        return;
      }
      const [result, name] = await Promise.all([
        fetchSunrise(coords),
        getLocationName(coords),
      ]);
      if (result) {
        setSunriseTime(
          result.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        );
      } else {
        setError('Could not fetch sunrise');
      }
      setLocationName(name);
    } catch {
      setError('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2A1500', '#1A0D00', Colors.background]}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <View style={styles.iconRow}>
          <Ionicons name="sunny" size={36} color={Colors.accent} />
        </View>
        <Text style={styles.title}>Today's Sunrise</Text>
        {loading ? (
          <ActivityIndicator color={Colors.accent} style={{ marginTop: 8 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={styles.time}>{sunriseTime}</Text>
            {locationName && (
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.location}>{locationName}</Text>
              </View>
            )}
          </>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 0,
    paddingBottom: 24,
  },
  container: {
    alignItems: 'center',
    paddingTop: 20,
  },
  iconRow: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    color: Colors.textSecondary,
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  time: {
    color: Colors.accent,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  location: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
  error: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 8,
  },
});
