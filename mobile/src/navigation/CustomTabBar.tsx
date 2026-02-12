import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BlurView } from 'expo-blur';
import { 
  Home, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Trophy, 
  Globe, 
  Clapperboard 
} from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming 
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/ThemeContext';

// Helper function outside component to avoid re-creation on every render
const getIcon = (name: string, color: string, size: number) => {
  switch (name) {
    case 'Home': return <Home size={size} color={color} />;
    case 'Fitness': return <Activity size={size} color={color} />;
    case 'Builder': return <Terminal size={size} color={color} />;
    case 'Tasks': return <CheckCircle2 size={size} color={color} />;
    case 'Sports': return <Trophy size={size} color={color} />;
    case 'Vault': return <Globe size={size} color={color} />;
    case 'Entertainment': return <Clapperboard size={size} color={color} />;
    default: return <Home size={size} color={color} />;
  }
};

const TabIcon = ({ name, isFocused }: { name: string; isFocused: boolean }) => {
  const { colors } = useTheme();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withTiming(isFocused ? 1.1 : 0.9, { duration: 250 }) },
      { translateY: withTiming(isFocused ? -4 : 0, { duration: 250 }) }
    ],
    opacity: withTiming(isFocused ? 1 : 0.6, { duration: 250 })
  }));

  const dotStyle = useAnimatedStyle(() => ({
    opacity: withTiming(isFocused ? 1 : 0, { duration: 200 }),
    transform: [{ scale: withTiming(isFocused ? 1 : 0, { duration: 200 }) }]
  }));

  const color = isFocused ? colors.activeIcon : colors.inactiveIcon;

  return (
    <View style={styles.iconWrapper}>
      <Animated.View style={animatedStyle}>
        {getIcon(name, color, 22)}
      </Animated.View>
      <Animated.View style={[styles.activeDot, { backgroundColor: colors.primary }, dotStyle]} />
    </View>
  );
};

// Fixed: 'descriptors' removed from arguments to fix unused variable error
export function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { theme, colors } = useTheme();

  return (
    <View style={[
      styles.container, 
      { 
        bottom: Platform.OS === 'ios' ? insets.bottom : 24, 
        shadowColor: colors.primary 
      }
    ]}>
      <BlurView 
        intensity={theme === 'dark' ? 40 : 90} 
        tint={theme === 'dark' ? "dark" : "light"} 
        style={[styles.blurContainer, { borderColor: colors.glassBorder }]}
      >
        <View style={[
          styles.tabRow, 
          { backgroundColor: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.5)' }
        ]}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            
            const onPress = () => {
              const event = navigation.emit({ 
                type: 'tabPress', 
                target: route.key, 
                canPreventDefault: true 
              });
              
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                activeOpacity={1}
                style={styles.tabButton}
              >
                <TabIcon name={route.name} isFocused={isFocused} />
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', 
    left: 16, 
    right: 16, 
    alignItems: 'center',
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 20, 
    elevation: 10,
  },
  blurContainer: { 
    borderRadius: 24, 
    overflow: 'hidden', 
    borderWidth: 1, 
    width: '100%' 
  },
  tabRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingVertical: 14, 
    paddingHorizontal: 8 
  },
  tabButton: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: 40 
  },
  iconWrapper: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100%' 
  },
  activeDot: { 
    position: 'absolute', 
    bottom: -6, 
    width: 4, 
    height: 4, 
    borderRadius: 2 
  },
});