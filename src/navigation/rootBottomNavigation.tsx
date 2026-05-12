import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, View, Dimensions, Platform } from 'react-native';
import { scale } from 'react-native-size-matters';
import HomeScreen from '../screens/appScreens/tabScreens/HomeScreen';
import HistoryScreen from '../screens/appScreens/tabScreens/HistoryScreen';
import MenuScreen from '../screens/appScreens/tabScreens/MenuScreen';
import { ICONS } from '../theme/icons';
import { COLORS } from '../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

interface TabBarIconProps {
  focused: boolean;
  icon: any;
  selectedIcon: any;
}

const myTabs = [
  {
    name: 'Home',
    route: 'HomeTabScreen',
    component: HomeScreen,
    icon: ICONS.home,
    selectedIcon: ICONS.home2,
  },
  {
    name: 'History',
    route: 'HistoryTabScreen',
    component: HistoryScreen,
    icon: ICONS.clock,
    selectedIcon: ICONS.clock2,
  },
  {
    name: 'Menu',
    route: 'MenuTabScreen',
    component: MenuScreen,
    icon: ICONS.category,
    selectedIcon: ICONS.category2,
  },
];

const TabIcon = ({ focused, icon, selectedIcon }: TabBarIconProps) => {
  const iconSize = width > 600 ? scale(18) : scale(21);
  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperFocused]}>
      <Image
        source={focused ? selectedIcon : icon}
        resizeMode="contain"
        style={{
          width: iconSize,
          height: iconSize,
          tintColor: focused ? COLORS.white : 'rgba(191, 191, 191, 0.75)',
        }}
      />
    </View>
  );
};

export function RootBottomNavigation() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(191, 191, 191, 0.75)',
        tabBarLabelStyle: {
          fontSize: scale(10),
          fontWeight: '600',
          letterSpacing: 0.4,
          marginBottom: scale(5),
        },
        tabBarItemStyle: {
          paddingTop: scale(5),
        },
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: COLORS.bg2,
          marginHorizontal: scale(20),
          marginBottom:
            safeAreaInsets.bottom > 0 ? safeAreaInsets.bottom : scale(14),
          borderRadius: 999,
          height: scale(60),
          borderTopWidth: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
            },
            android: {
              elevation: 14,
            },
          }),
        },
        tabBarIcon: ({ focused }) => {
          const currentTab = myTabs.find(tab => tab.route === route.name);
          return currentTab ? (
            <TabIcon
              focused={focused}
              icon={currentTab.icon}
              selectedIcon={currentTab.selectedIcon}
            />
          ) : null;
        },
      })}
    >
      {myTabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.route}
          component={tab.component}
          options={{ tabBarLabel: tab.name }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: scale(38),
    height: scale(28),
    borderRadius: scale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapperFocused: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
});
