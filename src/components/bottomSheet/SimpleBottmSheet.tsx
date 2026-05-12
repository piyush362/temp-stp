/* eslint-disable react-native/no-inline-styles */
import React, {useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';

export default function SimpleBottomSheet() {
  const sheetRef = useRef<any>(null);

  const openSheet = () => {
    sheetRef.current?.open();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.openButton} onPress={openSheet}>
        <Text style={styles.buttonText}>Open Bottom Sheet</Text>
      </TouchableOpacity>

      <RBSheet
        ref={sheetRef}
        height={200}
        closeOnPressMask
        customStyles={{
          container: {
            padding: 20,
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          },
        }}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetText}>Hello from the bottom sheet!</Text>
        </View>
      </RBSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  openButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  sheetContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetText: {
    fontSize: 18,
    color: '#333',
  },
});
