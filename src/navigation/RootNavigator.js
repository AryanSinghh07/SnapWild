import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { C } from '../theme/colors';

import WelcomeScreen    from '../screens/auth/WelcomeScreen';
import PhoneScreen      from '../screens/auth/PhoneScreen';
import OTPScreen        from '../screens/auth/OTPScreen';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={C.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      {user ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen
            name="Phone"
            component={PhoneScreen}
            options={{ animation: 'slide_from_right' }}
          />
          <Stack.Screen
            name="OTP"
            component={OTPScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
