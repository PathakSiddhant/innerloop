import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";
import { COLORS } from "../lib/constants";

interface ThemedTextProps extends TextProps {
  variant?: "h1" | "h2" | "subtitle" | "body" | "caption" | "label";
  color?: string;
}

export function ThemedText({ 
  style, 
  variant = "body", 
  color, 
  ...props 
}: ThemedTextProps) {
  
  const getStyle = () => {
    switch (variant) {
      case "h1": return styles.h1;
      case "h2": return styles.h2;
      case "subtitle": return styles.subtitle;
      case "caption": return styles.caption;
      case "label": return styles.label;
      default: return styles.body;
    }
  };

  return (
    <Text 
      style={[
        getStyle(), 
        { color: color || (variant === "caption" ? COLORS.textMuted : COLORS.text) }, 
        style
      ]} 
      {...props} 
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -1,
    marginBottom: 8,
  },
  h2: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
  },
});