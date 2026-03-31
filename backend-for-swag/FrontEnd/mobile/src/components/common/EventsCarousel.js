import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88; // UI Polish: Slightly tweaked width for better peeking of the next card
const CARD_MARGIN = 15;

const EventsCarousel = ({ events = [] }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollPadding}
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH + CARD_MARGIN}
        snapToAlignment="center"
      >
        {events.map((event) => (
          // UI Polish: Wrapper added to enable crisp drop shadows on iOS/Android
          <View key={event.id} style={styles.cardWrapper}>
            <ImageBackground
              source={event.bgImage}
              style={styles.card}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.darkOverlay}>

                {/* UI Polish: Upgraded to a sleek modern badge */}
                <TouchableOpacity onPress={() => router.push('/customer/EventsCust')} style={styles.badgeContainer} activeOpacity={0.8}>
                  <Text style={styles.cardHeader}>Upcoming Event</Text>
                </TouchableOpacity>

                <View style={styles.contentRow}>

                  <TouchableOpacity onPress={() => router.push('/customer/VendorProfCust')} activeOpacity={0.8}>
                    <Image source={event.logo} style={styles.logo} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.textColumn}
                    onPress={() => router.push('/customer/VendorProfCust')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>

                    {/* --- THE FIX: Separated Phone and City --- */}
                    <View style={styles.infoRow}>
                      <Text style={styles.eventSub} numberOfLines={1}>{event.phone}</Text>
                      <Text style={styles.eventSub}> / </Text>
                      <Text style={styles.eventSub} numberOfLines={1}>{event.city}</Text>
                    </View>

                    {/* --- THE FIX: Separated Date Label and Date Value --- */}
                    <View style={styles.dateRow}>
                      <Text style={styles.eventDate}>Date: </Text>
                      <Text style={styles.eventDate}>{event.date}</Text>
                    </View>
                  </TouchableOpacity>

                </View>

                <Text style={styles.footerText} numberOfLines={2}>
                  {event.description}
                </Text>

              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
    marginBottom: 20 // UI Polish: Fixed spacing since HomeScreen now handles bottom padding
  },
  scrollPadding: {
    paddingHorizontal: 20,
    paddingBottom: 15 // Space for shadow
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 170, // UI Polish: Slightly taller for elegance
    marginRight: CARD_MARGIN,
    borderRadius: 16,
    backgroundColor: '#FFF',
    // UI Polish: Premium depth shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  card: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)', // UI Polish: Rich cinematic overlay
    borderRadius: 16,
    padding: 15,
    justifyContent: 'space-between'
  },
  badgeContainer: {
    backgroundColor: '#8A1C27', // Brand Red
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  cardHeader: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    marginTop: 5,
  },
  logo: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#FFF',
    marginRight: 15,
    borderWidth: 2,
    borderColor: '#FFFFFF', // UI Polish: Crisp white ring to pop off the dark background
    resizeMode: 'cover',
  },
  textColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 18,
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventSub: {
    color: '#E2E8F0', // UI Polish: Softer light gray for contrast
    fontSize: 12,
    fontWeight: '500',
  },
  // Added row specifically for the date alignment
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  eventDate: {
    color: '#faef21', // Keeping the vibrant yellow
    fontWeight: '700',
    fontSize: 12,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 18, // UI Polish: Better reading height
    opacity: 0.9,
  },
});

export default EventsCarousel;