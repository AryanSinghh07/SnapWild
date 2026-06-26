import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SnapScreen       from '../screens/main/SnapScreen';
import CameraScreen     from '../screens/main/CameraScreen';
import CatchResultScreen from '../screens/main/CatchResultScreen';

const Stack = createNativeStackNavigator();

export default function SnapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SnapHome"    component={SnapScreen} />
      <Stack.Screen name="Camera"      component={CameraScreen}      options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="CatchResult" component={CatchResultScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
