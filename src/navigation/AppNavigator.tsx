import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import AddAlarmScreen from '../screens/AddAlarmScreen';
import { Colors } from '../theme/colors';
import { Alarm } from '../types/alarm';

export type RootStackParamList = {
  Home: undefined;
  AddAlarm: { alarm?: Alarm };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          shadowColor: 'transparent',
          elevation: 0,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddAlarm"
        component={AddAlarmScreen}
        options={({ route }) => ({
          title: route.params?.alarm ? 'Edit Alarm' : 'New Alarm',
          presentation: 'modal',
          headerStyle: {
            backgroundColor: Colors.surface,
            shadowColor: Colors.border,
            elevation: 1,
          },
        })}
      />
    </Stack.Navigator>
  );
}
