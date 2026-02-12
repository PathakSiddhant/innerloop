import React from 'react';
import { View, Text } from 'react-native';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { ThemedText } from '../components/ThemedText';

export default function SportsScreen() {
  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText variant="h1">Fitness Bio-Core</ThemedText>
        <ThemedText>Coming Soon...</ThemedText>
      </View>
    </ScreenWrapper>
  );
}