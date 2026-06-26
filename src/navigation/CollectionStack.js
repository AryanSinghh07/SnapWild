import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CollectionScreen from '../screens/main/CollectionScreen';
import MapScreen        from '../screens/main/MapScreen';

const Stack = createNativeStackNavigator();

export default function CollectionStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CollectionHome" component={CollectionScreen} />
      <Stack.Screen name="CatchMap"       component={MapScreen}        options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
