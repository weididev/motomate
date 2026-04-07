import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.motomate.app',
  appName: 'MotoMate',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
