import React from 'react';
import { StyleSheet, View, Text, Image, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import type { Profile } from '../lib/mockData';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.28;

type Props = {
  profile: Profile;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

export function SwipeCard({ profile, onSwipeLeft, onSwipeRight }: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY / 4;
    })
    .onEnd((e) => {
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { damping: 20 }, () => {
          runOnJS(onSwipeRight)();
        });
      } else if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { damping: 20 }, () => {
          runOnJS(onSwipeLeft)();
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${interpolate(
          translateX.value,
          [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
          [-12, 0, 12],
          Extrapolation.CLAMP
        )}deg`,
      },
    ],
  }));

  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolation.CLAMP),
  }));

  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, cardStyle]}>
        <Image
          source={{ uri: profile.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />

        <Animated.View style={[styles.stamp, styles.likeStamp, likeStyle]}>
          <Text style={styles.likeText}>LIKE</Text>
        </Animated.View>

        <Animated.View style={[styles.stamp, styles.nopeStamp, nopeStyle]}>
          <Text style={styles.nopeText}>NOPE</Text>
        </Animated.View>

        <View style={styles.infoBox}>
          <Text style={styles.name}>
            {profile.name}, {profile.age}
          </Text>
          <Text style={styles.bio} numberOfLines={3}>
            {profile.bio}
          </Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: 320,
    height: 420,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  image: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  stamp: {
    position: 'absolute',
    top: 48,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderRadius: 8,
  },
  likeStamp: {
    left: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '-15deg' }],
  },
  nopeStamp: {
    right: 20,
    borderColor: '#F44336',
    transform: [{ rotate: '15deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#4CAF50',
    letterSpacing: 2,
  },
  nopeText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#F44336',
    letterSpacing: 2,
  },
  infoBox: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 28,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
  },
});
