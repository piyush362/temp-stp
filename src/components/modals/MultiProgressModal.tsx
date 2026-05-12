import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Text,
} from "react-native";
import CustomGradientButton from "../buttons/CustomGradientButton";
import { REGULAR_TEXT, BOLD_TEXT } from "../../theme/styles.global";

interface MultiProgressModalProps {
  visible: boolean;
  currentFile: number;
  totalFiles: number;
  progress: number;
  onCancel?: () => void;
}

export const MultiProgressModal: React.FC<MultiProgressModalProps> = ({
  visible,
  currentFile,
  totalFiles,
  progress,
  onCancel,
}) => {
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
    outputRange: ["0%", "100%"],
  });

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          {/* Heading */}
          <Text style={styles.status}>Uploading Files</Text>

          {/* X of Y */}
          <Text style={[REGULAR_TEXT(16, "#353F4E"), { marginBottom: 10 }]}>
            Uploading{" "}
            <Text style={BOLD_TEXT(16, "#000")}>{currentFile}</Text> of{" "}
            <Text style={BOLD_TEXT(16, "#000")}>{totalFiles}</Text>
          </Text>

          {/* Progress Bar */}
          <View style={styles.customProgressBarBackground}>
            <Animated.View
              style={[styles.customProgressBarFill, { width: animatedWidth }]}
            />
          </View>

          {/* Percentage */}
          <Text style={styles.percentText}>{Math.round(progress)}% Completed</Text>

          {/* Info */}
          <Text
            style={[
              REGULAR_TEXT(14, "rgba(53, 47, 78, 1)"),
              { marginVertical: 15, textAlign: "center" },
            ]}
          >
            We Delete Your Uploaded files in 24hrs
          </Text>

          {/* CANCEL BUTTON */}
          <CustomGradientButton
            onPress={onCancel ? onCancel : () => {}}
            title="Cancel All"
            outerContainerStyle={{
              width: "60%",
              alignSelf: "center",
            }}
            innerContainerStyle={{
              backgroundColor: "white",
            }}
            labelStyle={{ fontSize: 12, color: "black", fontWeight: "700" }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000066",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 10,
  },
  status: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1c1c1c",
    marginBottom: 15,
  },
  customProgressBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#e0e0e0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
  },
  customProgressBarFill: {
    height: "100%",
    backgroundColor: "#6a11cb",
  },
  percentText: {
    fontSize: 16,
    color: "#666",
  },
});
