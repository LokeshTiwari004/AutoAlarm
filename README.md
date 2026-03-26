# AutoAlarm 🌅

AutoAlarm is a smart scheduling app for Android built with React Native and Expo. It dynamically schedules daily alarms mapped to the local sunrise time.

Instead of manually adjusting your alarm clock every week as the sunrise changes throughout the year, AutoAlarm allows you to set an alarm like **"10 minutes before sunrise"**, **"at sunrise"**, or **"30 minutes after sunrise"** and automatically recalibrates itself.

## 🚀 Key Features
- **Dynamic Sunrise Tracking**: Leverages the [sunrisesunset.io](https://sunrisesunset.io/) API to fetch ultra-accurate local sunrise times without an API key. 
- **Smart 3-Day Caching**: Caches geo-location sunrise queries to AsyncStorage, optimizing startup speeds and cutting redundant network requests.
- **Repeat Logic & Offset**: Type any custom minute offset ranging from -1440 to +1440. Schedule alarms for specific days of the week or run them one time.
- **Custom Native Ringtones**: Pick from 6 unique alarm ringtone behaviors mapped natively using `expo-av` and Expo Notification channels (requires a standalone native build for full playback).
- **Offline Reliability**: Calculates an overlapping 3-day scheduling window so the alarm strictly works without needing to be connected or opened every single night.
- **Dark Mode First**: Clean, performant dark mode UI mapped out with standard React Native Animations (no TurboModule overhead!).

## 💻 Tech Stack
- **Framework**: [React Native](https://reactnative.dev/)
- **Toolset**: [Expo SDK 54](https://expo.dev/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Persistence**: `@react-native-async-storage/async-storage`
- **Background Tasks**: `expo-notifications`, `expo-location`

## 📦 Setting Up for Local Development
1. **Install dependencies:**
    ```bash
    npm install
    ```
2. **Run Expo Dev Server:**
    ```bash
    npx expo start
    ```
    *Note: Some native features like the Custom Ringtones will fall back to `Vibration` feedback when running on the Expo Go app.*

## 🏗️ Building for Production (EAS)
The app is fully configured for Expo Application Services (EAS). `eas.json` implements three build profiles: `"development"`, `"preview"`, and `"production"`.

**Create an installable testing APK:**
```bash
npx eas-cli build -p android --profile preview
```

**Create a Google Play Store bundle (AAB):**
```bash
npx eas-cli build -p android --profile production
```

## 📝 Permissions Required
- `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` (Sunrise API calc)
- `POST_NOTIFICATIONS` 
- `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` (Android 12+)
- `VIBRATE` & `WAKE_LOCK`
