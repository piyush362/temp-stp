import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import LoginScreen from '../screens/unAuthScreens/LoginScreen';
import VerifyOtpScreen from '../screens/unAuthScreens/VerifyOtpScreen';
import DocumentScanner from '../screens/documentScaner/DocumentScanner';
import ScannerPreview from '../screens/documentScaner/ScannerPreview';
import DocumentListScreen from '../screens/documentScaner/DocumentListScreen';


const Stack = createStackNavigator();

const MyScreens = [
  {
    id: '212',
    name: 'DocumentScanner',
    component: DocumentScanner,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: '213',
    name: 'ScannerPreview',
    component: ScannerPreview,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: '214',
    name: 'DocumentListScreen',
    component: DocumentListScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: '1',
    name: 'LoginScreen',
    component: LoginScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: '2',
    name: 'VerifyOtpScreen',
    component: VerifyOtpScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
];

export function UnAuthStack() {
  return (
    <Stack.Navigator
      initialRouteName={'DocumentScanner'}
      screenOptions={{
        headerShown: false,
      }}>
      {MyScreens.map(screen => (
        <Stack.Screen
          key={screen.id}
          name={screen.name}
          component={screen.component}
          options={screen.option}
        />
      ))}
    </Stack.Navigator>
  );
}
