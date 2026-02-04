import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

// Your deployed PWA URL
const PWA_URL = 'https://snake-web-phi.vercel.app/';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        source={{ uri: PWA_URL }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  webview: {
    flex: 1,
    backgroundColor: '#000',
  },
});
