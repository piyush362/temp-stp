import React from 'react';
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack';
import {RootBottomNavigation} from './rootBottomNavigation';
import WalletScreen from '../screens/appScreens/wallet/WalletScreen';
import PrivacyPolicyScreen from '../screens/appScreens/termsandPolicy/privacyPolicy';
import TermsAndConditionScreen from '../screens/appScreens/termsandPolicy/termsAndConditions';
import FindKioskScreen from '../screens/appScreens/kiosk/FindKioskScreen';
import NotificationScreen from '../screens/appScreens/notificationScreen/NotificationScreen';
import CodeGeneratedScreen from '../screens/appScreens/codeGenerate/CodeGeneratedScreen';
import PreviewDocScreen from '../screens/appScreens/codeGenerate/PreviewDocScreen';
import MapWebViewComponent from '../components/mapView/MapWebViewComponent';
import QRScannerModalScreen from '../components/modals/QRScannerModalScreen';
import LocationScreen from '../screens/appScreens/locationsScreens/LocationScreen';
import TestPayment from '../screens/appScreens/TestPayment';
import ProfileScreen from '../screens/appScreens/profileScreens/ProfileScreen';
import RefundPolicyScreen from '../screens/appScreens/termsandPolicy/refundPolicy';
import SimpleBottomSheet from '../components/bottomSheet/SimpleBottmSheet';
import ChoosePaymentMethodScreen from '../components/bottomSheet/ChoosePaymentMethodScreen';
import PrintSpecsScreen from '../components/bottomSheet/PrintSpecsScreen';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import ReferralScreen from '../screens/appScreens/referralScreens/ReferralScreen';
import VideoPlayerScreen from '../screens/appScreens/VideoPlayerScreen';
import MultiDocPrintSpecScreen from '../screens/appScreens/multiDocPrintScreens/MultiDocPrintSpecScreen';
import DocSupportScreen from '../screens/appScreens/supportScreens/DocSupportScreen';
import SupportTicketListScreen from '../screens/appScreens/supportScreens/SupportTicketListScreen';
import SupportChatScreen from '../screens/appScreens/supportScreens/SupportChatScreen';

const Stack = createStackNavigator();

const MyScreens = [
  {
    id: 1,
    name: 'RootBottomNavigation',
    component: RootBottomNavigation,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: 1,
    name: 'WalletScreen',
    component: WalletScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: 8,
    name: 'TermsAndConditionScreen',
    component: TermsAndConditionScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: 9,
    name: 'PrivacyPolicyScreen',
    component: PrivacyPolicyScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: 9,
    name: 'FindKioskScreen',
    component: FindKioskScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: 10,
    name: 'NotificationScreen',
    component: NotificationScreen,
    option: {
      cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
    },
  },
  {
    id: 11,
    name: 'CodeGeneratedScreen',
    component: CodeGeneratedScreen,
  },
  {
    id: 12,
    name: 'PreviewDocScreen',
    component: PreviewDocScreen,
  },
  {
    id: 13,
    name: 'MapWebViewComponent',
    component: MapWebViewComponent,
  },
  {
    id: 14,
    name: 'QRScannerModalScreen',
    component: QRScannerModalScreen,
  },
  {
    id: 15,
    name: 'LocationScreen',
    component: LocationScreen,
  },
  {
    id: 16,
    name: 'TestPayment',
    component: TestPayment,
  },
  {
    id: 16,
    name: 'ProfileScreen',
    component: ProfileScreen,
  },
  {
    id: 116,
    name: 'RefundPolicyScreen',
    component: RefundPolicyScreen,
  },
  {
    id: 1134,
    name: 'SimpleBottomSheet',
    component: SimpleBottomSheet,
  },
  {
    id: 11341,
    name: 'ChoosePaymentMethodScreen',
    component: ChoosePaymentMethodScreen,
  },
  {
    id: 11342,
    name: 'PrintSpecsScreen',
    component: PrintSpecsScreen,
  },
  {
    id: 113242,
    name: 'ReferralScreen',
    component: ReferralScreen,
  },
  {
    id: 1132425,
    name: 'VideoPlayerScreen',
    component: VideoPlayerScreen,
  },
  {
    id: 11324225,
    name: 'MultiDocPrintSpecScreen',
    component: MultiDocPrintSpecScreen,
  },
  {
    id: 113242255,
    name: 'DocSupportScreen',
    component: DocSupportScreen,
  },
  {
    id: 987,
    name: 'SupportTicketListScreen',
    component: SupportTicketListScreen,
  },
  {
    id: 9873,
    name: 'SupportChatScreen',
    component: SupportChatScreen,
  },
];

export function AppStack() {
  const {isNewUser} = useSelector((state: RootState) => state.auth);

  const initialRouteName = isNewUser ? 'ProfileScreen' : 'RootBottomNavigation';
  // const initialRouteName = isNewUser ? 'RootBottomNavigation' : 'ProfileScreen';

  return (
    <Stack.Navigator
      // initialRouteName={'RootBottomNavigation'}
      initialRouteName={initialRouteName}
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
