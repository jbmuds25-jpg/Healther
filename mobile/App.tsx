/**
 * Healther AI Mobile App
 * 
 * Main React Native app component
 * Uses the unified HealtherAIClient SDK for AI integration
 * Supports offline functionality with automatic sync
 */

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import ReactNativeBiometrics from 'react-native-biometrics';

// Keep splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// Configure notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

import Navigation from './src/navigation';
import { AuthContext, type AuthContextType } from './src/context/AuthContext';
import { AIContext, type AIContextType } from './src/context/AIContext';
import HealtherAIClient from './src/utils/healtherAIClient';

interface AppState {
    isLoading: boolean;
    isSignout: boolean;
    userToken: string | null;
    userId: string | null;
}

export default function App() {
    const [state, dispatch] = React.useReducer(
        (prevState: AppState, action: any) => {
            switch (action.type) {
                case 'RESTORE_TOKEN':
                    return {
                        ...prevState,
                        userToken: action.token,
                        userId: action.userId,
                        isLoading: false,
                    };
                case 'SIGN_IN':
                    return {
                        ...prevState,
                        isSignout: false,
                        userToken: action.token,
                        userId: action.userId,
                    };
                case 'SIGN_OUT':
                    return {
                        ...prevState,
                        isSignout: true,
                        userToken: null,
                        userId: null,
                    };
                case 'SIGN_UP':
                    return {
                        ...prevState,
                        isSignout: false,
                        userToken: action.token,
                        userId: action.userId,
                    };
                default:
                    return prevState;
            }
        },
        {
            isLoading: true,
            isSignout: false,
            userToken: null,
            userId: null,
        }
    );

    const [appIsReady, setAppIsReady] = useState(false);
    const [aiClient, setAiClient] = useState<HealtherAIClient | null>(null);

    useEffect(() => {
        async function prepare() {
            try {
                // Load fonts
                await Font.loadAsync({
                    'Roboto': require('./assets/fonts/Roboto-Regular.ttf') as unknown as string,
                    'Roboto-Bold': require('./assets/fonts/Roboto-Bold.ttf') as unknown as string,
                    'Roboto-Light': require('./assets/fonts/Roboto-Light.ttf') as unknown as string,
                });

                // Restore token
                const token = await AsyncStorage.getItem('userToken');
                const userId = await AsyncStorage.getItem('userId');
                const userRole = await AsyncStorage.getItem('userRole');

                if (token && userId) {
                    // Initialize AI Client
                    const client = new HealtherAIClient({
                        apiEndpoint: 'https://api.healther.app/api/ai',
                        userId: userId,
                        userRole: userRole || 'citizen',
                        platform: 'mobile',
                        debug: __DEV__,
                        storage: AsyncStorage,
                        onMessageReceived: handleMessageReceived,
                        onError: handleAIError,
                        onConnectionChanged: handleConnectionChanged,
                    });

                    setAiClient(client);
                    dispatch({ type: 'RESTORE_TOKEN', token, userId });
                } else {
                    dispatch({ type: 'RESTORE_TOKEN', token: null, userId: null });
                }
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    // Register for push notifications
    useEffect(() => {
        if (!state.userToken) return;

        (async () => {
            try {
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;

                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }

                if (finalStatus !== 'granted') {
                    console.log('Failed to get push token for push notification!');
                    return;
                }

                const pushToken = (await Notifications.getExpoPushTokenAsync()).data;
                console.log('Expo push token:', pushToken);

                // Save to backend if needed
                // await apiClient.registerPushToken(pushToken);
            } catch (e) {
                console.error('Error getting push token:', e);
            }
        })();

        // Listen for notifications
        const subscription = Notifications.addNotificationResponseReceivedListener((response: any) => {
            console.log('Notification tapped:', response);
            // Handle notification tap
        });

        return () => subscription.remove();
    }, [state.userToken]);
    const handleMessageReceived = (response: any): void => {
        console.log('AI Message:', response);
        
        // Show notification if app is in background
        if (!__DEV__) {
            Notifications.scheduleNotificationAsync({
                content: {
                    title: 'Healther AI',
                    body: response.text,
                    sound: 'default',
                },
                trigger: { seconds: 2 },
            }).catch((err: any) => console.error('Notification error:', err));
        }
    };

    const handleAIError = (error: any): void => {
        console.error('AI Error:', error);
        Alert.alert('Error', (error as any)?.error || 'Something went wrong');
    };

    const handleConnectionChanged = (status: { connected: boolean }): void => {
        console.log('Connection status:', status.connected ? 'Online' : 'Offline');
    };

    const authContext = React.useMemo(
        () => ({
            signIn: async (username: string, password: string): Promise<void> => {
                try {
                    // API call to login
                    const response = await fetch('https://api.healther.app/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password }),
                    });

                    const data = await response.json();

                    if (data.token) {
                        await AsyncStorage.setItem('userToken', data.token);
                        await AsyncStorage.setItem('userId', String(data.user.id));
                        await AsyncStorage.setItem('userRole', data.user.role);

                        // Initialize AI Client
                        const client = new HealtherAIClient({
                            apiEndpoint: 'https://api.healther.app/api/ai',
                            userId: String(data.user.id),
                            userRole: data.user.role,
                            platform: 'mobile',
                            onMessageReceived: handleMessageReceived,
                            onError: handleAIError,
                        });
                        setAiClient(client);

                        dispatch({ type: 'SIGN_IN', token: data.token, userId: String(data.user.id) });
                    } else {
                        throw new Error(data.error || 'Login failed');
                    }
                } catch (error) {
                    Alert.alert('Login Error', (error as Error).message);
                }
            },

            signUp: async (fullName: string, username: string, email: string, password: string): Promise<void> => {
                try {
                    const response = await fetch('https://api.healther.app/api/auth/signup', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fullName, username, email, password }),
                    });

                    const data = await response.json();

                    if (data.token) {
                        await AsyncStorage.setItem('userToken', data.token);
                        await AsyncStorage.setItem('userId', String(data.user.id));
                        await AsyncStorage.setItem('userRole', data.user.role);

                        const client = new HealtherAIClient({
                            apiEndpoint: 'https://api.healther.app/api/ai',
                            userId: String(data.user.id),
                            userRole: data.user.role,
                            platform: 'mobile',
                            onMessageReceived: handleMessageReceived,
                            onError: handleAIError,
                        });
                        setAiClient(client);

                        dispatch({ type: 'SIGN_UP', token: data.token, userId: String(data.user.id) });
                    } else {
                        throw new Error(data.error || 'Sign up failed');
                    }
                } catch (error) {
                    Alert.alert('Sign Up Error', (error as Error).message);
                }
            },

            signOut: async (): Promise<void> => {
                await AsyncStorage.removeItem('userToken');
                await AsyncStorage.removeItem('userId');
                await AsyncStorage.removeItem('userRole');
                setAiClient(null);
                dispatch({ type: 'SIGN_OUT' });
            },

            signInWithBiometrics: async (): Promise<void> => {
                try {
                    const biometricAuth = new ReactNativeBiometrics();
                    const biometryCheck = await biometricAuth.isSensorAvailable();
                    if (!biometryCheck.available) {
                        Alert.alert('Biometrics', 'No biometric method is available');
                        return;
                    }

                    const result = await biometricAuth.simplePrompt({
                        promptMessage: 'Authenticate to open Healther',
                        fallbackPromptMessage: 'Use passcode',
                    });

                    if (result.success) {
                        const token = await AsyncStorage.getItem('userToken');
                        const userId = await AsyncStorage.getItem('userId');
                        if (token && userId) {
                            dispatch({ type: 'RESTORE_TOKEN', token, userId });
                        }
                    }
                } catch (error) {
                    console.error('Biometric auth error:', error);
                    Alert.alert('Error', 'Biometric authentication failed');
                }
            },
        } as AuthContextType),
        []
    );

    const aiContext = React.useMemo(
        () => ({
            client: aiClient,
            sendMessage: async (message: string): Promise<any> => {
                if (aiClient) {
                    return await aiClient.chat(message);
                }
                throw new Error('AI client not initialized');
            },
            getCapabilities: async (): Promise<any> => {
                if (aiClient) {
                    return await aiClient.getCapabilities();
                }
                throw new Error('AI client not initialized');
            },
        } as AIContextType),
        [aiClient]
    );

    if (!appIsReady) {
        return <ActivityIndicator size="large" />;
    }

    return (
        <AuthContext.Provider value={authContext}>
            <AIContext.Provider value={aiContext}>
                <Navigation state={state} />
            </AIContext.Provider>
        </AuthContext.Provider>
    );
}
