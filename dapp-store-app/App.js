import { getRandomValues as expoCryptoGetRandomValues } from 'expo-crypto';
import { Buffer } from 'buffer';

global.Buffer = Buffer;

class Crypto {
  getRandomValues = expoCryptoGetRandomValues;
}

const webCrypto = typeof crypto !== 'undefined' ? crypto : new Crypto();

(() => {
  if (typeof crypto === 'undefined') {
    Object.defineProperty(global, 'crypto', {
      configurable: true,
      enumerable: true,
      get: () => webCrypto,
    });
  }
})();

import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, Dimensions, Platform, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect } from 'react';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

const { width: W, height: H } = Dimensions.get('window');

// Set to true to verify WebView can render at all (shows "WebView OK" page).
const TEST_WEBVIEW_WITH_HTML = false;

const PWA_URL = 'https://snake-web-phi.vercel.app/';

const APP_IDENTITY = {
  name: 'Snake - Solana',
  uri: 'https://snake-web-phi.vercel.app',
  icon: 'icons/icon.svg',
};

export default function App() {
  const webViewRef = useRef(null);

  // Force-hide splash after 2s so we never stay stuck on black splash
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        SplashScreen.hideAsync().catch(() => {});
      } catch (_) {}
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const connectMWA = async () => {
    try {
      const result = await transact(async (wallet) => {
        const authResult = await wallet.authorize({
          cluster: 'solana:devnet',
          identity: APP_IDENTITY,
        });
        return authResult;
      });

      const address = result.accounts[0].address;
      const script = `
        (function() {
          if (window.__snakeWalletAdapter) {
            window.__snakeWalletAdapter.connectedAccount = { address: '${address}' };
            window.__snakeWalletAdapter.connectedWallet = { name: 'Mobile Wallet Adapter' };
            window.__snakeWalletAdapter.ready = true;
            window.dispatchEvent(new CustomEvent('snakeMWAConnected', { detail: { address: '${address}' } }));
          }
        })();
      `;
      webViewRef.current?.injectJavaScript(script);
      return address;
    } catch (error) {
      console.error('[Expo] MWA connect error:', error);
      const errorScript = `
        window.dispatchEvent(new CustomEvent('snakeMWAError', { detail: { error: '${error.message}' } }));
      `;
      webViewRef.current?.injectJavaScript(errorScript);
      throw error;
    }
  };

  const injectedJavaScript = `
    (function() {
      if (!window.__snakeWalletAdapter) {
        window.__snakeWalletAdapter = {
          ready: false,
          connectedWallet: null,
          connectedAccount: null,
          connect: null,
          disconnect: null,
        };
      }

      window.__SNAKE_IN_APP = true;
      document.addEventListener('keydown', function(e) {
        if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].indexOf(e.key) !== -1) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }, true);

      window.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'snakeMWAConnect') {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'connect' }));
        }
      });

      window.__snakeWalletAdapter.connect = function() {
        return new Promise((resolve, reject) => {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'connect' }));
          const handleConnected = (event) => {
            if (event.detail && event.detail.address) {
              window.removeEventListener('snakeMWAConnected', handleConnected);
              window.removeEventListener('snakeMWAError', handleError);
              resolve(event.detail.address);
            }
          };
          const handleError = (event) => {
            window.removeEventListener('snakeMWAConnected', handleConnected);
            window.removeEventListener('snakeMWAError', handleError);
            reject(new Error(event.detail.error));
          };
          window.addEventListener('snakeMWAConnected', handleConnected);
          window.addEventListener('snakeMWAError', handleError);
        });
      };

      window.__snakeWalletAdapter.ready = true;
      console.log('[MWA Bridge] Adapter ready');
    })();
    true;
  `;

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'connect') {
        connectMWA().catch(console.error);
      }
    } catch (error) {
      console.error('[Expo] Message error:', error);
    }
  };

  const webViewSource = TEST_WEBVIEW_WITH_HTML
    ? { html: '<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"/></head><body style="margin:0;background:#1a1a2e;color:#eee;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;font-size:24px">WebView OK</body></html>' }
    : {
        uri: PWA_URL,
        headers: Platform.OS === 'android' ? { 'Cache-Control': 'no-cache' } : undefined,
      };

  const injectedJavaScriptBeforeContentLoaded = TEST_WEBVIEW_WITH_HTML ? '' : 'window.__SNAKE_IN_APP=true;';

  const onRootLayout = () => {
    try {
      SplashScreen.hideAsync().catch(() => {});
    } catch (_) {}
  };

  const content = (
    <View style={[styles.container, { width: W, height: H }]} onLayout={onRootLayout}>
      <StatusBar style="light" />
      <WebView
        ref={webViewRef}
        source={webViewSource}
        style={[styles.webview, { width: W, height: H }]}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        cacheEnabled={false}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        injectedJavaScript={TEST_WEBVIEW_WITH_HTML ? '' : injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
        onMessage={handleMessage}
        setSupportMultipleWindows={false}
        scrollEnabled={true}
        overScrollMode="never"
        nestedScrollEnabled={true}
        androidLayerType="hardware"
      />
    </View>
  );

  // Render inside Modal so content may show when main window stays black (no reinstall)
  return (
    <Modal visible={true} transparent={false} statusBarTranslucent>
      {content}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webview: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    opacity: 1,
  },
});
