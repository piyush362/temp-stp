import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { RootNavigationContainer } from './src/navigation/rootNavigationContainer';
import { PaperProvider } from 'react-native-paper';
import { connectSocket } from './src/socket/socketService';
import EnvFlag from './src/components/flags/EnvFlag';
import ForceUpdateGate from './src/components/ForceUpdateGate';

function App(): React.JSX.Element {
  useEffect(() => {
    connectSocket();
  }, []);

  return (
    <Provider store={store}>
      <PaperProvider>
        <SafeAreaProvider>
          <ForceUpdateGate>
            <RootNavigationContainer />
            <EnvFlag position="right" />
          </ForceUpdateGate>
        </SafeAreaProvider>
      </PaperProvider>
    </Provider>
  );
}

export default App;
