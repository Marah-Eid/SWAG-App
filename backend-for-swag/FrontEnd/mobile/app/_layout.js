import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Stack } from 'expo-router';
import { Provider, useDispatch, useSelector } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';

import store from '../src/store';
import CreativeSplashScreen from '../src/components/CreativeSplashScreen';
import { checkAuthStatus } from '../src/store/slices/authSlice';
import chatsAPI from '../src/api/chatsAPI';

SplashScreen.preventAutoHideAsync();

// Inner component that has access to Redux store
function AppContent({ onSplashFinish }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    dispatch(checkAuthStatus());
  }, [dispatch]);

  // Send heartbeat whenever app becomes active (foreground)
  useEffect(() => {
    if (!isAuthenticated) return;

    // Send immediately on mount
    chatsAPI.heartbeat();

    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        chatsAPI.heartbeat();
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, [isAuthenticated]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="auth/Login" />
      <Stack.Screen name="auth/SignUp" />
      <Stack.Screen name="auth/SignUpVendor" />
      <Stack.Screen name="auth/forgot-password" />
      <Stack.Screen name="auth/verify_Code" />
      <Stack.Screen name="auth/SetPassword" />
      <Stack.Screen name="auth/verify-signup" />
      <Stack.Screen name="auth/verifyVendorEmail" />
      <Stack.Screen name="auth/LocationVendor" />
      <Stack.Screen name="auth/VendorCertification" />
    </Stack>
  );
}

export default function RootLayout() {
  const [isAppReady, setIsAppReady] = useState(false);
  const [animationFinished, setAnimationFinished] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setIsAppReady(true);
      }
    }
    prepare();
  }, []);

  const onSplashFinish = async () => {
    setAnimationFinished(true);
    await SplashScreen.hideAsync();
  };

  if (!isAppReady || !animationFinished) {
    return (
      <CreativeSplashScreen onFinish={onSplashFinish} />
    );
  }

  return (
    <Provider store={store}>
      <AppContent onSplashFinish={onSplashFinish} />
    </Provider>
  );
}
