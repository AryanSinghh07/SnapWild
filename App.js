import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const C = {
  bg:      '#0D1F16',
  card:    '#1A2E20',
  primary: '#1B6B3A',
  accent:  '#F4A500',
  text:    '#FFFFFF',
  muted:   '#8FA99A',
};

function Screen({ emoji, title, sub }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{sub}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>✓ Working</Text>
      </View>
    </View>
  );
}

const icon = (e) => () => <Text style={{ fontSize: 22 }}>{e}</Text>;

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerStyle:      { backgroundColor: C.bg },
            headerTintColor:  C.text,
            headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
            tabBarStyle:      { backgroundColor: C.card, borderTopColor: C.primary, borderTopWidth: 2 },
            tabBarActiveTintColor:   C.accent,
            tabBarInactiveTintColor: C.muted,
            tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
          }}
        >
          <Tab.Screen
            name="Discover"
            options={{ tabBarIcon: icon('🗺️'), headerTitle: '🌿 SnapWild' }}
          >
            {() => <Screen emoji="🗺️" title="Discover" sub="Find wildlife near you" />}
          </Tab.Screen>

          <Tab.Screen
            name="Snap"
            options={{ tabBarIcon: icon('📸'), headerTitle: '📸 Snap & Catch' }}
          >
            {() => <Screen emoji="📸" title="Snap & Catch" sub="AI-powered identification" />}
          </Tab.Screen>

          <Tab.Screen
            name="Collection"
            options={{ tabBarIcon: icon('🦁'), headerTitle: '🦁 My Collection' }}
          >
            {() => <Screen emoji="🦁" title="My Collection" sub="0 animals caught so far" />}
          </Tab.Screen>

          <Tab.Screen
            name="Profile"
            options={{ tabBarIcon: icon('⚡'), headerTitle: '⚡ Profile' }}
          >
            {() => <Screen emoji="⚡" title="Profile" sub="Level 1 · 0 XP" />}
          </Tab.Screen>
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: C.text,
  },
  sub: {
    fontSize: 15,
    color: C.muted,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: C.primary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: C.accent,
    fontWeight: 'bold',
    fontSize: 14,
  },
});
