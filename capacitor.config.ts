import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.campuscanteen.rewards',
  appName: 'Campus Canteen Rewards',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['campuscanteen://auth/callback'],
  },
};

export default config;
