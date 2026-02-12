import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import FitnessScreen from '../screens/FitnessScreen';
import BuilderScreen from '../screens/BuilderScreen';
import TasksScreen from '../screens/TasksScreen';
import SportsScreen from '../screens/SportsScreen';
import VaultScreen from '../screens/VaultScreen';
import EntertainmentScreen from '../screens/EntertainmentScreen';

// Import Custom Dock
import { CustomTabBar } from './CustomTabBar';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, // Hum khud ka header banayenge
        tabBarStyle: { position: 'absolute' }, // Floating effect ke liye zaroori hai
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Fitness" component={FitnessScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Builder" component={BuilderScreen} />
      <Tab.Screen name="Sports" component={SportsScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Entertainment" component={EntertainmentScreen} />
    </Tab.Navigator>
  );
}