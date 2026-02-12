import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Dimensions, StatusBar, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Activity, Terminal, CheckCircle2, Trophy, Globe, Clapperboard, 
  Infinity, ArrowRight, Sparkles, Sun, Moon, Cpu, Wifi
} from "lucide-react-native";
import Animated, { 
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withDelay, withSpring 
} from "react-native-reanimated";

WebBrowser.maybeCompleteAuthSession();
const { width, height } = Dimensions.get("window");

// --- THEME ENGINE ---
const THEMES = {
  light: {
    type: 'light',
    bg: ['#FDFBF7', '#F5EFE6', '#E6DCC9'], // Soft Paper / Sand
    text: '#292524',
    textMuted: '#A8A29E',
    accent: '#EA580C', // Burnt Orange
    accentGradient: ['#EA580C', '#F97316'],
    glassTint: 'light',
    glassBorder: 'rgba(234, 88, 12, 0.15)',
    iconBg: '#FFF7ED',
    glow: '#FDBA74'
  },
  dark: {
    type: 'dark',
    bg: ['#020617', '#1e1b4b', '#312e81'], // Deep Space
    text: '#F8FAFC',
    textMuted: '#64748B',
    accent: '#6366F1', // Indigo Neon
    accentGradient: ['#6366F1', '#8B5CF6'],
    glassTint: 'dark',
    glassBorder: 'rgba(99, 102, 241, 0.3)',
    iconBg: 'rgba(99, 102, 241, 0.15)',
    glow: '#4338CA'
  }
};

// --- COMPONENT: Background Dot Pattern ---
const DotPattern = ({ theme }: any) => {
  // Creating a grid of subtle dots to fill empty space
  const dots = Array.from({ length: 20 });
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <View style={styles.dotContainer}>
        {dots.map((_, i) => (
          <View key={i} style={[styles.bgDot, { backgroundColor: theme.textMuted, opacity: 0.1 }]} />
        ))}
      </View>
    </View>
  );
};

// --- COMPONENT: Floating Square (Icon Style) ---
const FloatingSquare = ({ icon: Icon, color, top, left, right, bottom, rotate, delay = 0, scale = 1, theme }: any) => {
  const floatY = useSharedValue(0);
  useEffect(() => {
    floatY.value = withDelay(delay, withRepeat(withTiming(-8, { duration: 3000 + Math.random() * 1000, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: floatY.value }, { rotate: rotate }, { scale: scale }] }));
  
  const pos: any = {};
  if (top !== undefined) pos.top = top;
  if (bottom !== undefined) pos.bottom = bottom;
  if (left !== undefined) pos.left = left;
  if (right !== undefined) pos.right = right;

  return (
    <Animated.View style={[styles.squareContainer, pos, { borderColor: theme.glassBorder, shadowColor: color }, animatedStyle]}>
      <BlurView intensity={theme.type === 'dark' ? 50 : 80} tint={theme.glassTint as any} style={styles.squareGlass}>
        <Icon size={28} color={color} />
      </BlurView>
    </Animated.View>
  );
};

// --- COMPONENT: System Status Pill (Top Filler) ---
const StatusPill = ({ theme, insets }: any) => (
  <View style={[styles.statusPillWrapper, { top: insets.top + 10 }]}>
    <BlurView intensity={40} tint={theme.glassTint as any} style={[styles.statusPill, { borderColor: theme.glassBorder }]}>
      <Cpu size={12} color={theme.accent} />
      <Animated.Text style={[styles.statusText, { color: theme.textMuted }]}>SYSTEM NOMINAL</Animated.Text>
      <View style={[styles.statusDot, { backgroundColor: theme.success || '#10b981' }]} />
    </BlurView>
  </View>
);

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  
  const [mode, setMode] = useState<'light' | 'dark'>('dark'); // Default Dark for "Tech" feel
  const activeTheme = THEMES[mode];

  const logoPulse = useSharedValue(1);
  useEffect(() => {
    logoPulse.value = withRepeat(withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, []);

  const toggleTheme = () => setMode(prev => prev === 'light' ? 'dark' : 'light');
  const animatedLogoStyle = useAnimatedStyle(() => ({ transform: [{ scale: logoPulse.value }] }));

  const onSignInPress = React.useCallback(async () => {
    try { const { createdSessionId, setActive } = await startOAuthFlow(); if (createdSessionId) setActive!({ session: createdSessionId }); } catch (err) { console.error("OAuth error", err); }
  }, [startOAuthFlow]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={mode === 'light' ? "dark-content" : "light-content"} />

      {/* 1. BACKGROUND & TEXTURE */}
      <LinearGradient colors={activeTheme.bg} style={StyleSheet.absoluteFillObject} start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} />
      <DotPattern theme={activeTheme} />
      
      {/* Ambient Glows */}
      <View style={[styles.ambientGlow, { backgroundColor: activeTheme.glow, top: -100, left: -50, opacity: 0.2 }]} />
      <View style={[styles.ambientGlow, { backgroundColor: activeTheme.glow, bottom: -100, right: -50, opacity: 0.15 }]} />

      {/* 2. TOP UI ELEMENTS */}
      <StatusPill theme={activeTheme} insets={insets} />
      
      <Pressable onPress={toggleTheme} style={[styles.themeToggle, { top: insets.top + 10, borderColor: activeTheme.glassBorder }]}>
        <BlurView intensity={50} tint={activeTheme.glassTint as any} style={styles.themeToggleGlass}>
          {mode === 'light' ? <Moon size={18} color={activeTheme.text} /> : <Sun size={18} color={activeTheme.text} />}
        </BlurView>
      </Pressable>

      {/* 3. FLOATING SQUARES (The 6 Pillars - Grid Like Layout) */}
      <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
        {/* Top Row */}
        <FloatingSquare top={height * 0.18} left={30} rotate="-10deg" delay={0} icon={Activity} color="#10B981" theme={activeTheme} />
        <FloatingSquare top={height * 0.18} right={30} rotate="10deg" delay={400} icon={Terminal} color="#6366F1" theme={activeTheme} />

        {/* Middle Row (Wider) */}
        <FloatingSquare top={height * 0.42} left={-15} rotate="5deg" delay={800} icon={Clapperboard} color="#EC4899" theme={activeTheme} />
        <FloatingSquare top={height * 0.42} right={-15} rotate="-5deg" delay={1200} icon={Globe} color="#8B5CF6" theme={activeTheme} />

        {/* Bottom Row */}
        <FloatingSquare bottom={height * 0.22} left={40} rotate="-8deg" delay={1600} icon={Trophy} color="#EF4444" theme={activeTheme} />
        <FloatingSquare bottom={height * 0.22} right={40} rotate="8deg" delay={2000} icon={CheckCircle2} color="#F59E0B" theme={activeTheme} />
      </View>

      {/* 4. CENTER & BOTTOM CONTENT */}
      <View style={[styles.content, { paddingTop: insets.top }]}>
        
        {/* LOGO (Vertically Centered roughly) */}
        <View style={styles.headerContainer}>
          <View style={styles.logoWrapper}>
             <Animated.View style={[styles.logoGradientContainer, animatedLogoStyle]}>
                <LinearGradient colors={activeTheme.accentGradient} style={styles.logoGradient}>
                  <Infinity size={60} color="white" />
                </LinearGradient>
             </Animated.View>
             <View style={[styles.logoShadow, { backgroundColor: activeTheme.accent }]} />
          </View>

          <View style={styles.textWrapper}>
            <Animated.Text style={[styles.brandTitle, { color: activeTheme.text }]}>
              InnerLoop
            </Animated.Text>
            <Animated.Text style={[styles.brandTagline, { color: activeTheme.textMuted }]}>
              OS for High Performers
            </Animated.Text>
          </View>
        </View>

        {/* LOGIN CARD */}
        <View style={styles.bottomSection}>
          <BlurView intensity={mode === 'light' ? 70 : 50} tint={activeTheme.glassTint as any} style={[styles.actionCard, { borderColor: activeTheme.glassBorder }]}>
             <View style={{ gap: 4 }}>
                <Animated.Text style={[styles.welcomeText, { color: activeTheme.text }]}>Ready to synchronize?</Animated.Text>
                <Animated.Text style={{ color: activeTheme.textMuted, fontSize: 13, textAlign: 'center' }}>Sync Fitness, Code, & Life.</Animated.Text>
             </View>
             
             <TouchableOpacity activeOpacity={0.9} onPress={onSignInPress}>
                <LinearGradient 
                  colors={activeTheme.accentGradient} 
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} 
                  style={[styles.mainButton, { shadowColor: activeTheme.accent }]}
                >
                  <Animated.Text style={styles.btnText}>Initialize System</Animated.Text>
                  <ArrowRight size={20} color="white" style={{ marginLeft: 8, opacity: 0.9 }} />
                </LinearGradient>
             </TouchableOpacity>
          </BlurView>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'space-between' },

  // Background Dots
  dotContainer: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', padding: 20, opacity: 0.5 },
  bgDot: { width: 4, height: 4, borderRadius: 2, margin: 40 },
  ambientGlow: { position: 'absolute', width: 350, height: 350, borderRadius: 175, filter: 'blur(90px)' },

  // Top Status Pill
  statusPillWrapper: { position: 'absolute', width: '100%', alignItems: 'center', zIndex: 5 },
  statusPill: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, overflow: 'hidden'
  },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  themeToggle: { position: 'absolute', right: 20, width: 40, height: 40, borderRadius: 20, overflow: 'hidden', borderWidth: 1, zIndex: 10 },
  themeToggleGlass: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Squares
  squareContainer: {
    position: 'absolute', width: 70, height: 70, borderRadius: 22, overflow: 'hidden', borderWidth: 1,
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 15, elevation: 5,
  },
  squareGlass: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  // Header
  headerContainer: { alignItems: 'center', justifyContent: 'center', flex: 1 }, // Centered in available space
  logoWrapper: { alignItems: 'center', justifyContent: 'center', height: 120 },
  logoGradientContainer: { zIndex: 2 },
  logoGradient: { width: 100, height: 100, borderRadius: 35, alignItems: 'center', justifyContent: 'center' }, // Squircle Logo
  logoShadow: {
    position: 'absolute', top: 25, width: 90, height: 90, borderRadius: 35, opacity: 0.5,
    filter: 'blur(30px)', zIndex: 1,
  },
  textWrapper: { marginTop: 20, alignItems: 'center' },
  brandTitle: { fontSize: 42, fontWeight: '900', letterSpacing: -1 },
  brandTagline: { fontSize: 14, fontWeight: '600', letterSpacing: 2, textTransform: 'uppercase', marginTop: 5 },

  // Bottom Card
  bottomSection: { padding: 24, paddingBottom: 50 },
  actionCard: { borderRadius: 28, padding: 28, overflow: 'hidden', borderWidth: 1, gap: 20 },
  welcomeText: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  mainButton: {
    height: 60, borderRadius: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8,
  },
  btnText: { color: 'white', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});