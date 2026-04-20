import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const role = user?.role;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (isAuthenticated) {
      if (role === 'Customer') {
        router.replace('/customer/HomeCust');
      } else if (role === 'Vendor') {
        router.replace('/vendor/HomeVen');
      } else if (role === 'Admin') {
        router.replace('/admin/AdminApproval');
      } else {
        router.replace('/auth/Login');
      }
    } else {
      router.replace('/auth/Login');
    }
  }, [isAuthenticated, role, isReady]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
      <ActivityIndicator size="large" color="#800C1F" />
    </View>
  );
}
