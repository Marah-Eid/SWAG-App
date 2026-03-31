import React from 'react';
import { SafeAreaView } from 'react-native';
import InterestsScreenContent from '../../src/components/customer/InterestsScreen';

const InterestsScreen = () => {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
            <InterestsScreenContent />
        </SafeAreaView>
    );
};

export default InterestsScreen;