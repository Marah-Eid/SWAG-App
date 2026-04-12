import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Platform,
    TouchableOpacity,
    SafeAreaView
} from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';

const CreativeSplashScreen = ({ onFinish }) => {
    const videoRef = useRef(null);

    // Animation Refs
    const introOpacity = useRef(new Animated.Value(0)).current;
    const containerOpacity = useRef(new Animated.Value(1)).current;

    // UI States
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const exitTriggered = useRef(false);

    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                });
            } catch (e) {
                console.log("Audio setup error:", e);
            }
        };

        setupAudio();

        // FAILSAFE: Force transition to the app after 8 seconds if anything hangs
        const failsafeTimer = setTimeout(() => {
            if (!exitTriggered.current) {
                triggerExit();
            }
        }, 16000);

        return () => clearTimeout(failsafeTimer);
    }, []);

    const handlePlaybackStatusUpdate = async (status) => {
        // 1. TRIGGER FADE-IN: Wait until the video is actually rendering the first frames (positionMillis > 0)
        if (status.isLoaded && status.positionMillis > 0 && !isVideoPlaying) {
            setIsVideoPlaying(true);

            const startFadeIn = () => {
                Animated.timing(introOpacity, {
                    toValue: 1,
                    duration: 500, // Faster, snappier fade-in (500ms instead of 1000ms)
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }).start();
            };

            if (Platform.OS !== 'web') {
                await SplashScreen.hideAsync();
                startFadeIn();
            } else {
                startFadeIn();
            }
        }

        // 2. TRIGGER EXIT: Exactly when the video finishes
        if (status.didJustFinish && !exitTriggered.current) {
            triggerExit();
        }

        // Handle error states
        if (status.error && !exitTriggered.current) {
            console.warn("Video playback error:", status.error);
            triggerExit();
        }
    };

    const triggerExit = () => {
        if (exitTriggered.current) return;
        exitTriggered.current = true;

        // Smooth fade out into the app
        Animated.timing(containerOpacity, {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
        }).start(() => {
            if (onFinish) onFinish();
        });
    };

    return (
        <Animated.View style={[styles.container, { opacity: containerOpacity }]}>
            <StatusBar hidden />

            <Animated.View style={[styles.fadeWrapper, { opacity: introOpacity }]}>
                <Video
                    ref={videoRef}
                    source={require('../../assets/videos/newSPLASHSCREEN.mp4')}
                    style={styles.video}
                    resizeMode={ResizeMode.COVER}
                    shouldPlay={true}
                    isLooping={false}
                    useNativeControls={false}
                    progressUpdateIntervalMillis={50} // Forces the component to check status very quickly
                    onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                />

                {/* SKIP BUTTON - Only shows when video is actually playing */}
                {isVideoPlaying && (
                    <SafeAreaView style={styles.safeArea}>
                        <View style={styles.skipWrapper}>
                            <TouchableOpacity
                                style={styles.skipButton}
                                onPress={triggerExit}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.skipText}>Skip</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                )}
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fadeWrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    video: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    skipWrapper: {
        width: '100%',
        alignItems: 'flex-end',
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingRight: 20,
    },
    skipButton: {
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    skipText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.5,
    }
});

export default CreativeSplashScreen;