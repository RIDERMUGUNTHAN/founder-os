import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.founderos.app',
  appName: 'FounderOS',
  webDir: 'public',
  server: {
    // When connecting to the Windows desktop server locally:
    // cleartext allows connecting to http://<DESKTOP-IP>:4100
    cleartext: true,
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#09090b',
    },
    Camera: {
      presentationStyle: 'fullscreen',
    },
  },
};

export default config;
