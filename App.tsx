import 'react-native-get-random-values';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotifications, requestNotificationPermission, rescheduleAll } from './src/services/alarmService';
import { requestLocationPermission } from './src/services/locationService';
import { purgeSunriseCache } from './src/services/sunriseService';
import { useAlarmStore } from './src/store/alarmStore';
import { Colors } from './src/theme/colors';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  const alarms = useAlarmStore((s) => s.alarms);
  const updateNotificationIds = useAlarmStore((s) => s.updateNotificationIds);

  useEffect(() => {
    const init = async () => {
      // Setup notification channel and handler
      await setupNotifications();

      // Purge stale sunrise cache (>3 days old)
      purgeSunriseCache();

      // Request permissions
      await requestLocationPermission();
      await requestNotificationPermission();

      // Refresh all alarm schedules (extend 3-day window)
      const updates = await rescheduleAll(alarms);
      updates.forEach((ids, alarmId) => {
        updateNotificationIds(alarmId, ids);
      });
    };

    init();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Handle notification responses (user taps on alarm notification)
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      // Could navigate to alarm detail here
      console.log('Alarm notification tapped:', response.notification.request.content.data);
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
