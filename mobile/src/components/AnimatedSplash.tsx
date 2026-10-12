import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Must match the expo-splash-screen config in app.json so the hand-off is seamless
export const SPLASH_BACKGROUND = '#1B1A45';
const LOGO_SIZE = 160;

interface AnimatedSplashProps {
  /** Becomes true once the app has what it needs to render its first screen */
  isAppReady: boolean;
}

// Takes over from the native splash screen, then zooms the logo away to reveal the app
export const AnimatedSplash: React.FC<AnimatedSplashProps> = ({ isAppReady }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const logoScale = useRef(new Animated.Value(1)).current;
  const overlayOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isAppReady || !isLogoLoaded) return;

    // The overlay is now painted identically to the native splash, so swap them
    SplashScreen.hide();

    Animated.sequence([
      // Small anticipation dip...
      Animated.timing(logoScale, {
        toValue: 0.88,
        duration: 220,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // ...then burst forward while the app fades in underneath
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 8,
          duration: 520,
          easing: Easing.bezier(0.55, 0, 0.1, 1),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 420,
          delay: 120,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => setIsVisible(false));
  }, [isAppReady, isLogoLoaded, logoScale, overlayOpacity]);

  if (!isVisible) return null;

  return (
    <Animated.View
      pointerEvents={isAppReady ? 'none' : 'auto'}
      style={[StyleSheet.absoluteFill, styles.container, { opacity: overlayOpacity }]}
    >
      <Animated.Image
        source={require('../../assets/splash-icon.png')}
        onLoadEnd={() => setIsLogoLoaded(true)}
        fadeDuration={0}
        resizeMode="contain"
        style={[styles.logo, { transform: [{ scale: logoScale }] }]}
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: SPLASH_BACKGROUND,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    elevation: 1000,
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
});
