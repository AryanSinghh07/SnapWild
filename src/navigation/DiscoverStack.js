import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen     from '../screens/main/DiscoverScreen';
import LeaderboardScreen  from '../screens/main/LeaderboardScreen';

const Stack = createNativeStackNavigator();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverHome"  component={DiscoverScreen}    />
      <Stack.Screen name="Leaderboard"   component={LeaderboardScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
