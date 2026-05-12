import { useNavigation } from '@react-navigation/native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import { COLORS } from '../../theme/colors';
import { AppText as Text } from '../inputs/AppTextComponent';
import { FONTS } from '../../theme/fonts';
import { ICONS } from '../../theme/icons';
interface Props {
  labelColor?: string;
  label?: string;
  disableBack?: boolean;
  rightComponent?: React.ReactNode;
}

export const HeaderNavigation = (props: Props) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {!props?.disableBack ? (
        <TouchableOpacity
          style={styles.backIconContainer}
          onPress={() => navigation.goBack()}
        >
          <Image style={styles.backIcon} source={ICONS.backArrow1} />
        </TouchableOpacity>
      ) : (
        <View style={styles.backIconPlaceholder} />
      )}
      {props.label && (
        <Text style={[styles.headingText, { color: props.labelColor ?? COLORS.black }]}>
          {props.label}
        </Text>
      )}
      <View style={styles.backIconContainer}>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    // paddingTop: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  backIconContainer: {
    padding: 10,
    paddingVertical: 20,
    paddingRight: 30,
    width: '15%',
  },
  backIcon: {
    width: scale(20),
    height: scale(20),
  },
  backIconPlaceholder: {
    width: '15%',
  },
  headingText: {
    fontSize: scale(18),
    fontFamily: FONTS.BOLD,
  },
  rightComponentContainer: {
    width: '20%',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
});

export default HeaderNavigation;