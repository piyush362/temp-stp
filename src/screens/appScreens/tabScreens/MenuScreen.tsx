/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, {useState} from 'react';
import {COLORS} from '../../../theme/colors';
import {ICONS} from '../../../theme/icons';
import {BOLD_TEXT} from '../../../theme/styles.global';
import {SafeAreaView} from 'react-native-safe-area-context';
import DashboardHeader from '../../../components/header/DashboardHeader';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {setAuthorizationStatus} from '../../../redux/slices/auth.slice';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import {removeTokensFromAsyncStorage} from '../../../utils/utils';
import DashboardHeader2 from '../../../components/header/DashboardHeader2';

export default function MenuScreen() {
  const [active, setActive] = useState(false);
  // const [profileData, setProfileData] = useState(null);

  const handleActive = (active: boolean) => setActive(active);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);

  const dispatch = useDispatch();
  const navigation = useNavigation();

  const logout = async () => {
    dispatch(setAuthorizationStatus(false));
    await removeTokensFromAsyncStorage();
    setActive(false);
  };

  const menuItem = [
    {
      id: 1324,
      name: 'Profile',
      icon: ICONS.user,
      onPress: () => {
        navigation.navigate('ProfileScreen' as never);
      },
    },
    {
      id: 134,
      name: 'Wallet',
      icon: ICONS.wallet3,
      onPress: () => {
        navigation.navigate('WalletScreen' as never);
      },
    },
    {
      id: 10,
      name: 'History',
      icon: ICONS.clock3,
      onPress: () => {
        navigation.navigate('HistoryTabScreen' as never);
      },
    },

    {
      id: 2,
      name: 'Privacy Policy',
      icon: ICONS.policy,
      onPress: () => {
        navigation.navigate('PrivacyPolicyScreen' as never);
      },
    },
    {
      id: 112,
      name: 'Refund Policy',
      icon: ICONS.policy,
      onPress: () => {
        navigation.navigate('RefundPolicyScreen' as never);
      },
    },
    {
      id: 1,
      name: 'Term & Condition',
      icon: ICONS.term,
      onPress: () => {
        navigation.navigate('TermsAndConditionScreen' as never);
      },
    },

    {
      id: 5,
      name: 'Nearby Kiosks',
      icon: ICONS.policy,
      onPress: () => {
        navigation.navigate('FindKioskScreen' as never);
      },
    },
    {
      id: 6,
      name: 'Notifications',
      icon: ICONS.policy,
      onPress: () => {
        navigation.navigate('NotificationScreen' as never);
      },
    },
    {
      id: 61,
      name: 'Referrals',
      icon: ICONS.policy,
      onPress: () => {
        navigation.navigate('ReferralScreen' as never);
      },
    },
    {
      id: 611,
      name: 'Support Tickets',
      icon: ICONS.policy,
      onPress: () => {
        navigation.navigate('SupportTicketListScreen' as never);
      },
    },
    {
      id: 3,
      name: 'Logout',
      icon: ICONS.logout,
      onPress: () => {
        handleActive(true);
      },
    },
    {
      id: 4,
      name: 'Delete Account',
      icon: ICONS.user,
      onPress: () => {
        setDeleteAccountModal(true);
      },
    },
  ];

  const renderMenuItem = () => (
    <View style={{paddingTop: 10}}>
      {menuItem.map(item => (
        <TouchableOpacity
          key={item.id}
          style={styles.menuItemContainer}
          onPress={item.onPress}>
          <View style={{}}>
            <Image
              source={item.icon}
              style={{width: 30, height: 30, objectFit: 'contain'}}
            />
          </View>
          <Text style={BOLD_TEXT(15)}>{item.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderLogoutModal = () => {
    return (
      <Modal visible={active} transparent>
        <TouchableWithoutFeedback onPress={() => handleActive(false)}>
          <View style={styles.modal}>
            <TouchableWithoutFeedback>
              <View style={styles.modalInner}>
                <Text allowFontScaling={false} style={styles.modalTitle}>
                  Confirm Logout
                </Text>
                <Text allowFontScaling={false} style={styles.modalSubtitle}>
                  Are you sure you want to logout?
                </Text>
                <View style={styles.modalActions}>
                  <CustomGradientButton
                    onPress={() => handleActive(false)}
                    title="Cancel"
                    outerContainerStyle={{
                      width: '45%',
                    }}
                    innerContainerStyle={{
                      backgroundColor: 'white',
                    }}
                    labelStyle={{
                      color: COLORS.bg2,
                    }}
                  />
                  <CustomGradientButton
                    onPress={logout}
                    title="Logout"
                    outerContainerStyle={{
                      width: '45%',
                    }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  const renderDeleteAccountModal = () => {
    return (
      <Modal visible={deleteAccountModal} transparent>
        <TouchableWithoutFeedback onPress={() => setDeleteAccountModal(false)}>
          <View style={styles.modal}>
            <TouchableWithoutFeedback>
              <View style={styles.modalInner}>
                <Text allowFontScaling={false} style={styles.modalTitle}>
                  Delete Account
                </Text>
                <Text allowFontScaling={false} style={styles.modalSubtitle}>
                  Are you sure you want to Delete account?
                </Text>
                <View style={styles.modalActions}>
                  <CustomGradientButton
                    onPress={() => setDeleteAccountModal(false)}
                    title="Cancel"
                    outerContainerStyle={{
                      width: '45%',
                    }}
                    innerContainerStyle={{
                      backgroundColor: 'white',
                    }}
                    labelStyle={{
                      color: COLORS.bg2,
                    }}
                  />
                  <CustomGradientButton
                    onPress={logout}
                    title="Confirm"
                    outerContainerStyle={{
                      width: '45%',
                    }}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: COLORS.mainBg, padding: 15}}>
      <StatusBar barStyle={'dark-content'} backgroundColor={COLORS.mainBg} />
      <DashboardHeader2 />
      <ScrollView
        contentContainerStyle={{paddingBottom: 20}} // no flex:1
        showsVerticalScrollIndicator={false}>
        {renderMenuItem()}
      </ScrollView>
      <View style={{height: 60}} />
      {renderLogoutModal()}
      {renderDeleteAccountModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  locationContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  walletContainer: {
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    borderRadius: 30,
    gap: 10,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  menuItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 15,
  },
  modal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalInner: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    gap: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: '#2A344D',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#6C6E76',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    paddingVertical: 8,
    borderRadius: 7,
    borderColor: COLORS.bg2,
  },
  cancelText: {
    fontSize: 15,
    color: COLORS.black,
    textAlign: 'center',
  },
  logoutBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 7,
    backgroundColor: COLORS.bg2,
  },
  logoutText: {
    fontSize: 15,
    color: 'white',
    textAlign: 'center',
  },
});
