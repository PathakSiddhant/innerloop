import React from 'react';
import { ClerkProvider, SignedIn, SignedOut } from '@clerk/clerk-expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native'; // <--- Navigation context handle karne ke liye
import { tokenCache } from './src/lib/tokenCache';

// Theme Context
import { ThemeProvider } from './src/lib/ThemeContext';

// Screens & Navigation
import LandingScreen from './src/screens/LandingScreen'; 
import TabNavigator from './src/navigation/TabNavigator';

// Tera Actual Clerk Key
const CLERK_PUBLISHABLE_KEY = "pk_test_cG9zc2libGUta2luZ2Zpc2gtOTAuY2xlcmsuYWNjb3VudHMuZGV2JA";

export default function App() {
  // Safety check
  if (!CLERK_PUBLISHABLE_KEY) {
    throw new Error("Bhai, Clerk Key nahi mili! Check kar .env.local mein EXPO_PUBLIC_ prefix hai ya nahi.");
  }

  return (
    <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY} 
        tokenCache={tokenCache}
    >
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          
          {/* NavigationContainer ko yahan wrap karne se 'independent={true}' ki zaroorat nahi padegi */}
          <NavigationContainer>
            
            {/* Jab user login hoga, TabNavigator dikhega */}
            <SignedIn>
              <TabNavigator />
            </SignedIn>

            {/* Jab user logout hoga, LandingScreen dikhegi */}
            <SignedOut>
              <LandingScreen />
            </SignedOut>

          </NavigationContainer>

        </SafeAreaProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
}