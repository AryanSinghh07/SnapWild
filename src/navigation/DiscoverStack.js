import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DiscoverScreen       from '../screens/main/DiscoverScreen';
import LeaderboardScreen    from '../screens/main/LeaderboardScreen';
import CommunityFeedScreen  from '../screens/main/CommunityFeedScreen';
import MissionsScreen       from '../screens/main/MissionsScreen';
import PetPlaydatesScreen   from '../screens/main/PetPlaydatesScreen';
import AddPetScreen         from '../screens/main/AddPetScreen';
import PetDetailScreen      from '../screens/main/PetDetailScreen';
import MeetupScreen         from '../screens/main/MeetupScreen';
import RateMeetupScreen     from '../screens/main/RateMeetupScreen';

const Stack = createNativeStackNavigator();

export default function DiscoverStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverHome"  component={DiscoverScreen}      />
      <Stack.Screen name="Leaderboard"   component={LeaderboardScreen}   options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Community"     component={CommunityFeedScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Missions"      component={MissionsScreen}      options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PetPlaydates"  component={PetPlaydatesScreen}  options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="AddPet"        component={AddPetScreen}        options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="PetDetail"     component={PetDetailScreen}     options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Meetup"        component={MeetupScreen}        options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      <Stack.Screen name="RateMeetup"    component={RateMeetupScreen}    options={{ animation: 'slide_from_right', gestureEnabled: false }} />
    </Stack.Navigator>
  );
}
