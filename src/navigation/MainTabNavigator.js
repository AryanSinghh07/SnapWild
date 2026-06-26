import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme/colors';

import DiscoverStack    from './DiscoverStack';
import SnapStack        from './SnapStack';
import CollectionStack  from './CollectionStack';
import ProfileStack     from './ProfileStack';

const Tab = createBottomTabNavigator();

const TAB_CONFIG = [
  { name: 'Discover',   icon: 'map-outline',   iconOn: 'map',    label: 'Discover'    },
  { name: 'Snap',       icon: 'camera',        iconOn: 'camera', label: 'Snap',  special: true },
  { name: 'Collection', icon: 'grid-outline',  iconOn: 'grid',   label: 'Collect'     },
  { name: 'Profile',    icon: 'person-outline',iconOn: 'person', label: 'Profile'     },
];

function CustomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: insets.bottom || 10 }]}>
      {state.routes.map((route, i) => {
        const tab     = TAB_CONFIG[i];
        const focused = state.index === i;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        if (tab.special) {
          return (
            <TouchableOpacity key={route.key} style={s.snapWrap} onPress={onPress} activeOpacity={0.8}>
              <View style={[s.snapBtn, focused && s.snapBtnActive]}>
                <Ionicons name="camera" size={26} color={focused ? C.bg : C.text} />
              </View>
              <Text style={[s.label, focused && s.labelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        }

        return (
          <TouchableOpacity key={route.key} style={s.tabItem} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={focused ? tab.iconOn : tab.icon} size={22} color={focused ? C.accent : C.muted} />
            <Text style={[s.label, focused && s.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle:      { backgroundColor: C.bg, elevation: 0, shadowOpacity: 0 },
        headerTintColor:  C.text,
        headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
        headerTitleAlign: 'left',
      }}
    >
      <Tab.Screen name="Discover"   component={DiscoverStack}    options={{ headerShown: false }} />
      <Tab.Screen name="Snap"       component={SnapStack}        options={{ headerShown: false }} />
      <Tab.Screen name="Collection" component={CollectionStack}  options={{ headerShown: false }} />
      <Tab.Screen name="Profile"    component={ProfileStack}     options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row', backgroundColor: C.card,
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10,
  },
  tabItem:  { flex: 1, alignItems: 'center', gap: 4, paddingBottom: 4 },
  label:        { fontSize: 10, color: C.muted, fontWeight: '600' },
  labelActive:  { color: C.accent },

  snapWrap: { flex: 1, alignItems: 'center', gap: 4, paddingBottom: 4 },
  snapBtn: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: C.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: C.border,
    transform: [{ translateY: -10 }],
  },
  snapBtnActive: { backgroundColor: C.accent, borderColor: C.accent },
});
