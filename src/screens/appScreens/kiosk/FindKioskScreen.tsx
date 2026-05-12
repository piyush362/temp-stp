/* eslint-disable react-native/no-inline-styles */
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {COLORS} from '../../../theme/colors';
import {ICONS} from '../../../theme/icons';
import {BOLD_TEXT, REGULAR_TEXT} from '../../../theme/styles.global';
import {SafeAreaView} from 'react-native-safe-area-context';
import {ScreenWrapper} from '../../../components/wrapper';
import HeaderNavigation from '../../../components/header/HeaderNavigation1';
import {Searchbar} from 'react-native-paper';
import CustomGradientButton from '../../../components/buttons/CustomGradientButton';
import Geolocation from '@react-native-community/geolocation';
import {getNearestKioskService} from '../../../service/authService';
import {
  JSONOBJECTLOG,
  metersToKilometers,
  openInGoogleMaps,
} from '../../../utils/utils';
import {useNavigation} from '@react-navigation/native';

export interface Kiosk {
  kiosk_id: number;
  kiosk_vendor_id: number;
  kiosk_name: string;
  kiosk_latitude: number;
  kiosk_longitude: number;
  kiosk_address: string;
  distance_in_meters: number;
}
export default function FindKioskScreen() {
  const [kioskList, setKioskList] = useState<Kiosk[]>([]);
  const [filteredKioskList, setFilteredKioskList] = useState<Kiosk[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation();

  const getNearestKiosk = async (info: any) => {
    const payload = {
      latitude: info.coords.latitude,
      longitude: info.coords.longitude,
      distance_in_meters: 1000000, // 100 km == 1000000 meters
    };
    const _payload = {
      latitude: 22.649202,
      longitude: 88.434618,
      distance_in_meters: 15000,
    };
    try {
      setIsLoading(true);
      const response = await getNearestKioskService(payload);
      const data = response?.data?.data ?? [];
      JSONOBJECTLOG(data);
      setKioskList(data);
      setFilteredKioskList(data);
    } catch (error) {
      JSONOBJECTLOG(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    Geolocation.getCurrentPosition(info => getNearestKiosk(info));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredKioskList(kioskList);
    } else {
      // const filtered = kioskList.filter(kiosk =>
      //   kiosk.kiosk_name.toLowerCase().includes(searchQuery.toLowerCase()),
      // );
      const filtered = kioskList.filter(kiosk => {
        return (
          kiosk.kiosk_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          kiosk.kiosk_address.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredKioskList(filtered);
    }
  }, [searchQuery, kioskList]);

  const renderSearchBar = () => {
    return (
      <Searchbar
        placeholder="Search"
        onChangeText={text => setSearchQuery(text)}
        value={searchQuery}
        style={styles.searchBar}
      />
    );
  };

  const renderNearbyKiosks = () => {
    return (
      <View style={styles.kioskContainer}>
        <View style={styles.kioskHeader}>
          <Text style={BOLD_TEXT(16)}>Nearby Kiosks</Text>
        </View>

        {isLoading && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
            }}>
            <ActivityIndicator color={'gray'} size={'small'} />
          </View>
        )}

        {!isLoading && filteredKioskList?.length === 0 && (
          <View
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 100,
            }}>
            <Text style={[REGULAR_TEXT(14, COLORS.gray)]}>
              No nearby kiosks found.
            </Text>
          </View>
        )}

        {filteredKioskList &&
          Array.isArray(filteredKioskList) &&
          filteredKioskList?.slice(0, 10)?.map(kiosk => (
            <View key={kiosk.kiosk_id} style={styles.kioskItem}>
              <View style={styles.kioskIcon}>
                <Image
                  source={ICONS.kiosk}
                  style={{width: 50, height: 50, objectFit: 'contain'}}
                />
              </View>
              <View style={{flex: 1}}>
                <Text style={[REGULAR_TEXT(14), {flex: 1}]}>
                  {kiosk?.kiosk_name ?? 'Kiosk'}
                </Text>
                <Text style={[REGULAR_TEXT(11, COLORS.gray), {flex: 1}]}>
                  {kiosk.kiosk_address}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image
                    source={ICONS.pin}
                    style={{
                      width: 16,
                      height: 16,
                      objectFit: 'contain',
                      tintColor: COLORS.bg2,
                    }}
                  />
                  <Text
                    style={[REGULAR_TEXT(12, COLORS.gray), {marginLeft: 5}]}>
                    {metersToKilometers(kiosk?.distance_in_meters ?? 0)}
                  </Text>
                </View>
              </View>
              <CustomGradientButton
                onPress={() => {
                  // navigation.navigate({
                  //   name: 'MapWebViewComponent',
                  //   params: {
                  //     url: 'https://www.google.co.in/maps/place/Tiwari+machinary+and+hardware+store+(EICHER+tractor+agency)/@27.1530661,81.9532225,17z/data=!4m6!3m5!1s0x3999ef91f3b9c289:0x4c4cfdceac6bf604!8m2!3d27.1535041!4d81.9553962!16s%2Fg%2F11p5cpvr9y?entry=ttu&g_ep=EgoyMDI1MDUyMS4wIKXMDSoASAFQAw%3D%3D',
                  //     headerLabel: 'Kiosk Location',
                  //   },
                  // } as never);
                  openInGoogleMaps({
                    latitude: kiosk?.kiosk_latitude,
                    longitude: kiosk?.kiosk_longitude,
                  });
                }}
                title="View on map"
                outerContainerStyle={{
                  width: 'auto',
                }}
                innerContainerStyle={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  backgroundColor: 'white',
                }}
                labelStyle={{
                  fontSize: 12,
                  color: 'black',
                  fontWeight: 'normal',
                }}
              />
            </View>
          ))}
      </View>
    );
  };

  return (
    <ScreenWrapper
      headerComponent={<HeaderNavigation label="Find Kiosks" />}
      disableScroll={true}>
      <View style={styles.container}>
        {renderSearchBar()}
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}>
          {renderNearbyKiosks()}
          <View style={{height: 10}} />
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 15,
  },
  scrollContainer: {},
  kioskContainer: {
    marginBottom: 20,
  },
  kioskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  kioskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 14,
    padding: 12,
    boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.10)',
  },
  kioskIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mapButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  searchBar: {
    marginBottom: 10,
    backgroundColor: COLORS.white,
  },
});
