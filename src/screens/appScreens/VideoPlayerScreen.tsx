// VideoPlayerScreen.tsx
import {useRoute} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, View} from 'react-native';
import Video from 'react-native-video';

export default function VideoPlayerScreen() {
  const route = useRoute();
  const {videoUrl} = route.params as {videoUrl: string};

  return (
    <View style={styles.container}>
      <Video
        source={{uri: videoUrl}}
        style={styles.video}
        resizeMode="contain"
        controls
        fullscreen
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
