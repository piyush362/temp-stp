/* eslint-disable react-native/no-inline-styles */
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import React from 'react';
import {Image, StyleSheet, View, Platform, Dimensions} from 'react-native';
import {scale} from 'react-native-size-matters';
import HomeScreen from '../screens/appScreens/tabScreens/HomeScreen';
import HistoryScreen from '../screens/appScreens/tabScreens/HistoryScreen';
import MenuScreen from '../screens/appScreens/tabScreens/MenuScreen';
import {ICONS} from '../theme/icons';
import {COLORS} from '../theme/colors';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();
const {width} = Dimensions.get('window');

// console.log('width', width);

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

const renderTabIcon = ({focused, icon, selectedIcon}: TabBarIconProps) => (
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
      screenOptions={({route}) => ({
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: scale(10),
          marginBottom: Platform.OS === 'ios' ? 0 : 0,
          paddingLeft: width > 600 ? 10 : 0,
        },
        tabBarActiveTintColor: COLORS.white,
        tabBarInactiveTintColor: 'rgba(191, 191, 191, 1)',
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          ...styles.tabBar,
          marginBottom: safeAreaInsets.bottom,
          // ...(Platform.OS === 'android' && styles.androidShadow),
          // height: Platform.OS === 'ios' ? 70 : 70,
          // ...(Platform.OS === 'android' && {
          //   paddingBottom: 10,
          //   borderTopLeftRadius: 20,
          //   borderTopRightRadius: 20,
          //   paddingHorizontal: 10,
          //   // marginBottom
          // }),
        },
        tabBarIcon: ({focused}) => {
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
      })}>
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

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 10,
    right: 10,
    // bottom: Platform.OS === 'ios' ? 20 : 10,
    borderRadius: 15,
    backgroundColor: COLORS.bg2,
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    // shadowColor: '#000',
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // shadowOffset: {width: 0, height: 5},
  },
  androidShadow: {
    elevation: 5,
  },
});
