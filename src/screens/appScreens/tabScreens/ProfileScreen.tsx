import {StyleSheet, Text, View} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../../../redux/store';

export default function ProfileScreen() {
  const {userData} = useSelector((state: RootState) => state.auth);
  return (
    <View>
      <Text>ProfileScreen</Text>
    </View>
  );
}

const styles = StyleSheet.create({});
