import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, Image, StyleSheet, SafeAreaView,
  TouchableOpacity, Dimensions, Linking, TextInput, Platform, Alert, Share, Modal,
  FlatList, ActivityIndicator
} from 'react-native';
import { Ionicons, Entypo } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WebView } from 'react-native-webview';

const JORDAN_CITIES = [
  "Amman", "Zarqa", "Irbid", "Ma'an", "Aqaba",
  "Mafraq", "Balqa", "Karak", "Tafilah",
  "Jerash", "Ajloun", "Madaba"
];

const LEAFLET_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { height: 100%; width: 100%; }
    .confirm-btn {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      background: #2D3E5E; color: #fff; border: none; border-radius: 30px;
      padding: 14px 40px; font-size: 16px; font-weight: 700; cursor: pointer;
      z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: none;
    }
    .hint {
      position: fixed; top: 12px; left: 50%; transform: translateX(-50%);
      background: rgba(45,62,94,0.85); color: #fff; border-radius: 20px;
      padding: 8px 18px; font-size: 13px; font-weight: 600; z-index: 1000; white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="hint" id="hint">Tap anywhere to drop a pin</div>
  <button class="confirm-btn" id="confirmBtn" onclick="confirmLocation()">Confirm Location</button>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([31.9, 35.93], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\\u00a9 OpenStreetMap'
    }).addTo(map);
    var marker = null;
    var pendingLat = null;
    var pendingLng = null;
    var redIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    });
    map.on('click', function(e) {
      pendingLat = e.latlng.lat;
      pendingLng = e.latlng.lng;
      if (marker) {
        marker.setLatLng(e.latlng);
      } else {
        marker = L.marker(e.latlng, { icon: redIcon, draggable: true }).addTo(map);
        marker.on('dragend', function(ev) {
          pendingLat = ev.target.getLatLng().lat;
          pendingLng = ev.target.getLatLng().lng;
        });
      }
      document.getElementById('hint').style.display = 'none';
      document.getElementById('confirmBtn').style.display = 'block';
    });
    function confirmLocation() {
      if (pendingLat === null) return;
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'confirm', lat: pendingLat, lng: pendingLng }));
    }
  </script>
</body>
</html>
`;

import BottomTabsVen from '../commonV/BottomTabsVen';
import VendorPosts from '../commonV/VendorPosts';
import CreatePostEventModal from '../commonV/CreatePostEventModal';
import { fetchMyVendorProfile, updateMyVendorProfile, fetchMyFollowing } from '../../store/slices/vendorSlice';
import vendorAPI from '../../api/vendorAPI';
import { fetchPosts, deletePost } from '../../store/slices/postsSlice';
import { isLocalUri, uploadMedia } from '../../api/uploadAPI';

const { width, height } = Dimensions.get('window');

const defaultBg = require('../../../assets/images/default-banner.png');
const defaultLogo = require('../../../assets/images/default-user-pfp.png');

const VendorProfileScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const params = useLocalSearchParams();

  const { myProfile, myFollowing } = useSelector((state) => state.vendor);
  const { posts: reduxPosts } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  const [modalVisible, setModalVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollectionId, setSelectedCollectionId] = useState(null);

  // Location map picker (edit mode)
  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);
  const [mapPickerReady, setMapPickerReady] = useState(false);
  const [pendingEditLat, setPendingEditLat] = useState(null);
  const [pendingEditLng, setPendingEditLng] = useState(null);
  const mapPickerRef = useRef(null);

  // City picker (edit profile mode)
  const [isCityPickerVisible, setIsCityPickerVisible] = useState(false);

  const isPending = !myProfile || myProfile.status !== 'active';

  const handleRestrictedAction = () => {
    if (Platform.OS === 'web') {
      window.alert("Account Pending: You cannot create posts, events, or share your profile until an admin approves your shop.");
    } else {
      Alert.alert(
        "Account Pending",
        "You cannot create posts, events, or share your profile until an admin approves your shop.",
        [{ text: "Understood", style: "cancel" }]
      );
    }
  };

  // States for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);

  // All posts belonging to this vendor
  const myPosts = reduxPosts.filter(
    (p) => myProfile && String(p.vendorId) === String(myProfile.id)
  );

  // Posts shown — filtered by selected custom collection (or all if none selected)
  const posts = selectedCollectionId
    ? myPosts.filter((p) => Array.isArray(p.collectionIds) && p.collectionIds.includes(selectedCollectionId))
    : myPosts;

  const loadCollections = useCallback(async () => {
    const result = await vendorAPI.getMyCollections();
    if (result.success) setCollections(result.data || []);
  }, []);

  const [vendorData, setVendorData] = useState({
    name: '', location: '', rating: 0, followers: 0, following: 0, bio: '',
    bgImage: defaultBg, profileImage: defaultLogo,
  });

  // Fetch on focus — use vendorId filter so only own posts are fetched (avoids page-1 truncation)
  useFocusEffect(
    useCallback(() => {
      dispatch(fetchMyVendorProfile());
      dispatch(fetchMyFollowing());
      if (user?.id) dispatch(fetchPosts({ vendorId: user.id, pageSize: 100 }));
      loadCollections();
    }, [dispatch, loadCollections, user?.id])
  );

  // Sync Redux profile → local vendorData
  useEffect(() => {
    if (myProfile) {
      setVendorData({
        name: myProfile.shopName || myProfile.fullName || 'User Name',
        location: myProfile.city || '',
        rating: myProfile.averageRating || 0,
        followers: myProfile.followerCount || 0,
        following: myProfile.followingCount || myFollowing.length || 0,
        bio: myProfile.bio || '',
        bgImage: myProfile.bannerImage ? { uri: myProfile.bannerImage } : defaultBg,
        profileImage: myProfile.profileImage ? { uri: myProfile.profileImage } : defaultLogo,
      });
      setShopDetailsText({
        1: myProfile.address || '',
        2: myProfile.phone || '',
        3: myProfile.email || '',
        4: myProfile.whatsapp || '',
        5: myProfile.instagramUrl || '',
        7: `${(myProfile.averageRating || 0).toFixed(1)} rated ( ${myProfile.reviewCount || 0} Reviews )`,
      });
      if (myProfile.openTime) {
        const [oh, om] = myProfile.openTime.split(':').map(Number);
        const d = new Date(); d.setHours(oh, om, 0, 0);
        setOpenTime(d);
      }
      if (myProfile.closeTime) {
        const [ch, cm] = myProfile.closeTime.split(':').map(Number);
        const d = new Date(); d.setHours(ch, cm, 0, 0);
        setCloseTime(d);
      }
    }
  }, [myProfile]);

  // Save profile edits
  const handleSaveProfile = async () => {
    const rawProfile = typeof vendorData.profileImage === 'object' && vendorData.profileImage?.uri
      ? vendorData.profileImage.uri : null;
    const rawBanner = typeof vendorData.bgImage === 'object' && vendorData.bgImage?.uri
      ? vendorData.bgImage.uri : null;

    const finalProfileImage = isLocalUri(rawProfile) ? await uploadMedia(rawProfile) : rawProfile;
    const finalBannerImage  = isLocalUri(rawBanner)  ? await uploadMedia(rawBanner)  : rawBanner;

    await dispatch(updateMyVendorProfile({
      shopName: vendorData.name,
      city: vendorData.location,
      bio: vendorData.bio,
      profileImage: finalProfileImage,
      bannerImage: finalBannerImage,
    }));
    setIsEditing(false);
  };

  // --- TIME PICKER LOGIC ---
  const [openTime, setOpenTime] = useState(new Date(new Date().setHours(8, 0, 0, 0)));
  const [closeTime, setCloseTime] = useState(new Date(new Date().setHours(19, 0, 0, 0)));
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [timePickerMode, setTimePickerMode] = useState('open');

  const handleTimeChange = (event, selectedTime) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }

    if (selectedTime) {
      if (timePickerMode === 'open') {
        setOpenTime(selectedTime);
      } else {
        setCloseTime(selectedTime);
      }
    }
  };

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}${minutes === '00' ? '' : ':' + minutes} ${ampm}`;
  };

  const formatTimeForAPI = (date) => {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleSaveDetails = async () => {
    const profileUpdate = { phone: shopDetailsText[2] };
    if (pendingEditLat !== null && pendingEditLng !== null) {
      profileUpdate.locationLat = pendingEditLat;
      profileUpdate.locationLng = pendingEditLng;
    }
    await Promise.all([
      dispatch(updateMyVendorProfile(profileUpdate)),
      vendorAPI.updateProfileDetails({
        address: shopDetailsText[1],
        whatsapp: shopDetailsText[4],
        instagramUrl: shopDetailsText[5],
        openTime: formatTimeForAPI(openTime),
        closeTime: formatTimeForAPI(closeTime),
      }),
    ]);
    setPendingEditLat(null);
    setPendingEditLng(null);
    dispatch(fetchMyVendorProfile());
    setIsEditingDetails(false);
  };

  const getWorkHoursStatus = () => {
    const now = new Date();
    const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const openTotalMinutes = openTime.getHours() * 60 + openTime.getMinutes();
    const closeTotalMinutes = closeTime.getHours() * 60 + closeTime.getMinutes();

    const timeString = `${formatTime(openTime)} - ${formatTime(closeTime)}`;

    if (currentTotalMinutes >= openTotalMinutes && currentTotalMinutes < closeTotalMinutes) {
      if (closeTotalMinutes - currentTotalMinutes <= 60) {
        return { text: `Closing soon (${timeString})`, color: '#F59E0B' };
      }
      return { text: `Open now (${timeString})`, color: '#22C55E' };
    } else {
      return { text: `Closed (${timeString})`, color: '#D32F2F' };
    }
  };

  const [shopDetailsText, setShopDetailsText] = useState({
    1: 'Amman - Nazal - Dostoor ST -\nOpposite Hamada Restaurant , 00962',
    2: '07 9885 2852',
    3: 'Auto99m@gmail.com',
    4: '+962 7 9885 2852',
    5: 'The_Automotive.com ( 2.3k followers )',
    7: '4.5 rated ( 50 Review )'
  });

  useEffect(() => {
    if (params.newPost) { try { addContentToFeed(JSON.parse(params.newPost)); } catch (e) { } }
    if (params.newEvent) { try { addContentToFeed(JSON.parse(params.newEvent)); } catch (e) { } }
  }, [params.newPost, params.newEvent]);

  const addContentToFeed = (newItem) => {
    setPosts(prevPosts => {
      const exists = prevPosts.find(p => p.id === newItem.id);
      if (exists) return prevPosts;
      const formattedItem = { ...newItem, postImage: typeof newItem.postImage === 'string' ? { uri: newItem.postImage } : newItem.postImage };
      return [formattedItem, ...prevPosts];
    });
  };

  const handleDeletePost = (id) => {
    const confirmDelete = () => dispatch(deletePost(id));
    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to remove this post?")) confirmDelete();
    } else {
      Alert.alert("Delete Post", "Remove this from your profile?", [{ text: "Cancel", style: "cancel" }, { text: "Delete", style: "destructive", onPress: confirmDelete }]);
    }
  };

  const handleDeleteCategory = (collection) => {
    const confirmDelete = async () => {
      const result = await vendorAPI.deleteCollection(collection.id);
      if (!result.success) {
        if (Platform.OS === 'web') window.alert(result.error || 'Failed to delete category.');
        else Alert.alert('Error', result.error || 'Failed to delete category.');
        return;
      }
      if (selectedCollectionId === collection.id) setSelectedCollectionId(null);
      await loadCollections();
      dispatch(fetchPosts());
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to delete the category "${collection.name}"?`)) confirmDelete();
    } else {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${collection.name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: confirmDelete }
        ]
      );
    }
  };

  const handleShareProfile = async () => {
    if (isPending) { handleRestrictedAction(); return; }
    try {
      await Share.share({ message: `Check out ${vendorData.name} on SWAG App! 🚗💨 \n\nVisit us here: https://swag-app.com/shop/${vendorData.name.replace(/\s+/g, '').toLowerCase()}` });
    } catch (error) { alert(error.message); }
  };

  const openMap = (addressText) => {
    // Prefer pinned coordinates if available
    if (myProfile?.locationLat && myProfile?.locationLng) {
      const lat = myProfile.locationLat;
      const lng = myProfile.locationLng;
      const nativeUrl = `geo:${lat},${lng}?q=${lat},${lng}`;
      const webUrl = `https://www.google.com/maps?q=${lat},${lng}`;
      Linking.canOpenURL(nativeUrl)
        .then((supported) => Linking.openURL(supported ? nativeUrl : webUrl))
        .catch(() => Linking.openURL(webUrl));
      return;
    }
    // Fall back to location URL if set
    if (myProfile?.locationUrl) {
      const url = myProfile.locationUrl;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        Linking.openURL(url).catch(() => alert("Couldn't open Maps."));
        return;
      }
    }
    // Fall back to address text search
    if (!addressText?.trim()) return;
    const raw = addressText.trim();
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      Linking.openURL(raw).catch(() => alert("Couldn't open Maps."));
      return;
    }
    const query = encodeURIComponent(raw.replace(/\n/g, ' '));
    const nativeUrl = `geo:0,0?q=${query}`;
    const webUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;
    Linking.canOpenURL(nativeUrl)
      .then((supported) => Linking.openURL(supported ? nativeUrl : webUrl))
      .catch(() => alert("Couldn't open Maps."));
  };

  const openInstagram = (value) => {
    const raw = value.trim();
    if (!raw) return;
    // Already a full URL
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      Linking.openURL(raw).catch(() => alert("Couldn't open Instagram."));
      return;
    }
    // Strip leading @ if present
    const username = raw.startsWith('@') ? raw.slice(1) : raw;
    Linking.openURL(`https://instagram.com/${username}`).catch(() => alert("Couldn't open Instagram."));
  };

  const openWhatsApp = (value) => {
    const raw = value.trim();
    if (!raw) return;
    // Remove all non-digit characters except leading +
    let digits = raw.replace(/[^\d+]/g, '');
    // Strip leading +
    if (digits.startsWith('+')) digits = digits.slice(1);
    // Local number starting with 0: replace leading 0 with country code 962 (Jordan)
    if (digits.startsWith('0')) digits = '962' + digits.slice(1);
    Linking.openURL(`https://wa.me/${digits}`).catch(() => alert("Couldn't open WhatsApp."));
  };

  const workHoursStatus = getWorkHoursStatus();

  const hasLocation = !!(myProfile?.locationLat && myProfile?.locationLng);
  const hasAddress = hasLocation || !!shopDetailsText[1];

  const DETAILS_LIST = [
    { id: 1, label: 'Address', iconImage: require('../../../assets/images/locationVendor-icon.png'), text: hasAddress ? 'Pinned Location' : '', textColor: hasAddress ? '#2D7DD2' : undefined, action: hasAddress ? () => openMap(shopDetailsText[1]) : undefined },
    { id: 2, label: 'Mobile', iconImage: require('../../../assets/images/phone-icon.png'), action: () => Linking.openURL(`tel:${shopDetailsText[2].replace(/\s/g, '')}`) },
    { id: 3, label: 'Email', iconName: 'mail', action: () => Linking.openURL(`mailto:${shopDetailsText[3]}`) },
    { id: 4, label: 'WhatsApp', iconImage: require('../../../assets/images/whatsapp-icon.png'), action: () => openWhatsApp(shopDetailsText[4]) },
    { id: 5, label: 'Confirmed link', iconImage: require('../../../assets/images/insta-icon.png'), action: () => openInstagram(shopDetailsText[5]) },
    { id: 6, label: 'Work hours', textColor: workHoursStatus.color, text: workHoursStatus.text, iconName: 'time' },
    { id: 7, label: 'Rate', textColor: '#D32F2F', iconImage: require('../../../assets/images/rate-icon.png'), action: () => router.push('/vendor/Rating&RevVen') },
    { id: 8, label: 'My Categories', iconName: 'grid-outline', action: () => router.push('/vendor/ManageCategoriesVen') },
  ];

  const pickImage = async (target) => {
    if (!isEditing) return;
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
    if (!result.canceled) setVendorData(prev => ({ ...prev, [target]: { uri: result.assets[0].uri } }));
  };

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* --- COVER & PROFILE SECTION --- */}
        <View style={styles.headerSection}>
          <TouchableOpacity activeOpacity={0.9} onPress={() => isEditing ? pickImage('bgImage') : setPreviewImage(vendorData.bgImage)}>
            <Image source={vendorData.bgImage} style={styles.bgImage} resizeMode="cover" />
            {isEditing && <View style={styles.imageOverlay}><Ionicons name="camera" size={30} color="white" /></View>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={24} color="#2D3E5E" />
          </TouchableOpacity>

          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarWrapper}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => isEditing ? pickImage('profileImage') : setPreviewImage(vendorData.profileImage)}>
                <Image source={vendorData.profileImage} style={styles.profileImage} />
                {isEditing && <View style={styles.avatarOverlay}><Ionicons name="camera" size={20} color="white" /></View>}
              </TouchableOpacity>
            </View>

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.editBtn} onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)} activeOpacity={0.8}>
                <Text style={styles.btnText}>{isEditing ? "Save" : "Edit Profile"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareBtn} onPress={handleShareProfile} activeOpacity={0.8}>
                <Text style={styles.btnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* --- IDENTITY CARD --- */}
        <View style={styles.identityCard}>
          <View style={styles.identityHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              {isEditing ? (
                <TextInput style={styles.editableInput} value={vendorData.name} onChangeText={(t) => setVendorData(prev => ({ ...prev, name: t }))} />
              ) : (
                <Text style={styles.vendorTitle} numberOfLines={1}>{vendorData.name}</Text>
              )}

              <View style={styles.locationTag}>
                <Ionicons name="location" size={14} color="#8391A1" />
                {isEditing ? (
                  <TouchableOpacity
                    style={styles.cityPickerInline}
                    onPress={() => setIsCityPickerVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.locationText, { color: vendorData.location ? '#2D3E5E' : '#8391A1' }]}>
                      {vendorData.location || 'Select city'}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#5B7896" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.locationText}>{vendorData.location}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={styles.miniRating} onPress={() => router.push('/vendor/Rating&RevVen')} activeOpacity={0.7}>
              <Text style={styles.miniRatingVal}>{(vendorData.rating || 0).toFixed(1)}</Text>
              <View style={{ flexDirection: 'row' }}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Entypo key={i} name={(vendorData.rating || 0) >= i ? "star" : "star-outlined"} size={14} color={(vendorData.rating || 0) >= i ? "#8A1C27" : "#CBD5E1"} />
                ))}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsBar}>
            <TouchableOpacity onPress={() => router.push('/commonScreensV/FollowersListV')} style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>{vendorData.followers}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{myProfile?.postCount || myPosts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.statDivider} />
            <TouchableOpacity onPress={() => router.push('/commonScreensV/FollowingListV')} style={styles.statItem} activeOpacity={0.7}>
              <Text style={styles.statNumber}>{vendorData.following}</Text>
              <Text style={styles.statLabel}>Following</Text>
            </TouchableOpacity>
          </View>

          {isEditing ? (
            <TextInput style={[styles.editableInput, { height: 60, fontSize: 14, fontWeight: '500' }]} multiline value={vendorData.bio} onChangeText={(t) => setVendorData(prev => ({ ...prev, bio: t }))} />
          ) : (
            <Text style={styles.bioText}>{vendorData.bio}</Text>
          )}
        </View>

        {/* --- BUSINESS DETAILS SECTION --- */}
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeaderRow}>
            <Text style={styles.sectionTitle}>Shop Details</Text>
            <TouchableOpacity
              style={styles.editDetailsBtn}
              onPress={() => isEditingDetails ? handleSaveDetails() : setIsEditingDetails(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.editDetailsBtnText}>{isEditingDetails ? "Save Details" : "Edit Details"}</Text>
            </TouchableOpacity>
          </View>

          {DETAILS_LIST.map((item, index) => (
            <View key={item.id}>
              <TouchableOpacity
                style={styles.detailRow}
                onPress={item.action}
                disabled={!item.action || isEditingDetails}
                activeOpacity={item.action && !isEditingDetails ? 0.7 : 1}
              >
                <View style={styles.iconCircle}>
                  {item.iconImage ? <Image source={item.iconImage} style={styles.iconImageStyle} /> : <Ionicons name={item.iconName} size={20} color="#5B7896" />}
                </View>
                <View style={styles.detailTextCol}>

                  {isEditingDetails && item.id !== 7 && item.id !== 8 ? (
                    item.id === 6 ? (
                      <View style={styles.timeEditRow}>
                        <TouchableOpacity style={styles.timePickBtn} onPress={() => { setTimePickerMode('open'); setShowTimePicker(true); }}>
                          <Text style={styles.timePickText}>Open: {formatTime(openTime)}</Text>
                        </TouchableOpacity>
                        <Text style={styles.timeDash}>-</Text>
                        <TouchableOpacity style={styles.timePickBtn} onPress={() => { setTimePickerMode('close'); setShowTimePicker(true); }}>
                          <Text style={styles.timePickText}>Close: {formatTime(closeTime)}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : item.id === 1 ? (
                      <TouchableOpacity
                        style={styles.mapPickerBtn}
                        onPress={() => { setMapPickerReady(false); setIsLocationPickerVisible(true); }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name={pendingEditLat !== null ? 'checkmark-circle' : 'location-sharp'} size={16} color={pendingEditLat !== null ? '#10B981' : '#8A1C27'} />
                        <Text style={[styles.mapPickerBtnText, pendingEditLat !== null && { color: '#10B981' }]}>
                          {pendingEditLat !== null
                            ? `Pinned (${pendingEditLat.toFixed(4)}, ${pendingEditLng.toFixed(4)})`
                            : (myProfile?.locationLat ? 'Update pinned location' : 'Pin location on map')}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={[styles.editableInput, { fontSize: 14, paddingBottom: 2, marginBottom: 2 }]}
                        value={shopDetailsText[item.id]}
                        onChangeText={(t) => setShopDetailsText(prev => ({ ...prev, [item.id]: t }))}
                      />
                    )
                  ) : (
                    <Text style={[styles.detailValue, item.textColor && { color: item.textColor }]} numberOfLines={2}>
                      {item.id === 6 ? workHoursStatus.text : (shopDetailsText[item.id] || item.text)}
                    </Text>
                  )}

                  <Text style={styles.detailLabel}>{item.label}</Text>
                </View>

                {item.action && !isEditingDetails && (
                  <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                )}
              </TouchableOpacity>
              {index < DETAILS_LIST.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* --- CATEGORY PILLS (dynamic, vendor's custom collections) --- */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
            <TouchableOpacity style={styles.addCatTab} onPress={() => isPending ? handleRestrictedAction() : router.push('/vendor/AddCategoryVen')} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.catTab, selectedCollectionId === null && styles.catTabActive]}
              onPress={() => setSelectedCollectionId(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.catText, selectedCollectionId === null && styles.catTextActive]}>All</Text>
            </TouchableOpacity>

            {collections.map((col) => {
              const isActive = selectedCollectionId === col.id;
              return (
                <View key={col.id} style={{ position: 'relative', flexDirection: 'row', alignItems: 'center' }}>
                  <TouchableOpacity
                    style={[styles.catTab, isActive && styles.catTabActive, isActive && { paddingRight: 14 }]}
                    onPress={() => setSelectedCollectionId(isActive ? null : col.id)}
                    onLongPress={() => handleDeleteCategory(col)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.catText, isActive && styles.catTextActive]}>{col.name}</Text>
                    {isActive && (
                      <TouchableOpacity
                        style={styles.editCatPencil}
                        onPress={() => router.push({ pathname: '/vendor/AddCategoryVen', params: { collectionId: col.id } })}
                        activeOpacity={0.7}
                      >
                        <Ionicons name="pencil" size={12} color="#8A1C27" />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>

                  {isEditing && (
                    <TouchableOpacity
                      style={styles.deleteCatBadge}
                      onPress={() => handleDeleteCategory(col)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={12} color="#FFF" />
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        {/* --- POSTS FEED --- */}
        <View style={styles.feedContainer}>
          {posts.map((post) => (
            <View key={post.id} style={styles.postWrapper}>
              <VendorPosts
                postId={post.id}
                vendorName={post.vendorShopName || post.vendorName || vendorData.name}
                location={post.location || post.vendorCity || vendorData.location}
                description={post.description}
                vendorLogo={post.vendorProfileImage ? { uri: post.vendorProfileImage } : vendorData.profileImage}
                postImage={post.postImage ? { uri: post.postImage } : null}
                mediaType={post.mediaType}
                isEvent={post.type === 'event'}
                date={post.eventDate || post.date}
                time={post.eventTime || post.time}
                initialLiked={post.isLiked}
                initialSaved={post.isSaved}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
              />
              <TouchableOpacity style={styles.editIconButton} onPress={() => router.push({ pathname: '/vendor/CreatePostVen', params: { postId: post.id, initialDescription: post.description, initialImage: post.postImage || '' } })} activeOpacity={0.7}>
                <Ionicons name="pencil" size={18} color="#2D3E5E" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteIconButton} onPress={() => handleDeletePost(post.id)} activeOpacity={0.7}>
                <Ionicons name="trash" size={18} color="#E53E3E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        <View style={styles.addNewCard}>
          <Text style={styles.addNewTitle}>Create Content</Text>
          <Text style={styles.addNewSub}>Add a new post or upcoming event</Text>
          <TouchableOpacity style={styles.addCircle} onPress={() => isPending ? handleRestrictedAction() : setModalVisible(true)} activeOpacity={0.8}>
            <Ionicons name="add" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* --- TIME PICKER MODAL (Popup layout for iOS/Android consistency) --- */}
      {Platform.OS === 'ios' ? (
        <Modal visible={showTimePicker} transparent={true} animationType="slide">
          <View style={styles.pickerModalContainer}>
            <View style={styles.pickerModalContent}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>{timePickerMode === 'open' ? 'Set Open Time' : 'Set Close Time'}</Text>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.pickerDoneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={timePickerMode === 'open' ? openTime : closeTime}
                mode="time"
                display="spinner"
                onChange={handleTimeChange}
                textColor="#000000"
              />
            </View>
          </View>
        </Modal>
      ) : (
        showTimePicker && (
          <DateTimePicker
            value={timePickerMode === 'open' ? openTime : closeTime}
            mode="time"
            display="default"
            onChange={handleTimeChange}
          />
        )
      )}

      {/* --- IMAGE MODAL --- */}
      <Modal visible={!!previewImage} transparent={true} animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.closeFullscreen} onPress={() => setPreviewImage(null)}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          {previewImage && <Image source={previewImage} style={styles.fullscreenImage} resizeMode="contain" />}
        </View>
      </Modal>

      <View style={styles.bottomTabsWrapper}>
        <BottomTabsVen onRestrictedAction={handleRestrictedAction} />
      </View>

      <CreatePostEventModal visible={modalVisible} onClose={() => setModalVisible(false)} />

      {/* --- CITY PICKER MODAL --- */}
      <Modal visible={isCityPickerVisible} transparent={true} animationType="slide">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setIsCityPickerVisible(false)} style={{ padding: 5 }}>
                <Ionicons name="close" size={28} color="#8A1C27" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={JORDAN_CITIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => {
                    setVendorData(prev => ({ ...prev, location: item }));
                    setIsCityPickerVisible(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cityItemText, vendorData.location === item && { color: '#8A1C27', fontWeight: '700' }]}>{item}</Text>
                  {vendorData.location === item && <Ionicons name="checkmark-circle" size={24} color="#8A1C27" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* --- LEAFLET LOCATION PICKER MODAL --- */}
      <Modal visible={isLocationPickerVisible} transparent={false} animationType="slide">
        <View style={styles.mapModalContainer}>
          <View style={styles.mapModalHeader}>
            <Text style={styles.pickerTitle}>Pin Your Location</Text>
            <TouchableOpacity onPress={() => { setIsLocationPickerVisible(false); setMapPickerReady(false); }} style={{ padding: 5 }}>
              <Ionicons name="close" size={28} color="#8A1C27" />
            </TouchableOpacity>
          </View>
          <Text style={styles.mapInstructions}>Tap the map to drop a pin, drag to fine-tune, then press Confirm.</Text>
          <View style={{ flex: 1, position: 'relative' }}>
            {!mapPickerReady && (
              <View style={styles.mapLoading}>
                <ActivityIndicator size="large" color="#2D3E5E" />
                <Text style={styles.mapLoadingText}>Loading map...</Text>
              </View>
            )}
            <WebView
              ref={mapPickerRef}
              source={{ html: LEAFLET_HTML }}
              style={[{ flex: 1 }, !mapPickerReady && { opacity: 0 }]}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              originWhitelist={['*']}
              mixedContentMode="always"
              onLoad={() => setMapPickerReady(true)}
              onMessage={(event) => {
                try {
                  const data = JSON.parse(event.nativeEvent.data);
                  if (data.type === 'confirm') {
                    setPendingEditLat(data.lat);
                    setPendingEditLng(data.lng);
                    setIsLocationPickerVisible(false);
                    setMapPickerReady(false);
                  }
                } catch (_) {}
              }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#BFCEDC' },
  scrollContent: { paddingBottom: 20 },

  headerSection: { marginBottom: 10 },
  bgImage: { width: '100%', height: 180 },
  imageOverlay: { ...StyleSheet.absoluteFillObject, height: 180, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  backBtn: { position: 'absolute', top: 15, left: 20, zIndex: 10, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },

  profileHeaderContent: { flexDirection: 'row', paddingHorizontal: 20, justifyContent: 'space-between', alignItems: 'flex-start' },
  avatarWrapper: { marginTop: -45, padding: 4, backgroundColor: '#FFFFFF', borderRadius: 55, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5 },
  profileImage: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: '#FFFFFF', backgroundColor: '#F1F4F9' },
  avatarOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 45, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },

  actionButtonsRow: { flexDirection: 'row', marginTop: 15 },
  editBtn: { backgroundColor: '#2D3E5E', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, elevation: 2, marginRight: 10 },
  shareBtn: { backgroundColor: '#8A1C27', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, elevation: 2 },
  btnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  identityCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 25, padding: 20, marginTop: 10, elevation: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8 },
  identityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  vendorTitle: { fontSize: 26, fontWeight: '800', color: '#2D3E5E' },
  locationTag: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { fontSize: 13, color: '#8391A1', marginLeft: 4, fontWeight: '600' },
  cityPickerInline: { flexDirection: 'row', alignItems: 'center', marginLeft: 4 },

  // Map picker button (inside shop details edit row)
  mapPickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F4F9', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, borderWidth: 1, borderColor: '#E2E8F0' },
  mapPickerBtnText: { fontSize: 13, color: '#2D3E5E', fontWeight: '600', marginLeft: 6, flex: 1 },

  // City & map picker modals
  pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  pickerContainer: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, maxHeight: '65%', padding: 25, paddingBottom: 40 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
  pickerTitle: { fontSize: 22, fontWeight: '800', color: '#2D3E5E' },
  cityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F4F9' },
  cityItemText: { fontSize: 16, color: '#2D3E5E', fontWeight: '500' },
  mapModalContainer: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'ios' ? 55 : 30 },
  mapModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 8 },
  mapInstructions: { color: '#8391A1', fontSize: 13, fontWeight: '500', paddingHorizontal: 25, marginBottom: 10 },
  mapLoading: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F1F4F9', zIndex: 10 },
  mapLoadingText: { color: '#5B7896', marginTop: 12, fontWeight: '600' },
  miniRating: { alignItems: 'flex-end' },
  miniRatingVal: { fontSize: 16, fontWeight: '800', color: '#2D3E5E' },
  starsImg: { width: 70, height: 14, resizeMode: 'contain', marginTop: 2 },

  statsBar: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F1F4F9', marginBottom: 15 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
  statLabel: { fontSize: 11, color: '#8391A1', textTransform: 'uppercase', fontWeight: '700', marginTop: 2 },
  statDivider: { width: 1, height: 25, backgroundColor: '#E2E8F0' },
  bioText: { fontSize: 14, color: '#4A5568', lineHeight: 22, fontWeight: '500' },

  editableInput: { borderBottomWidth: 1, borderColor: '#8A1C27', fontSize: 18, marginBottom: 5, color: '#2D3E5E', fontWeight: '700' },

  detailsCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20, padding: 20, marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  detailsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { backgroundColor: '#FDF2F3', color: '#8A1C27', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, fontSize: 13, fontWeight: '800', overflow: 'hidden' },
  editDetailsBtn: { backgroundColor: '#E6F0FA', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 12 },
  editDetailsBtnText: { color: '#2D3E5E', fontSize: 12, fontWeight: '700' },

  timeEditRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  timePickBtn: { backgroundColor: '#F1F4F9', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  timePickText: { color: '#2D3E5E', fontSize: 12, fontWeight: '700' },
  timeDash: { marginHorizontal: 8, color: '#8391A1', fontWeight: 'bold' },

  pickerModalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerModalContent: { backgroundColor: '#FFFFFF', paddingBottom: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#E2E8F0' },
  pickerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3E5E' },
  pickerDoneText: { fontSize: 16, fontWeight: 'bold', color: '#8A1C27' },

  detailRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  iconImageStyle: { width: 20, height: 20, resizeMode: 'contain' },
  detailTextCol: { flex: 1 },
  detailValue: { fontSize: 14, fontWeight: '800', color: '#2D3E5E', marginBottom: 3 },
  detailLabel: { fontSize: 11, color: '#8391A1', fontWeight: '600', textTransform: 'uppercase' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginLeft: 60 },

  categoriesContainer: { marginTop: 25, marginBottom: 20, paddingLeft: 20 },
  catTab: { backgroundColor: '#FFFFFF', paddingVertical: 10, paddingHorizontal: 25, borderRadius: 20, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  catTabActive: { backgroundColor: '#8A1C27' },
  catText: { fontWeight: '700', color: '#8391A1', fontSize: 13 },
  catTextActive: { color: '#FFFFFF' },
  addCatTab: { backgroundColor: '#2D3E5E', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 20, marginRight: 12, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  editCatPencil: { marginLeft: 8, backgroundColor: '#FFFFFF', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },

  // Custom styling for the tiny red delete badge
  deleteCatBadge: {
    position: 'absolute',
    top: -2,
    right: 5,
    backgroundColor: '#E53E3E', // Bright Red
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  feedContainer: { paddingHorizontal: 20 },
  postWrapper: { marginBottom: 20, position: 'relative' },
  editIconButton: { position: 'absolute', top: 15, right: 65, zIndex: 10, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },
  deleteIconButton: { position: 'absolute', top: 15, right: 15, zIndex: 10, backgroundColor: '#FFFFFF', padding: 10, borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 4 },

  addNewCard: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20, padding: 30, marginTop: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  addNewTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E', marginBottom: 5 },
  addNewSub: { fontSize: 13, color: '#8391A1', marginBottom: 20, fontWeight: '500' },
  addCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#8A1C27', justifyContent: 'center', alignItems: 'center', shadowColor: '#8A1C27', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },

  bottomTabsWrapper: { position: 'absolute', bottom: 0, left: 0, right: 0, elevation: 20, zIndex: 100 },

  fullscreenContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  closeFullscreen: { position: 'absolute', top: 50, right: 20, zIndex: 110 },
  fullscreenImage: { width: width, height: height * 0.8 },
});

export default VendorProfileScreen;