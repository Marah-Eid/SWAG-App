import React from 'react';
import { Stack } from 'expo-router';
// Import the UI logic from the src folder
import EventsScreen from '../../src/components/customer/EventsScreen';

const EventsCust = () => {
  return (
    <>
      {/* Configure the header to be hidden since you have a custom header */}
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Render the actual screen component */}
      <EventsScreen />
    </>
  );
};

export default EventsCust;