import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen       from '../screens/main/ProfileScreen';
import HealthScreen        from '../screens/main/HealthScreen';
import FriendsScreen       from '../screens/main/FriendsScreen';
import ConversationsScreen from '../screens/main/ConversationsScreen';
import ChatScreen          from '../screens/main/ChatScreen';
import { C } from '../theme/colors';

const Stack = createNativeStackNavigator();

export default function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ProfileHome"
        component={ProfileScreen}
        options={{
          headerTitle: '⚡ Profile',
          headerStyle:      { backgroundColor: C.bg },
          headerTintColor:  C.text,
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          headerTitleAlign: 'left',
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen name="Health"        component={HealthScreen}        options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Friends"       component={FriendsScreen}       options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Conversations" component={ConversationsScreen} options={{ headerShown: false, animation: 'slide_from_right' }} />
      <Stack.Screen name="Chat"          component={ChatScreen}          options={{ headerShown: false, animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
