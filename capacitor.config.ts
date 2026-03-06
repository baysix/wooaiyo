import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wooaiyo.app',
  appName: '우아이요',
  webDir: 'out',
  server: {
    url: 'https://wooaiyo.vercel.app',
    cleartext: false,
    allowNavigation: ['wooaiyo.vercel.app'],
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: true, // TODO: 프로덕션에서 제거
  },
};

export default config;
