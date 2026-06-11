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
        .withUrl(HUB_URL, {
          accessTokenFactory: async () => {
            const t = await AsyncStorage.getItem('userToken');
            return t || '';
          },
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      // Give the server 90 s to send any message before declaring a timeout.
      // Must be > server KeepAliveInterval (10 s) so pings arrive in time.
      connection.serverTimeoutInMilliseconds = 90000;
      // Send a ping every 30 s to keep NAT/proxy connections alive.
      connection.keepAliveIntervalInMilliseconds = 30000;

      connection.on('ReceiveNotification', (notification) => {
        showToast({
          type: getToastType(notification.type),
          title: notification.title,
          message: notification.body,
        });
        dispatch(fetchNotifications());
      });

      connection.onclose(() => {});

      try {
        await connection.start();
        connectionRef.current = connection;
      } catch (err) {
        console.warn('SignalR connection failed:', err?.message);
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
