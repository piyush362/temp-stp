import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Linking,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
// @ts-ignore
import VersionCheck from 'react-native-version-check';

const ForceUpdateGate = ({ children }: any) => {
    const [forceUpdate, setForceUpdate] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            checkVersion();
        }, 1000); // 1 sec after app loads

        return () => clearTimeout(timer);
    }, []);

    const checkVersion = async () => {
        try {
            console.log('Checking version...');

            const currentVersion = DeviceInfo.getVersion();
            console.log('Current Version:', currentVersion);

            const res = await VersionCheck.needUpdate();
            console.log('VersionCheck result:', res);

            if (res?.isNeeded) {
                setForceUpdate(true);
            }

        } catch (e) {
            console.log('Version check failed', e);
            setForceUpdate(false);
        } 
    };

    return (
        <>
            {children}

            <Modal visible={forceUpdate} transparent animationType="fade" onRequestClose={() => {}} >
                <View style={styles.overlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.title}>Update Required</Text>

                        <Text style={styles.desc}>
                            A new version of the app is available. Please update to continue.
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={async () => {
                                const url = await VersionCheck.getStoreUrl();
                                Linking.openURL(url);
                            }}
                        >
                            <Text style={styles.buttonText}>Update Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default ForceUpdateGate;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },

    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
    },

    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: "2%"
    },
    desc: {
        marginTop: '5%',
        textAlign: 'center',
        color: '#000'
    },
    button: {
        marginTop: 20,
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
