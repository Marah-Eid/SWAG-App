import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  Animated,
  Dimensions,
  Platform,
  LayoutAnimation,
  UIManager,
  Linking,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');

const SideMenuV = ({ visible, onClose }) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-width)).current;

  const [isActivityExpanded, setIsActivityExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -width,
        duration: 250,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        setIsActivityExpanded(false);
        setIsHelpExpanded(false);
        setIsLoggingOut(false);
      }, 250);
    }
  }, [visible, slideAnim]);

  const toggleActivity = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsActivityExpanded(!isActivityExpanded);
    if (isHelpExpanded) setIsHelpExpanded(false);
  };

  const toggleHelp = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsHelpExpanded(!isHelpExpanded);
    if (isActivityExpanded) setIsActivityExpanded(false);
  };

  const handleLogoutPress = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        performLogout();
      }
    } else {
      Alert.alert(
        "Log Out",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes, Log Out",
            style: "destructive",
            onPress: performLogout
          }
        ]
      );
    }
  };

  const performLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      onClose();
      router.replace('/auth/Login');
    }, 1500);
  };

  const openLink = (url) => {
    onClose();
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const MenuItem = ({ icon, label, onPress, showChevron = true, isExpanded, isLogout = false }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Image
          source={icon}
          style={[styles.menuIcon, isLogout && { tintColor: '#8A1C27' }]}
          resizeMode="contain"
        />
      </View>
      <Text style={[styles.menuText, isLogout && { color: '#8A1C27', fontWeight: '700' }]}>{label}</Text>
      {showChevron && (
        <Ionicons
          name={isExpanded ? "chevron-down" : "chevron-forward"}
          size={16}
          color="#8391A1"
          style={{ marginLeft: 'auto' }}
        />
      )}
    </TouchableOpacity>
  );

  const SubMenuItem = ({ iconName, iconSource, label, onPress }) => (
    <TouchableOpacity style={styles.subMenuItem} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.subIconBadge}>
        {iconSource ? (
          <Image source={iconSource} style={styles.subImage} />
        ) : (
          <Ionicons name={iconName} size={16} color="#2D3E5E" />
        )}
      </View>
      <Text style={styles.subMenuText}>{label}</Text>
      <Ionicons name="arrow-forward" size={12} color="#A0B0C0" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );

  if (!visible) return null;

  return (
    <Modal transparent={true} visible={visible} onRequestClose={onClose} animationType="none">
      <View style={styles.overlay}>

        {isLoggingOut && (
          <View style={styles.fullScreenLoader}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Logging out...</Text>
          </View>
        )}

        <TouchableOpacity style={styles.touchableArea} onPress={isLoggingOut ? null : onClose} />

        <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <LinearGradient
            colors={['#FFFFFF', '#DDE5F0', '#BFCEDC']} // UI Polish: Matched App Backgrounds
            style={styles.gradient}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} disabled={isLoggingOut}>
                <Ionicons name="chevron-back" size={28} color="#2D3E5E" />
              </TouchableOpacity>
            </View>

            <View style={styles.menuList}>
              <MenuItem
                label="My Shop Profile"
                icon={require('../../../assets/images/profMenu-icon.png')}
                onPress={() => { onClose(); router.push('/vendor/ProfileVen'); }}
              />

              <MenuItem
                label="Activity"
                icon={require('../../../assets/images/activity-icon.png')}
                onPress={toggleActivity}
                isExpanded={isActivityExpanded}
              />
              {isActivityExpanded && (
                <View style={styles.subMenuContainer}>
                  <View style={styles.connectorLine} />
                  <View style={{ flex: 1 }}>
                    <SubMenuItem
                      label="Likes"
                      iconName="heart-outline"
                      onPress={() => { onClose(); router.push('/commonScreensV/LikesV'); }}
                    />
                    <SubMenuItem
                      label="Comments"
                      iconName="chatbubble-outline"
                      onPress={() => { onClose(); router.push('/commonScreensV/CommentsV'); }}
                    />
                  </View>
                </View>
              )}

              <MenuItem
                label="Saved Posts"
                icon={require('../../../assets/images/saved-icon.png')}
                onPress={() => { onClose(); router.push('/commonScreensV/SavedPostsV'); }}
              />

              <MenuItem
                label="Settings"
                icon={require('../../../assets/images/settings-png.png')}
                onPress={() => { onClose(); router.push('/commonScreensV/SettingsV'); }}
              />

              <MenuItem
                label="Help & Support"
                icon={require('../../../assets/images/help-icon.png')}
                onPress={toggleHelp}
                isExpanded={isHelpExpanded}
              />
              {isHelpExpanded && (
                <View style={styles.subMenuContainer}>
                  <View style={styles.connectorLine} />
                  <View style={{ flex: 1 }}>
                    <SubMenuItem
                      label="Instagram"
                      iconSource={require('../../../assets/images/insta-icon.png')}
                      onPress={() => openLink('https://instagram.com')}
                    />
                    <SubMenuItem
                      label="WhatsApp"
                      iconSource={require('../../../assets/images/whatsapp-icon.png')}
                      onPress={() => openLink('https://whatsapp.com')}
                    />
                  </View>
                </View>
              )}

              <View style={styles.spacer} />

              <MenuItem
                label="Log Out"
                icon={require('../../../assets/images/logout-icon.png')}
                onPress={handleLogoutPress}
                showChevron={false}
                isLogout={true}
              />
            </View>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)', // UI Polish: Deeper cinematic dim
    flexDirection: 'row',
  },
  touchableArea: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
  },
  fullScreenLoader: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
  menuContainer: {
    width: '65%', // UI Polish: Slightly wider for comfort
    height: height,
    shadowColor: "#000",
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    overflow: 'hidden',
    borderTopRightRadius: 40, // UI Polish: Softer curve
    borderBottomRightRadius: 40,
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 25, // UI Polish: More breathing room
  },
  header: {
    marginBottom: 40, // UI Polish: Pushed down further from notch
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30, // UI Polish: Spaced out for finger taps
  },
  iconContainer: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: '#2D3E5E', // UI Polish: Darker primary brand color
  },
  menuText: {
    fontSize: 16, // UI Polish: Larger text
    color: '#2D3E5E',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  subMenuContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginTop: -15,
    paddingLeft: 20, // UI Polish: Aligned with the icon
  },
  connectorLine: {
    width: 2,
    backgroundColor: 'rgba(45, 62, 94, 0.2)', // UI Polish: Softer connector line
    marginRight: 12,
    borderRadius: 1,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // UI Polish: Frostier background
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  subIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  subImage: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  subMenuText: {
    fontSize: 14,
    color: '#2D3E5E',
    fontWeight: '600',
  },
  spacer: {
    height: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(45, 62, 94, 0.1)',
    marginTop: 10,
    marginBottom: 25,
  }
});

export default SideMenuV;