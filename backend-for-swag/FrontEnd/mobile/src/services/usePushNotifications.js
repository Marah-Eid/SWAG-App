import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import notificationsAPI from '../api/notificationsAPI';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#8A1C27',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  return tokenData.data;
}

export default function usePushNotifications() {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();
  const tokenRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    registerForPushNotifications().then((token) => {
      if (token) {
        tokenRef.current = token;
        notificationsAPI.registerPushToken(token);
      }
    }).catch(() => {});

    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        if (data?.deepLink) {
          if (data.deepLink.startsWith('vendor/')) {
            const vendorId = data.deepLink.split('/')[1];
            router.push({ pathname: '/customer/VendorProfCust', params: { vendorId } });
          }
        }
      });
    } catch (e) {
      console.log('Push listener not available (Expo Go)');
    }

    return () => {
      if (responseListener.current?.remove) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated]);
}
