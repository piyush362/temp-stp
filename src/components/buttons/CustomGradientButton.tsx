import { StyleSheet, Text, TouchableOpacity, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { primaryGradient } from '../../theme/colors';

type Props = {
    title: string;
    onPress: () => void;
    backgroundColor?: string;
    textColor?: string;
    outerContainerStyle?: ViewStyle;
    innerContainerStyle?: ViewStyle;
    gradientColors?: string[];
    labelStyle?: TextStyle;
    isLoading?: boolean;
    isDisabled?: boolean;
};

export default function CustomGradientButton({
    title,
    onPress,
    // backgroundColor,
    textColor = '#fff',
    outerContainerStyle,
    innerContainerStyle,
    labelStyle,
    gradientColors = primaryGradient,
    isLoading = false,
    isDisabled = false
}: Props) {
    return (
        <LinearGradient
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            colors={gradientColors} style={[styles.borderWrapper, outerContainerStyle]}>
            <TouchableOpacity
                onPress={onPress}
                disabled={isDisabled}
                activeOpacity={0.8}
                style={[
                    styles.innerButton,
                    innerContainerStyle,
                ]}
            >
                {isLoading && <ActivityIndicator size={'small'} color={textColor} />}
                <Text style={[styles.buttonText, { color: textColor }, labelStyle]}>{title}</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    borderWrapper: {
        borderRadius: 30,
        padding: 2,
    },
    innerButton: {
        borderRadius: 28,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10
    },
    buttonText: {
        fontWeight: 'bold',
        fontSize: 16,
    },
});
