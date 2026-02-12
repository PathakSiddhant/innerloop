import React from "react";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import { COLORS } from "../lib/constants";

interface MetricRingProps {
  radius?: number;
  stroke?: number;
  progress: number; // 0 to 1
  color?: string;
  icon?: React.ReactNode;
}

export function MetricRing({
  radius = 40,
  stroke = 8,
  progress,
  color = COLORS.primary,
  icon,
}: MetricRingProps) {
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <View style={{ width: radius * 2, height: radius * 2, alignItems: 'center', justifyContent: 'center' }}>
      <Svg height={radius * 2} width={radius * 2} viewBox={`0 0 ${radius * 2} ${radius * 2}`}>
        <G rotation="-90" origin={`${radius}, ${radius}`}>
          {/* Background Circle */}
          <Circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke={COLORS.surfaceLight}
            strokeWidth={stroke}
          />
          {/* Progress Circle */}
          <Circle
            cx={radius}
            cy={radius}
            r={normalizedRadius}
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      {/* Icon in Center */}
      {icon && <View style={{ position: 'absolute' }}>{icon}</View>}
    </View>
  );
}