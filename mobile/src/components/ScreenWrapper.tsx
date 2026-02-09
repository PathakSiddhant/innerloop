import React from "react";
import { View, StyleSheet, ViewStyle, StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS } from "../lib/constants";

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  noPadding?: boolean;
}

export function ScreenWrapper({ children, style, noPadding = false }: ScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={[styles.content, !noPadding && styles.padding, style]}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  padding: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});