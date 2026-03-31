import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, LayoutAnimation, Platform, UIManager, ImageBackground, Alert, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { saveInterests } from '../../store/slices/customerSlice';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const InterestsScreenContent = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [expandedSection, setExpandedSection] = useState(null);
    const [selectedInterests, setSelectedInterests] = useState([]);
    const [saving, setSaving] = useState(false);

    const sections = [
        {
            id: 'parts',
            title: 'Car Parts',
            img: require('../../../assets/images/parts-icon.png'),
            subItems: ['Car-Parts', 'Exhaust Systems', 'Wheels & Tires', 'Glass Services']
        },
        {
            id: 'cust',
            title: 'Customization',
            img: require('../../../assets/images/customization-icon.png'),
            subItems: ['Accessories & Add-ons', 'Tuning', 'Seat Upholstery', 'Paint & Bodywork']
        },
        {
            id: 'autohub',
            title: 'Auto Hub',
            img: require('../../../assets/images/autohub-icon.png'),
            subItems: ['Car Rental', 'Agencies', 'Dealerships']
        },
        {
            id: 'services',
            title: 'Pro Services',
            img: require('../../../assets/images/services-icon.png'),
            subItems: ['Maintenance', 'Car Washes', 'Gas Station']
        }
    ];

    const navigateToHome = () => {
        router.replace('/customer/HomeCust');
    };

    const handleDonePress = async () => {
        if (selectedInterests.length === 0) {
            if (Platform.OS === 'web') {
                window.alert("Please select at least one interest, or press 'skip'.");
            } else {
                Alert.alert("Personalize your feed", "Please select at least one interest to help us show you the best content, or press 'skip'.");
            }
            return;
        }
        setSaving(true);
        // Save interests to backend (best effort - don't block navigation on failure)
        await dispatch(saveInterests(selectedInterests));
        setSaving(false);
        navigateToHome();
    };

    const toggleSection = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === id ? null : id);
    };

    const toggleInterest = (item) => {
        setSelectedInterests(prev =>
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    return (
        <ImageBackground
            source={require('../../../assets/images/SWAGBLUR.png')}
            style={styles.background}
            resizeMode="cover"
            blurRadius={10}
        >
            <StatusBar barStyle="light-content" />
            <View style={styles.overlay}>

                {/* Header Section */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={navigateToHome} activeOpacity={0.7} style={styles.skipBtn}>
                        <Text style={styles.skipText}>Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.doneBtn, selectedInterests.length > 0 && styles.doneBtnActive]}
                        onPress={handleDonePress}
                        disabled={saving}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.doneText}>{saving ? 'Saving...' : 'Done'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.mainTitle}>What are you{"\n"}interested in?</Text>
                    <Text style={styles.subTitle}>Select categories to customize your feed</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {sections.map((section) => {
                        const isActive = expandedSection === section.id;
                        return (
                            <View key={section.id} style={[styles.card, isActive && styles.activeCard]}>
                                <TouchableOpacity
                                    style={styles.accordionHeader}
                                    onPress={() => toggleSection(section.id)}
                                    activeOpacity={1}
                                >
                                    <View style={styles.headerLeft}>
                                        <View style={[styles.imgCircle, isActive && styles.activeImgCircle]}>
                                            <Image source={section.img} style={styles.categoryImg} resizeMode="contain" />
                                        </View>
                                        <Text style={[styles.headerTitle, isActive && styles.activeHeaderText]}>{section.title}</Text>
                                    </View>
                                    <View style={[styles.arrowCircle, isActive && styles.activeArrowCircle]}>
                                        <Ionicons
                                            name={isActive ? "chevron-up" : "chevron-down"}
                                            size={18}
                                            color={isActive ? "#5B7896" : "#FFFFFF"}
                                        />
                                    </View>
                                </TouchableOpacity>

                                {isActive && (
                                    <View style={styles.subItemsGrid}>
                                        {section.subItems.map((item) => {
                                            const isSelected = selectedInterests.includes(item);
                                            return (
                                                <TouchableOpacity
                                                    key={item}
                                                    style={[styles.chip, isSelected && styles.chipSelected]}
                                                    onPress={() => toggleInterest(item)}
                                                    activeOpacity={0.8}
                                                >
                                                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item}</Text>
                                                    {isSelected && <Ionicons name="checkmark-circle" size={16} color="#FFF" style={{ marginLeft: 6 }} />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                )}
                            </View>
                        );
                    })}
                </ScrollView>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    background: { flex: 1 },
    overlay: { flex: 1, backgroundColor: 'rgba(45, 62, 94, 0.4)' }, // Brand Navy translucent tint
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 50 : 30,
        paddingBottom: 10
    },
    skipBtn: { padding: 10 },
    skipText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', opacity: 0.8 },
    doneBtn: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    doneBtnActive: {
        backgroundColor: '#8A1C27', // Brand Red
        borderColor: '#8A1C27',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    doneText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

    titleContainer: { paddingHorizontal: 30, marginVertical: 30 },
    mainTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#FFFFFF',
        textAlign: 'center',
        lineHeight: 38,
    },
    subTitle: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        marginTop: 10,
        opacity: 0.8,
        fontWeight: '500'
    },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
    card: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 25,
        marginBottom: 16,
        padding: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
    },
    activeCard: {
        backgroundColor: '#5B7896', // Brand Navy
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    imgCircle: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F4F9',
        justifyContent: 'center', alignItems: 'center', marginRight: 15
    },
    activeImgCircle: { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    categoryImg: { width: 24, height: 24 },

    headerTitle: { fontSize: 18, fontWeight: '800', color: '#2D3E5E' },
    activeHeaderText: { color: '#FFF' },

    arrowCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#5B7896',
        justifyContent: 'center',
        alignItems: 'center'
    },
    activeArrowCircle: { backgroundColor: '#FFF' },

    subItemsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 20,
        paddingBottom: 10,
        gap: 10
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F4F9',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    chipSelected: {
        backgroundColor: '#8A1C27', // Brand Red
        borderColor: '#8A1C27'
    },
    chipText: { fontSize: 13, color: '#5B7896', fontWeight: '700' },
    chipTextSelected: { color: '#FFF' },
});

export default InterestsScreenContent;