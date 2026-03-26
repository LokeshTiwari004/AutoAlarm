import * as Location from 'expo-location';

export interface Coords {
  latitude: number;
  longitude: number;
}

export async function requestLocationPermission(): Promise<boolean> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

export async function getCurrentLocation(): Promise<Coords | null> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (e) {
    console.warn('Failed to get location:', e);
    return null;
  }
}

export async function getLocationName(coords: Coords): Promise<string> {
  try {
    const [place] = await Location.reverseGeocodeAsync(coords);
    if (place) {
      return [place.city, place.region, place.country]
        .filter(Boolean)
        .join(', ');
    }
    return `${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°`;
  } catch {
    return `${coords.latitude.toFixed(2)}°, ${coords.longitude.toFixed(2)}°`;
  }
}
