import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import CustomGradientButton from '../buttons/CustomGradientButton';

export default function ReferralAnnouncementCard() {

  const navigation = useNavigation();
  const handleReferPress = () => {
    // console.log('Refer button pressed');
    navigation.navigate('ReferralScreen' as never);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Heading */}
        <Text style={styles.heading}>Refer Your Friend 🎉</Text>

        {/* Subtext */}
        <Text style={styles.subText}>
          Invite friends to <Text style={{fontWeight: 'bold'}}>Stapples</Text> &
          get exciting rewards!
        </Text>

        {/* Gradient Text (looks like a button) */}
        {/* <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleReferPress}
          style={{marginTop: 12}}>
          <LinearGradient
            colors={['#00C6FF', '#7D2AE8']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.textButtonWrapper}>
            <Text style={styles.textButton}>Refer Now</Text>
          </LinearGradient>
        </TouchableOpacity> */}
        <CustomGradientButton
          title="Refer Now"
          onPress={handleReferPress}
          outerContainerStyle={{marginTop: 10}}
          innerContainerStyle={{
            paddingHorizontal: 20,
            paddingVertical: 5,
          }}
          labelStyle={{
            padding: 0,
            fontSize: 12,
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    borderWidth: 1,
    borderColor: '#d1d5db', // gray-300
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  heading: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937', // gray-800
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#4b5563', // gray-600
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
  },
  textButtonWrapper: {
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  textButton: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
