import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    LayoutAnimation,
    UIManager,
    Animated
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { clearError } from '../../store/slices/authSlice';
import otpAPI from '../../api/otpAPI';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SignUpVendorScreen = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { error } = useSelector((state) => state.auth);

    const [role, setRole] = useState('Vendor');
    const [fullName, setFullName] = useState('');
    const [shopName, setShopName] = useState('');
    const [shopType, setShopType] = useState('');
    const [emailOrPhone, setEmailOrPhone] = useState('');
    const [password, setPassword] = useState('');

    // --- Animation Ref for the Toggle Switch ---
    const slideAnim = useRef(new Animated.Value(1)).current;

    const [expandedSection, setExpandedSection] = useState(null);
    const [selectedCategories, setSelectedCategories] = useState([]);

    const sections = [
        { id: 'parts', title: 'Car Parts', img: require('../../../assets/images/parts-icon.png'), subItems: ['Car-Parts', 'Exhaust Systems', 'Wheels & Tires', 'Glass Services'] },
        { id: 'cust', title: 'Customization', img: require('../../../assets/images/customization-icon.png'), subItems: ['Accessories & Add-ons', 'Tuning (Mechanical/Cosmetic)', 'Seat Upholstery', 'Paint & Bodywork'] },
        { id: 'autohub', title: 'Auto Hub', img: require('../../../assets/images/autohub-icon.png'), subItems: ['Car Rental', 'Agencies', 'Dealerships'] },
        { id: 'services', title: 'Pro Services', img: require('../../../assets/images/services-icon.png'), subItems: ['Maintenance (Mechanical/Electrical)', 'Car Washes', 'Gas Station (Fuel & Energy)'] }
    ];

    const toggleSection = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedSection(expandedSection === id ? null : id);
    };

    const toggleCategory = (item) => {
        setSelectedCategories(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
    };

    const showAlert = (title, message, onSuccess = null) => {
        if (Platform.OS === 'web') {
            window.alert(`${title}\n\n${message}`);
            if (onSuccess) onSuccess();
        } else {
            const buttons = onSuccess ? [{ text: 'OK', onPress: onSuccess }] : [{ text: 'OK' }];
            Alert.alert(title, message, buttons, { cancelable: false });
        }
    };

    useEffect(() => {
        if (error) {
            showAlert('Error', error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const validateForm = () => {
        if (!fullName.trim()) { showAlert('Error', 'Please enter your full name'); return false; }
        if (!shopName.trim()) { showAlert('Error', 'Please enter your shop name'); return false; }
        if (!shopType.trim()) { showAlert('Error', 'Please enter your shop/company/service type'); return false; }
        if (!emailOrPhone.trim()) { showAlert('Error', 'Please enter your email or phone number'); return false; }
        if (!password) { showAlert('Error', 'Please enter a password'); return false; }
        if (password.length < 6) { showAlert('Error', 'Password must be at least 6 characters'); return false; }
        if (selectedCategories.length === 0) { showAlert('Error', 'Please select at least one workplace category'); return false; }
        return true;
    };

    const [submitting, setSubmitting] = useState(false);

    const handleSignUp = async () => {
        if (!validateForm()) return;
        setSubmitting(true);
        const result = await otpAPI.sendOtp(emailOrPhone.trim(), 'signup');
        setSubmitting(false);
        if (!result.success) {
            showAlert('Error', result.error);
            return;
        }
        router.push({
            pathname: '/auth/verifyVendorEmail',
            params: {
                emailOrPhone: emailOrPhone.trim(),
                fullName: fullName.trim(),
                shopName: shopName.trim(),
                shopType: shopType.trim(),
                password,
                categories: JSON.stringify(selectedCategories),
            }
        });
    };

    // --- Toggle Animation Logic ---
    const handleRoleChange = (selectedRole) => {
        if (selectedRole === 'Customer' && role !== 'Customer') {
            setRole('Customer');
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start(() => {
                router.replace('/auth/SignUp');
            });
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <StatusBar style="dark" />

            {/* --- HORIZONTAL GRADIENT: 60% WHITE / 40% BLUE --- */}
            <LinearGradient
                colors={['#FFFFFF', '#F1F4F9', '#8EACC5']} // White -> Soft off-white -> Bright Brand Blue
                locations={[0, 0.6, 1]} // Anchors the white to fill the first 60% of the screen
                start={{ x: 0, y: 0 }} // Left side
                end={{ x: 1, y: 0 }}   // Right side 
                style={styles.gradientBackground}
            >
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/auth/Login')} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={28} color="#2D3E5E" />
                </TouchableOpacity>

                <View style={styles.topSection}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.createText}>Create</Text>
                        <Text style={styles.accountText}>your Account</Text>
                        <Text style={styles.subtitleText}>select your account type to continue</Text>
                    </View>
                </View>

                <View style={styles.blueCard}>
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* --- ANIMATED ROLE SWITCH TABS --- */}
                        <View style={styles.roleTabsWrapper}>
                            <Animated.View
                                style={[
                                    styles.activeSlider,
                                    {
                                        left: slideAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: ['1%', '50%'],
                                        }),
                                    },
                                ]}
                            />

                            <TouchableOpacity
                                style={styles.roleTab}
                                onPress={() => handleRoleChange('Customer')}
                                activeOpacity={0.9}
                            >
                                <Text style={[styles.roleTabText, role === 'Customer' && styles.activeRoleTabText]}>
                                    {"I'm a Customer"}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.roleTab}
                                onPress={() => handleRoleChange('Vendor')}
                                activeOpacity={0.9}
                            >
                                <Text style={[styles.roleTabText, role === 'Vendor' && styles.activeRoleTabText]}>
                                    {"I'm a Vendor"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* --- INPUTS --- */}
                        <View style={styles.inputContainer}>
                            <Image source={require('../../../assets/images/user-icon.png')} style={styles.inputIcon} resizeMode="contain" />
                            <TextInput style={styles.input} placeholder="User Name" placeholderTextColor="#8391A1" value={fullName} onChangeText={setFullName} autoCapitalize="words" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Image source={require('../../../assets/images/shop-icon.png')} style={styles.inputIcon} resizeMode="contain" />
                            <TextInput style={styles.input} placeholder="Shop Name" placeholderTextColor="#8391A1" value={shopName} onChangeText={setShopName} autoCapitalize="words" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Image source={require('../../../assets/images/shop-icon.png')} style={styles.inputIcon} resizeMode="contain" />
                            <TextInput style={styles.input} placeholder="Shop / Company / Service Type" placeholderTextColor="#8391A1" value={shopType} onChangeText={setShopType} autoCapitalize="words" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Image source={require('../../../assets/images/email-icon.png')} style={styles.inputIcon} resizeMode="contain" />
                            <TextInput style={styles.input} placeholder="Email Address / Phone Number" placeholderTextColor="#8391A1" value={emailOrPhone} onChangeText={setEmailOrPhone} keyboardType="email-address" autoCapitalize="none" />
                        </View>

                        <View style={styles.inputContainer}>
                            <Image source={require('../../../assets/images/lock-icon.png')} style={styles.inputIcon} resizeMode="contain" />
                            <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#8391A1" value={password} onChangeText={setPassword} secureTextEntry={true} autoCapitalize="none" />
                        </View>

                        {/* --- CATEGORY ACCORDION --- */}
                        <View style={styles.categorySection}>
                            <Text style={styles.categoryLabel}>Select Your Workplace Category:</Text>
                            <View style={styles.categoryContainer}>
                                {sections.map((section) => {
                                    const isActive = expandedSection === section.id;
                                    return (
                                        <View key={section.id} style={[styles.card, isActive && styles.activeCard]}>
                                            <TouchableOpacity
                                                style={styles.accordionHeader}
                                                onPress={() => toggleSection(section.id)}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.headerLeft}>
                                                    <View style={[styles.iconBg, isActive && styles.iconBgActive]}>
                                                        <Image source={section.img} style={styles.categoryImg} resizeMode="contain" />
                                                    </View>
                                                    <Text style={[styles.headerTitle, isActive && styles.activeHeaderText]}>{section.title}</Text>
                                                </View>
                                                <View style={[styles.arrowCircle, isActive && styles.activeArrowCircle]}>
                                                    <Ionicons name={isActive ? "chevron-up" : "chevron-down"} size={20} color={isActive ? "#5B7896" : "#FFF"} />
                                                </View>
                                            </TouchableOpacity>

                                            {isActive && (
                                                <View style={styles.subItemsGrid}>
                                                    {section.subItems.map((item) => {
                                                        const isSelected = selectedCategories.includes(item);
                                                        return (
                                                            <TouchableOpacity
                                                                key={item}
                                                                style={[styles.chip, isSelected && styles.chipSelected]}
                                                                onPress={() => toggleCategory(item)}
                                                                activeOpacity={0.7}
                                                            >
                                                                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>{item}</Text>
                                                                {isSelected && <Ionicons name="checkmark-done" size={16} color="#FFF" style={{ marginLeft: 6 }} />}
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <TouchableOpacity style={styles.continueButton} onPress={handleSignUp} disabled={submitting} activeOpacity={0.8}>
                            <Text style={styles.continueButtonText}>{submitting ? 'Sending...' : 'Continue'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gradientBackground: { flex: 1 },
    topSection: { paddingTop: 80, paddingBottom: 30 },
    backButton: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, justifyContent: 'center', zIndex: 10 },
    headerContainer: { alignItems: 'center' },
    createText: { fontSize: 28, fontWeight: '700', color: '#2D3E5E', lineHeight: 32 },
    accountText: { fontSize: 28, fontWeight: '800', color: '#8A1C27', lineHeight: 32, marginBottom: 8 },
    subtitleText: { fontSize: 13, color: '#8391A1', fontWeight: '500' },

    blueCard: {
        flex: 1,
        backgroundColor: '#5B7896',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 15,
    },
    scrollContent: { paddingHorizontal: 25, paddingTop: 30, paddingBottom: 60 },

    // ANIMATED SWITCH STYLES
    roleTabsWrapper: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 20,
        padding: 4,
        height: 55,
        marginBottom: 25,
        position: 'relative',
    },
    activeSlider: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        width: '49%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    roleTab: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    roleTabText: { fontSize: 14, color: '#FFFFFF', fontWeight: '600' },
    activeRoleTabText: { color: '#5B7896', fontWeight: '800' },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        paddingHorizontal: 20,
        height: 55,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    inputIcon: { width: 20, height: 20, marginRight: 12, tintColor: '#5B7896' },
    input: { flex: 1, fontSize: 14, color: '#2D3E5E', fontWeight: '500' },

    categorySection: { marginTop: 15, marginBottom: 20 },
    categoryLabel: { color: '#FFF', fontSize: 15, fontWeight: '700', marginBottom: 15, marginLeft: 5 },
    categoryContainer: { marginBottom: 5 },

    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 12,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    activeCard: { backgroundColor: '#4A627A', borderColor: '#FFF', borderWidth: 1 },
    accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 5 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    iconBg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    iconBgActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
    categoryImg: { width: 24, height: 24 },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#2D3E5E' },
    activeHeaderText: { color: '#FFF' },
    arrowCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F4F9', justifyContent: 'center', alignItems: 'center', marginRight: 5 },
    activeArrowCircle: { backgroundColor: 'rgba(255,255,255,0.2)' },

    subItemsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 5, paddingBottom: 10, paddingTop: 15, gap: 10 },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E2E8F0'
    },
    chipSelected: { backgroundColor: '#2D3E5E', borderColor: '#2D3E5E' },
    chipText: { fontSize: 13, color: '#5B7896', fontWeight: '600' },
    chipTextSelected: { color: '#FFF' },

    continueButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 30,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    continueButtonText: { color: '#800C1F', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
});

export default SignUpVendorScreen;