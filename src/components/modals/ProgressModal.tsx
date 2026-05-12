import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {Text, Portal, Button} from 'react-native-paper';
import {BOLD_TEXT, REGULAR_TEXT} from '../../theme/styles.global';
import CustomGradientButton from '../buttons/CustomGradientButton';

interface ProgressModalProps {
  visible: boolean;
  progress?: number;
  onCancel?: () => void;
  onComplete?: () => void;
}

interface CustomProgressBarProps {
  progress: number;
}

const CustomProgressBar: React.FC<CustomProgressBarProps> = ({progress}) => {
  const width = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: progress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const animatedWidth = width.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.customProgressBarBackground}>
      <Animated.View
        style={[styles.customProgressBarFill, {width: animatedWidth}]}
      />
    </View>
  );
};

const ProgressModal: React.FC<ProgressModalProps> = ({
  visible,
  progress,
  onCancel,
  onComplete,
}) => {
  // const [progress, setProgress] = useState<number>(0);

  return (
    // <Portal>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <Text style={styles.status}>In Progress</Text>
            <CustomProgressBar progress={progress ?? 0} />
            {/* <ActivityIndicator size="large" color="black" /> */}
            <Text style={styles.percentText}>
              {Math.round(progress ?? 0)}% Completed
            </Text>
            <Text
              style={[
                REGULAR_TEXT(15, 'rgba(53, 47, 78, 1)'),
                {marginVertical: 15, textAlign: 'center'},
              ]}>
              We Delete Your Uploaded files in 24hrs
            </Text>
            <CustomGradientButton
              onPress={() => (onCancel ? onCancel() : {})}
              title="Cancel"
              outerContainerStyle={{
                width: '50%',
              }}
              innerContainerStyle={{
                backgroundColor: 'white',
              }}
              labelStyle={{fontSize: 12, color: 'black', fontWeight: '700'}}
            />
          </View>
        </View>
      </Modal>
    // </Portal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    elevation: 10,
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1c1c1c',
    marginBottom: 20,
  },
  customProgressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 20,
  },
  customProgressBarFill: {
    height: '100%',
    backgroundColor: '#6a11cb',
  },
  percentText: {
    fontSize: 16,
    color: '#666',
  },
});

export default ProgressModal;
