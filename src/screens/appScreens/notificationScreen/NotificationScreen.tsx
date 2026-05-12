import React from 'react';
import {
    Image,

    StyleSheet,
    Text,
    View,
    Dimensions,
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { ICONS } from '../../../theme/icons';
import { FONTS } from '../../../theme/fonts';
import { COLORS } from '../../../theme/colors';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import { ScreenWrapper } from '../../../components/wrapper';
import { BOLD_TEXT, REGULAR_TEXT } from '../../../theme/styles.global';

const { width } = Dimensions.get('window');

type Notification = {
    id: number;
    text: string;
    description: string;
};

type CategorizedNotifications = {
    today: Notification[];
    yesterday: Notification[];
    older: {
        [date: string]: Notification[];
    };
};

const dummyNotifications: CategorizedNotifications = {
    today: [
        { id: 1, text: 'Your payment was successful.', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
        { id: 2, text: 'New updates are available.', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
    ],
    yesterday: [
        { id: 3, text: 'You earned reward points!', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
    ],
    older: {
        '04/10/2025': [
            { id: 4, text: 'Welcome to the app!', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
            { id: 5, text: 'Your account was verified.', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
            { id: 6, text: 'You earned reward points!', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
            { id: 7, text: 'New updates are available.', description: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum.' },
        ],
    },
};

const NotificationScreen: React.FC = () => {
    return (
        <ScreenWrapper headerComponent={<HeaderNavigation label="Notifications" />} >
            {dummyNotifications.today.length > 0 && (
                <View style={styles.notificationSection}>
                    <Text style={styles.sectionTitle}>Today:</Text>
                    {dummyNotifications.today.map((notification) => (
                        <View key={notification.id} style={styles.notificationItem}>
                            <Image
                                source={ICONS.bell2}
                                style={styles.bellIcon}
                            />
                            <View style={{ width: '70%' }}>
                                <Text style={[BOLD_TEXT(14, COLORS.black)]}>{notification.text}</Text>
                                <Text style={[REGULAR_TEXT(12, COLORS.gray)]}>{notification.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {dummyNotifications.yesterday.length > 0 && (
                <View style={styles.notificationSection}>
                    <Text style={styles.sectionTitle}>Yesterday:</Text>
                    {dummyNotifications.yesterday.map((notification) => (
                        <View key={notification.id} style={styles.notificationItem}>
                            <Image
                                source={ICONS.bell2}
                                style={styles.bellIcon}
                            />
                            <View style={{ width: '70%' }}>
                                <Text style={[BOLD_TEXT(14, COLORS.black)]}>{notification.text}</Text>
                                <Text style={[REGULAR_TEXT(12, COLORS.gray)]}>{notification.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {Object.keys(dummyNotifications.older).map((date) => (
                <View key={date} style={styles.notificationSection}>
                    <Text style={styles.sectionTitle}>{date}:</Text>
                    {dummyNotifications.older[date].map((notification) => (
                        <View key={notification.id} style={styles.notificationItem}>
                            <Image
                                source={ICONS.bell2}
                                style={styles.bellIcon}
                            />
                            <View style={{ width: '70%' }}>
                                <Text style={[BOLD_TEXT(14, COLORS.black)]}>{notification.text}</Text>
                                <Text style={[REGULAR_TEXT(12, COLORS.gray)]}>{notification.description}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            ))}

        </ScreenWrapper>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.mainBg,
    },
    topView: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: width * 0.03,
        marginHorizontal: width * 0.05,
        marginBottom: 20
    },
    topViewImage: {
        width: width * 0.1 + 3,
        height: width * 0.1 + 3,
    },
    notificationSection: {
        marginVertical: width * 0.03,
        marginHorizontal: width * 0.05,
    },
    sectionTitle: {
        fontSize: scale(14),
        fontFamily: FONTS.BOLD,
        marginBottom: width * 0.02,
        color: COLORS.gray,
    },
    notificationContainer: {
        backgroundColor: '#fff',
        padding: width * 0.03,
        borderRadius: 8,
        // backgroundColor: colors.tintColor,
        elevation: 5,
        marginBottom: 15,
        borderColor: '#4FBAED',
        borderWidth: 0.5,
        shadowColor: '#4FBAED',
        shadowRadius: 9
    },
    notificationText: {
        width: '70%',
        paddingVertical: width * 0.02,
        fontSize: scale(12),
    },
    bellIcon: {
        width: '18%',
        height: 80,
        objectFit: 'contain',
        paddingRight: 10
    },
    notificationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        // color: colors.textColor11,
        backgroundColor: COLORS.white,
        borderColor: '#E1EBFF',
        borderWidth: 1,
        borderRadius: 20,
        padding: 10,
        marginBottom: 10
    },
    notificationDescription: {
        width: '70%',
        fontSize: scale(12),
        fontFamily: FONTS.REGULAR,
        color: COLORS.gray,
    }
});