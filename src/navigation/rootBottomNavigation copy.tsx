import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Image, StyleSheet, View, Dimensions } from 'react-native';
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
  name: string;
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

const renderTabIcon = ({ focused, icon, selectedIcon }: TabBarIconProps) => (
  <View>
    <Image
      source={focused ? selectedIcon : icon}
      resizeMode="contain"
      style={{
        width: width > 600 ? scale(18) : scale(22),
        height: width > 600 ? scale(18) : scale(22),
        tintColor: focused ? COLORS.white : 'rgba(191, 191, 191, 1)',
      }}
    />
  </View>
);

export function RootBottomNavigation() {
  const safeAreaInsets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        tabBarLabelStyle: {},
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(191, 191, 191, 1)',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: COLORS.bg2,
          position: 'absolute',
          marginHorizontal: 15,
          borderRadius: 15,
          marginBottom: safeAreaInsets.bottom,
        },
        tabBarIcon: ({ focused }) => {
          const currentTab = myTabs.find(tab => tab.route === route.name);
          return currentTab
            ? renderTabIcon({
                focused,
                icon: currentTab.icon,
                selectedIcon: currentTab.selectedIcon,
                name: currentTab.name,
              })
            : null;
        },
      })}
    >
      {myTabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.route}
          component={tab.component}
          options={{
            tabBarLabel: tab.name,
          }}
        />
      ))}
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({});
