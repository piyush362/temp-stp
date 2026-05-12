import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import LoginScreen from '../screens/unAuthScreens/LoginScreen';
import VerifyOtpScreen from '../screens/unAuthScreens/VerifyOtpScreen';


const Stack = createStackNavigator();

const MyScreens = [
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
      initialRouteName={'LoginScreen'}
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
