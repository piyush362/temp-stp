import {StatusBar, StyleSheet, View} from 'react-native';
import React from 'react';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {COLORS} from '../../theme/colors';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

interface Props {
  children: any;
  statusBarColor?: string;
  headerComponent?: React.ReactNode;
  disableScroll?: boolean;
  backgroundColor?: string;
}

export function ScreenWrapper(props: Props) {
  const sameAreaInsert = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.mainContainer,
        {
          backgroundColor: props.backgroundColor
            ? props.backgroundColor
            : COLORS.mainBg,
        },
        {paddingTop: sameAreaInsert.top},
      ]}>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={props.statusBarColor || COLORS.mainBg}
      />
      {props.headerComponent && props.headerComponent}
      {!props.disableScroll ? (
        <KeyboardAwareScrollView
          style={styles.container}
          contentContainerStyle={{paddingBottom: 20}}
          extraScrollHeight={100}
          enableOnAndroid={true}
          keyboardOpeningTime={0}
          enableAutomaticScroll={true}
          keyboardShouldPersistTaps="handled">
          {props.children}
        </KeyboardAwareScrollView>
      ) : (
        <View style={[styles.container]}>{props.children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS.bg1,
  },
  container: {
    flexGrow: 1,
  },
});
