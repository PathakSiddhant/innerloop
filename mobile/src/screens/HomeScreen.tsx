import React, { useEffect, useState } from "react";
import { View, ScrollView, RefreshControl, TouchableOpacity, StyleSheet } from "react-native";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { ThemedText } from "../components/ThemedText";
import { GlassCard } from "../components/GlassCard";
import { MetricRing } from "../components/MetricRing";
import { COLORS, THEME_PALETTE } from "../lib/constants";
import { api } from "../lib/api";
import { Footprints, Flame, CheckCircle2, LogOut, Sun, Moon } from "lucide-react-native";
import { useClerk } from "@clerk/clerk-expo";
import { useTheme } from "../lib/ThemeContext";

export default function HomeScreen() {
  const { signOut } = useClerk();
  const { theme, toggleTheme, colors } = useTheme();
  
  // Safe Fallback: Agar colors load nahi hue toh default use karo
  const safeColors = colors || THEME_PALETTE['dark'];

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      // API call failure shouldn't crash UI
      const res = await api.getDashboard("user_2s..."); 
      if (res) setData(res);
    } catch (e) {
      console.log("Offline Mode or API Error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: safeColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ScreenWrapper noPadding style={{ backgroundColor: safeColors.background }}>
      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={safeColors.primary} />}
      >
        <View style={styles.header}>
          <View>
            <ThemedText variant="caption" color={safeColors.textMuted}>MONDAY, 24 FEB</ThemedText>
            <ThemedText variant="h1" color={safeColors.text}>Good Morning,</ThemedText>
            <ThemedText variant="h2" color={safeColors.primary}>Siddhant</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
             <TouchableOpacity onPress={toggleTheme} style={[styles.circleBtn, { backgroundColor: safeColors.surface, borderColor: safeColors.glassBorder }]}>
               {theme === 'light' ? <Moon size={20} color={safeColors.text} /> : <Sun size={20} color={safeColors.text} />}
             </TouchableOpacity>
             <TouchableOpacity onPress={() => signOut()} style={[styles.circleBtn, { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: '#ef4444' }]}>
                <LogOut size={20} color="#ef4444" />
             </TouchableOpacity>
          </View>
        </View>

        {/* Static UI will render even if API fails */}
        <ThemedText variant="label" style={{ marginBottom: 12, color: COLORS.fitness }}>Bio-Core Status</ThemedText>
        <GlassCard style={{ flexDirection: "row", justifyContent: "space-around", padding: 20, backgroundColor: safeColors.surface }}>
            <MetricRing progress={0.7} color={COLORS.fitness} icon={<Footprints size={18} color={COLORS.fitness} />} />
            <MetricRing progress={0.4} color={COLORS.sports} icon={<Flame size={18} color={COLORS.sports} />} />
        </GlassCard>

        <ThemedText variant="label" style={{ marginBottom: 12, marginTop: 25, color: COLORS.tasks }}>Daily Directives</ThemedText>
        <GlassCard style={{ backgroundColor: safeColors.surface, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 15 }}>
          <CheckCircle2 size={24} color={COLORS.tasks} />
          <ThemedText color={safeColors.text}>You have {data?.tasksCount || 0} tasks pending</ThemedText>
        </GlassCard>

      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 30, marginTop: 40 },
  circleBtn: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1 }
});