import React from 'react';
import { SafeAreaView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
// Import from your specific src commonScreens folder
import ChattingScreenContent from '../../src/components/commonScreens/ChattingScreen';

const ChattingScreen = () => {
    const { userName } = useLocalSearchParams();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F1F4F9' }}>
            <ChattingScreenContent userName={userName || "User"} />
        </SafeAreaView>
    );
};

export default ChattingScreen;