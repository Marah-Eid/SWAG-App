import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { BASE_URL } from '../api/client';
import { useToast } from '../components/common/ToastProvider';
import { getToastType } from '../components/common/ToastNotification';
import { fetchNotifications } from '../store/slices/notificationsSlice';

const HUB_URL = BASE_URL.replace('/api', '/hubs/notifications');

export default function useNotificationSocket() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const { showToast } = useToast();
  const connectionRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      connectionRef.current?.stop();
      connectionRef.current = null;
      return;
    }

    let cancelled = false;

    async function connect() {
      const token = await AsyncStorage.getItem('userToken');
      if (!token || cancelled) return;

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(HUB_URL, { accessTokenFactory: () => token })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Information)
        .build();

      connection.on('ReceiveNotification', (notification) => {
        showToast({
          type: getToastType(notification.type),
          title: notification.title,
          message: notification.body,
        });
        dispatch(fetchNotifications());
      });

      try {
        await connection.start();
        connectionRef.current = connection;
        console.log('SignalR connected');
      } catch (err) {
        console.warn('SignalR connection failed:', err.message);
      }
    }

    connect();

    return () => {
      cancelled = true;
      connectionRef.current?.stop();
      connectionRef.current = null;
    };
  }, [isAuthenticated]);
}
