import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Dimensions, Share, Alert } from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { toggleLike as toggleLikeAction, toggleSave as toggleSaveAction } from '../../store/slices/postsSlice';
import CommentsModalV from './CommentsModalV';

const { width, height } = Dimensions.get('window');
const likeIcon = require('../../../assets/images/like-icon.png');
const likedIcon = require('../../../assets/images/liked-icon.png');
const commentIcon = require('../../../assets/images/coment-icon.png');
const shareIcon = require('../../../assets/images/share-icon.png');
const saveIcon = require('../../../assets/images/saved-icon.png');
const savedIcon = require('../../../assets/images/save-icon.png');

const VendorPosts = ({
  postId, vendorName, vendorLogo, location, description, postImage,
  initialLiked = false, initialSaved = false, isEvent = false,
  likeCount: initialLikeCount = 0, commentCount = 0,
  date, time, mediaType = 'image',
  mediaWidth, mediaHeight
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [currentLikeCount, setCurrentLikeCount] = useState(initialLikeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);
  const CHARACTER_LIMIT = 100;

  const toggleLike = () => {
    if (postId) dispatch(toggleLikeAction(postId));
    setCurrentLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    setIsLiked(!isLiked);
  };
  const toggleSave = () => {
    if (postId) dispatch(toggleSaveAction(postId));
    setIsSaved(!isSaved);
  };

  // --- NEW: Share Logic ---
  const onShare = async () => {
    try {
      const result = await Share.share({
        title: `Post by ${vendorName}`,
        message: `${description}\n\nCheck out this ${isEvent ? 'event' : 'post'} by ${vendorName} on our App!`,
        // url: 'https://yourapp.com/post/id', // Use this when you have deep linking set up
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
        } else {
          // shared
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const renderDescription = () => {
    if (!description) return null;

    const isLongText = description.length > CHARACTER_LIMIT;
    const displayText = isLongText && !isExpanded
      ? description.substring(0, CHARACTER_LIMIT) + "... "
      : description;

    const parts = displayText.split(/(#\S+)/g);

    return (
      <View style={styles.textContainer}>
        <Text style={styles.desc}>
          {parts.map((part, index) => {
            if (part.startsWith('#')) {
              return <Text key={index} style={styles.hashtag}>{part}</Text>;
            }
            return <Text key={index}>{part}</Text>;
          })}
          {isLongText && (
            <Text style={styles.readMore} onPress={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? " Show less" : " Read more..."}
            </Text>
          )}
        </Text>
      </View>
    );
  };

  const calculatedAspect = (mediaWidth && mediaHeight) ? Math.max(mediaWidth / mediaHeight, 0.75) : 4 / 3;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.vendorInfo} onPress={() => router.push('/vendor/otherVendorProfile')}>
          <ExpoImage source={vendorLogo} style={styles.logo} contentFit="cover" transition={200} />
          <View>
            <Text style={styles.vendorName}>{vendorName}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={12} color="#800C1F" />
              <Text style={styles.location}>{location}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSave} style={styles.saveBtn}>
          <Image source={isSaved ? savedIcon : saveIcon} style={styles.saveIcon} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isEvent && (
          <View style={styles.eventBadge}>
            <Ionicons name="star" size={12} color="#FFF" />
            <Text style={styles.eventBadgeText}>UPCOMING EVENT</Text>
          </View>
        )}

        {renderDescription()}

        {postImage ? (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setIsFullscreen(true)}
            style={[styles.imageContainer, { aspectRatio: calculatedAspect }]}
          >
            {mediaType === 'video' ? (
              <>
                <Video
                  style={styles.dynamicMedia}
                  source={typeof postImage === 'string' ? { uri: postImage } : postImage}
                  resizeMode={ResizeMode.COVER}
                  isLooping
                  shouldPlay={isVideoPlaying}
                  isMuted={true}
                />
                {!isVideoPlaying && (
                  <TouchableOpacity
                    style={styles.playOverlay}
                    onPress={(e) => { e.stopPropagation(); setIsVideoPlaying(true); }}
                  >
                    <Ionicons name="play-circle" size={60} color="rgba(255,255,255,0.9)" />
                  </TouchableOpacity>
                )}
              </>
            ) : (
              <ExpoImage
                source={typeof postImage === 'string' ? { uri: postImage } : postImage}
                style={styles.dynamicMedia}
                contentFit="cover"
                transition={300}
              />
            )}

            {isEvent && (date || time) && (
              <View style={styles.eventOverlay}>
                <View style={styles.overlayRow}>
                  <Ionicons name="calendar" size={16} color="#8A1C27" />
                  <Text style={styles.overlayText}>{date}</Text>
                </View>
                {time && (
                  <View style={[styles.overlayRow, { marginLeft: 15 }]}>
                    <Ionicons name="time" size={16} color="#8A1C27" />
                    <Text style={styles.overlayText}>{time}</Text>
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={toggleLike} style={styles.actionBtn}>
          <Image source={isLiked ? likedIcon : likeIcon} style={styles.icon} />
          {currentLikeCount > 0 ? <Text style={styles.countText}>{currentLikeCount}</Text> : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowComments(true)} style={styles.actionBtn}>
          <Image source={commentIcon} style={styles.icon} />
          {commentCount > 0 ? <Text style={styles.countText}>{commentCount}</Text> : null}
        </TouchableOpacity>
        <TouchableOpacity onPress={onShare} style={styles.actionBtn}>
          <Image source={shareIcon} style={styles.icon} />
        </TouchableOpacity>
      </View>

      <Modal visible={isFullscreen} transparent={true} animationType="fade">
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity style={styles.closeFullscreen} onPress={() => setIsFullscreen(false)}>
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
          {mediaType === 'video' ? (
            <Video
              style={styles.fullscreenMedia}
              source={typeof postImage === 'string' ? { uri: postImage } : postImage}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              shouldPlay={true}
              isMuted={false}
            />
          ) : (
            <ExpoImage source={typeof postImage === 'string' ? { uri: postImage } : postImage} style={styles.fullscreenMedia} contentFit="contain" />
          )}
        </View>
      </Modal>
      <CommentsModalV visible={showComments} onClose={() => setShowComments(false)} postId={postId} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 15, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  vendorInfo: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 45, height: 45, borderRadius: 22.5, marginRight: 12, borderWidth: 1, borderColor: '#F0F4F8' },
  vendorName: { fontWeight: 'bold', fontSize: 16, color: '#2C3E50', marginBottom: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  location: { color: '#800C1F', fontSize: 12, marginLeft: 3, fontWeight: '500' },
  saveBtn: { padding: 5 },
  saveIcon: { width: 22, height: 22, resizeMode: 'contain', tintColor: '#2D3E5E' },
  content: { marginTop: 5 },
  eventBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#8A1C27', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginBottom: 8 },
  eventBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', marginLeft: 4, letterSpacing: 0.5 },
  textContainer: { marginBottom: 10 },
  desc: { fontSize: 14, color: '#4A627A', lineHeight: 20 },
  hashtag: { color: '#8A1C27', fontWeight: 'bold' },
  readMore: { color: '#8A1C27', fontWeight: 'bold', fontSize: 14 },
  imageContainer: { width: '100%', borderRadius: 15, overflow: 'hidden', backgroundColor: '#F4F7FA', marginTop: 5 },
  dynamicMedia: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.25)' },
  eventOverlay: { position: 'absolute', bottom: 10, left: 10, right: 10, backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 12, flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 15, elevation: 5 },
  overlayRow: { flexDirection: 'row', alignItems: 'center' },
  overlayText: { color: '#2C3E50', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  footer: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: 1, borderTopColor: '#F0F4F8', paddingTop: 12, marginTop: 15 },
  icon: { width: 24, height: 24, resizeMode: 'contain' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 5 },
  countText: { fontSize: 12, fontWeight: '700', color: '#8391A1', marginLeft: 5 },
  fullscreenContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' },
  closeFullscreen: { position: 'absolute', top: 50, right: 20, zIndex: 10 },
  fullscreenMedia: { width: width, height: height * 0.8 },
});

export default VendorPosts;