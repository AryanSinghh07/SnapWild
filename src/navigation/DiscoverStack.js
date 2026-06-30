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
import BreedGroupsScreen    from '../screens/main/BreedGroupsScreen';
import PetProfileScreen     from '../screens/main/PetProfileScreen';
import RescueAlertsScreen   from '../screens/main/RescueAlertsScreen';
import ReportInjuredScreen  from '../screens/main/ReportInjuredScreen';
import CreatePostScreen     from '../screens/main/CreatePostScreen';
import PostDetailScreen     from '../screens/main/PostDetailScreen';
import SpeciesPageScreen    from '../screens/main/SpeciesPageScreen';
import HealthScreen         from '../screens/main/HealthScreen';
import PetSpotsScreen       from '../screens/main/PetSpotsScreen';

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
      <Stack.Screen name="BreedGroups"    component={BreedGroupsScreen}   options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PetProfile"    component={PetProfileScreen}    options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="RescueAlerts"  component={RescueAlertsScreen}  options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ReportInjured" component={ReportInjuredScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="CreatePost"    component={CreatePostScreen}    options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="PostDetail"    component={PostDetailScreen}    options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="SpeciesPage"   component={SpeciesPageScreen}   options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="Health"        component={HealthScreen}         options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="PetSpots"      component={PetSpotsScreen}       options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
