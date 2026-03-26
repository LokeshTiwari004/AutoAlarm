import React, { useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { useAlarmStore } from '../store/alarmStore';
import AlarmCard from '../components/AlarmCard';
import SunriseBanner from '../components/SunriseBanner';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Alarm } from '../types/alarm';

type NavProp = StackNavigationProp<RootStackParamList, 'Home'>;

function AnimatedListItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        delay: index * 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation<NavProp>();
  const { alarms, deleteAlarm, toggleAlarm } = useAlarmStore();

  const handleDelete = useCallback(
    (alarm: Alarm) => {
      Alert.alert(
        'Delete Alarm',
        `Delete "${alarm.label || 'Sunrise Alarm'}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteAlarm(alarm.id),
          },
        ]
      );
    },
    [deleteAlarm]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Alarm; index: number }) => (
      <AnimatedListItem index={index}>
        <AlarmCard
          alarm={item}
          onToggle={() => toggleAlarm(item.id)}
          onPress={() => navigation.navigate('AddAlarm', { alarm: item })}
          onDelete={() => handleDelete(item)}
        />
      </AnimatedListItem>
    ),
    [toggleAlarm, navigation, handleDelete]
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>AutoAlarm</Text>
          <Text style={styles.appSub}>Sunrise offset alarms</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={<SunriseBanner />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="alarm-outline" size={56} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No alarms yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to create your first sunrise alarm
            </Text>
          </View>
        }
        contentContainerStyle={alarms.length === 0 ? styles.emptyContainer : styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddAlarm', {})}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={Colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  },
  appName: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSub: {
    color: Colors.textMuted,
    fontSize: 12,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  settingsBtn: {
    padding: 6,
  },
  list: {
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    color: Colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 36,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
