import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.condorcenter.app',
  appName: 'Condor Center',
  webDir: './dist/client',
  server: {
    url: 'http://localhost:5000',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#6200EE",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_notification",
      iconColor: "#6200EE",
    },
    Camera: {
      presentationStyle: 'fullscreen',
    },
  },
  android: {
    backgroundColor: "#FFFFFF"
  },
  ios: {
    backgroundColor: "#FFFFFF"
  }
};

export default config;