import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { RootNavigationContainer } from './src/navigation/rootNavigationContainer';
import { PaperProvider } from 'react-native-paper';
import { connectSocket } from './src/socket/socketService';
import EnvFlag from './src/components/flags/EnvFlag';
import { BASEURL } from './app.env';
import DeviceInfo from 'react-native-device-info';
import VersionCheck from 'react-native-version-check';
import AppUpdateModal from './src/components/modals/AppUpdateModal';

function App(): React.JSX.Element {
  const [isAppUpdateModalVisible, setAppUpdateModalVisible] = useState(false);

  const checkForUpdate = async () => {
    if (!BASEURL.includes('prod')) {
      return;
    }
    try {
      console.log('Checking version...');
      const currentVersion = DeviceInfo.getVersion();
      console.log('Current Version:', currentVersion);

      const res = await VersionCheck.needUpdate();
      console.log('VersionCheck result:', res);

      if (res?.isNeeded) {
        setTimeout(() => {
          setAppUpdateModalVisible(true);
        }, 5000);
      }
    } catch (e) {
      console.log('Version check failed', e);
      setAppUpdateModalVisible(false);
    }
  };

  useEffect(() => {
    checkForUpdate();
  }, []);

  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <RootNavigationContainer />
          <AppUpdateModal
            visible={isAppUpdateModalVisible}
            setVisible={setAppUpdateModalVisible}
            onUpdate={() => {
              setAppUpdateModalVisible(false);
            }}
          />
          <EnvFlag position="right" />
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}

export default App;
