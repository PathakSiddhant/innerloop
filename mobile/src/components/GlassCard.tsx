import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { COLORS } from "../lib/constants";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: "default" | "neon" | "dim";
}

export function GlassCard({ children, style, variant = "default" }: GlassCardProps) {
  // Variant Logic (Thoda alag look dene ke liye)
  const backgroundColor = 
    variant === "neon" ? "rgba(99, 102, 241, 0.1)" : // Indigo tint
    variant === "dim" ? "rgba(24, 24, 27, 0.6)" :    // Darker
    "rgba(39, 39, 42, 0.4)";                         // Default Zinc

  const borderColor = 
    variant === "neon" ? COLORS.primary : 
    COLORS.surfaceLight;

  return (
    <View style={[styles.card, { backgroundColor, borderColor }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    // Glassmorphism Hack for React Native (Shadows se depth aayegi)
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10, // Android shadow
    backdropFilter: "blur(10px)",
  },
});