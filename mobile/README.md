# Healther AI Mobile Application

A native iOS and Android application for Healther AI built with React Native and Expo. Provides a seamless mobile experience with offline support and push notifications.

## Features

- **Cross-Platform**: iOS and Android from a single codebase
- **Offline-First**: Full offline functionality with automatic sync
- **Push Notifications**: Real-time health alerts and messages
- **Biometric Authentication**: Fingerprint/Face recognition support
- **Health Integration**: Apple HealthKit and Google Fit integration
- **Secure**: Encrypted local storage, secure authentication
- **Intuitive UI**: Bottom tab navigation, gesture support
- **Performance**: Optimized for mobile devices

## Requirements

- Node.js 16+
- npm or yarn
- Expo CLI: `npm install -g eas-cli`
- Running Healther backend server
- iOS: Xcode (for iOS builds)
- Android: Android Studio (for Android builds)

## Quick Start

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure

Create `.env` file:
```
REACT_APP_API_URL=https://api.healther.app
REACT_APP_DEBUG=true
```

### 3. Run Development

**Using Expo Go (easiest):**
```bash
npm start
# Scan QR code with Expo Go app on your phone
```

**Build locally:**
```bash
# iOS
npm run ios

# Android
npm run android

# Web
npm run web
```

## Project Structure

```
mobile/
├── src/
│   ├── screens/          # Screen components
│   │   ├── AuthStack/    # Login, signup, auth
│   │   ├── HomeStack/    # Dashboard, home screens
│   │   ├── AIStack/      # AI chat interface
│   │   └── ProfileStack/ # User profile, settings
│   ├── components/       # Reusable components
│   │   ├── ChatBubble
│   │   ├── HealthCard
│   │   └── NotificationBanner
│   ├── navigation/       # Navigation configuration
│   ├── context/         # React context (Auth, AI)
│   ├── services/        # API services
│   ├── utils/          # Utilities
│   ├── styles/         # Shared styles
│   └── App.tsx         # Root component
├── assets/
│   ├── icons/
│   ├── images/
│   ├── fonts/
│   └── sounds/
├── app.json            # Expo configuration
├── package.json
├── tsconfig.json
└── README.md
```

## Building for Production

### iOS Distribution

1. **Set up Apple Developer Account**
   - Create App ID in Apple Developer Portal
   - Create provisioning profiles

2. **Build and Submit**
```bash
# First time setup
eas build --platform ios

# Subsequent builds
npm run build:ios

# Submit to App Store
npm run submit:ios
```

### Android Distribution

1. **Generate Upload Key**
```bash
eas credentials
# Follow prompts to generate keystore
```

2. **Build and Submit**
```bash
# First time setup
eas build --platform android

# Subsequent builds
npm run build:android

# Submit to Google Play
npm run submit:android
```

## Integration with HealtherAI SDK

The app uses the unified `HealtherAIClient` SDK:

```typescript
import HealtherAIClient from './utils/healtherAIClient';

// Initialize
const aiClient = new HealtherAIClient({
    apiEndpoint: 'https://api.healther.app/api/ai',
    userId: user.id,
    userRole: user.role,
    platform: 'mobile',
    offlineMode: true,
    autoSync: true
});

// Send message
const response = await aiClient.chat('I have a headache');

// Listen to events
aiClient.on('messageReceived', (msg) => {
    console.log('AI:', msg.text);
});

aiClient.on('connectionChanged', (status) => {
    console.log('Connected:', status.connected);
});
```

## Offline Functionality

The app automatically:
- **Caches conversations** in local storage
- **Queues messages** when offline
- **Syncs automatically** when connection returns
- **Works completely offline** for cached content

### Force Sync

```typescript
await aiClient.syncQueuedMessages();
```

### Clear Cache

```typescript
aiClient.clearConversation();
```

## Push Notifications

### Setup (iOS)

1. Create APNs certificate in Apple Developer Portal
2. Upload to Expo push notification setup
3. Test with:
```typescript
await Notifications.scheduleNotificationAsync({
    content: {
        title: 'Healther',
        body: 'Test notification'
    },
    trigger: { seconds: 1 }
});
```

### Setup (Android)

1. Link Firebase project to Expo
2. Gets automatic push token
3. Same code works for both platforms

## Biometric Authentication

Enable fingerprint/face recognition:

```typescript
import * as BiometricAuth from 'react-native-biometrics';

// Check availability
const biometryType = await BiometricAuth.biometricKeysExist();

// Authenticate
const result = await BiometricAuth.simplePrompt({
    promptMessage: 'Authenticate to open Healther',
    fallbackPromptMessage: 'Use passcode'
});

if (result.success) {
    // User authenticated
}
```

## Health Data Integration

### Apple HealthKit

```typescript
import AppleHealthKit from 'rn-apple-healthkit';

// Request permissions
AppleHealthKit.requestAuthorization(['HKWorkoutTypeIdentifier'], (err) => {});

// Get health data
AppleHealthKit.getLatestHeight({}, (err, result) => {
    console.log(result.value); // Height in cm
});
```

### Google Fit

```typescript
import GoogleFit from 'react-native-google-fit';

// Request permission
GoogleFit.startRecording({ startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }, () => {});

// Get steps
GoogleFit.getDailyStepCountSamples({}, (err, res) => {
    res.forEach((sample) => {
        console.log(sample.steps); // Steps for the day
    });
});
```

## Debugging

### Console Logs

```bash
# iOS
npm run ios -- --verbose

# Android
adb logcat
```

### React DevTools

```bash
expo install react-devtools
# In app component:
import { enableNestedNavigators } from 'react-navigation/native-stack';
```

### Network Requests

Add to root component:

```typescript
import axios from 'axios';

// Log all requests
axios.interceptors.request.use(config => {
    console.log('API Request:', config);
    return config;
});

axios.interceptors.response.use(response => {
    console.log('API Response:', response);
    return response;
});
```

## Performance Optimization

1. **Lazy Load Screens**: Use React.lazy() for screens
2. **Optimize Images**: Use appropriate sizes
3. **Cache API Responses**: Reduce redundant requests
4. **Minimize Bundle Size**: Use dynamic imports
5. **Memory Profiling**: Use Expo DevTools

## Troubleshooting

### App won't launch

```bash
# Clear cache
expo start -c

# Clear node_modules
rm -rf node_modules && npm install
```

### API connection issues

1. Check backend is running
2. Verify API endpoint in `.env`
3. Check network permissions in `app.json`

### Build failures

```bash
# Clean EAS build cache
eas build --platform ios --clear-cache
```

### Notification issues

1. Verify FCM setup (Android)
2. Check APNs certificate (iOS)
3. Ensure permissions are granted

## Testing

### Unit Tests

```bash
npm test
```

### End-to-End Tests

```bash
npm run e2e
```

### Device Testing

```bash
# Physical device
npm start
# Scan QR with Expo Go or native camera

# Emulator
npm run android
npm run ios
```

## Security

- ✓ Secure token storage
- ✓ HTTPS only
- ✓ Biometric auth
- ✓ Encrypted local storage
- ✓ Secure WebSocket for real-time
- ✓ No hardcoded secrets

## Performance Metrics

- **Startup Time**: < 3 seconds
- **First Interaction**: < 500ms
- **API Latency**: < 200ms (avg)
- **Battery Impact**: < 5% per hour of use
- **Memory Usage**: < 150MB

## Code Quality

```bash
# Lint
npm run lint

# Format
npm run format

# Type check
npx tsc --noEmit
```

## Deployment Checklist

- [ ] Update version in `app.json`
- [ ] Update `CHANGELOG.md`
- [ ] Build and test locally
- [ ] Test on physical device
- [ ] Clear console logs
- [ ] Verify no hardcoded secrets
- [ ] Run security audit: `npm audit`
- [ ] Build production bundle
- [ ] Submit to app stores

## Monitoring

Integrate error tracking:

```typescript
import * as Sentry from "sentry-expo";

Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    enableInExpoDevelopment: true,
    tracesSampleRate: 1.0,
});
```

## Support

For issues and feature requests:
- https://github.com/Healther/healther-ai
- support@healther.app

## License

MIT - See LICENSE file
