import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  View, ScrollView, RefreshControl, TouchableOpacity, 
  Modal, TextInput, StyleSheet, Dimensions, Platform, ActivityIndicator, Text 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Flame, Dumbbell, Utensils, Droplets, Footprints, Scale, 
  X, Activity, Moon, Sun, Calendar, Plus, Minus, ChevronRight, Edit2, Check
} from "lucide-react-native";

import { ScreenWrapper } from "../components/ScreenWrapper";
import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../lib/ThemeContext";
import { api } from "../lib/api";
import { FitnessData, FoodItem, WorkoutSession } from "../lib/types";

const { width } = Dimensions.get("window");
// TODO: Replace with real user ID from Auth context
const TEST_USER_ID = "user_2s..."; 

// --- HELPER: Date Formatter ---
const formatDateKey = (date: Date) => date.toISOString().split('T')[0];

export default function FitnessScreen() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate] = useState(new Date());
  
  // Main Data State
  const [data, setData] = useState<FitnessData | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  // --- API CALLS ---
  const fetchData = React.useCallback(async () => {
    try {
      const res = await api.getFitness(TEST_USER_ID, dateKey);
      if (res) setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- AUTO SAVE LOGIC ---
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const updateLocal = (updates: Partial<FitnessData>) => {
    if (!data) return;
    
    // 1. Immediate UI Update
    const newData = { ...data, ...updates };
    setData(newData);
    
    // 2. Debounce API Call (1 second delay)
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    
    saveTimeout.current = setTimeout(async () => {
      console.log("💾 Auto-Saving Data...");
      try {
        await api.updateFitness(TEST_USER_ID, dateKey, newData);
        console.log("✅ Data Saved!");
      } catch (err) {
        console.error("❌ Save Failed:", err);
      }
    }, 1000);
  };

  // Calculations
  const totalMacros = data?.meals?.reduce((acc, m) => ({
    p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f, cals: acc.cals + m.cals
  }), { p: 0, c: 0, f: 0, cals: 0 }) || { p:0, c:0, f:0, cals:0 };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
        <ThemedText style={{ marginTop: 10 }}>Loading Fitness OS...</ThemedText>
      </View>
    );
  }

  return (
    <ScreenWrapper noPadding style={{ backgroundColor: colors.background }}>
      {/* HEADER BACKGROUND GRADIENT */}
      <LinearGradient
        colors={theme === 'dark' ? ['rgba(168, 85, 247, 0.15)', 'transparent'] : ['rgba(168, 85, 247, 0.05)', 'transparent']}
        style={[StyleSheet.absoluteFill, { height: 300 }]}
      />

      <ScrollView 
        contentContainerStyle={{ padding: 20, paddingBottom: 120, paddingTop: insets.top + 10 }} // Extra padding top
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={colors.primary} />}
        showsVerticalScrollIndicator={false}
      >
        
        {/* --- HEADER --- */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 }}>
          <View>
            <ThemedText style={{ fontSize: 12, fontWeight: '800', letterSpacing: 1, color: colors.primary, textTransform: 'uppercase' }}>
              Bio-Core v1.0
            </ThemedText>
            <ThemedText variant="h1" style={{ fontSize: 32, lineHeight: 40 }}>Fitness</ThemedText>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
             <TouchableOpacity 
                onPress={() => updateLocal({ isRestDay: !data?.isRestDay })}
                style={[styles.iconBtn, { backgroundColor: data?.isRestDay ? '#10b981' : colors.surface }]}
             >
                {data?.isRestDay ? <Moon size={20} color="white"/> : <Sun size={20} color={colors.text}/>}
             </TouchableOpacity>
          </View>
        </View>

        {/* --- MAIN GRID --- */}
        <View style={{ gap: 16 }}>
          
          {/* 1. HERO: STREAK & CALORIES */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
             {/* Streak Card */}
             <View style={[styles.card, { flex: 1, backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderColor: colors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                   <Flame size={20} color="#f97316" fill="#f97316" />
                   <ThemedText style={{ fontWeight: '700', fontSize: 12, color: colors.textSecondary }}>STREAK</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 36, fontWeight: '900' }}>3 <ThemedText style={{ fontSize: 14, color: colors.textSecondary }}>days</ThemedText></ThemedText>
             </View>

             {/* Calories Card */}
             <TouchableOpacity 
                onPress={() => setActiveModal('diet')}
                activeOpacity={0.8}
                style={[styles.card, { flex: 1, backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderColor: colors.border }]}
             >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                   <Utensils size={20} color="#10b981" />
                   <ThemedText style={{ fontWeight: '700', fontSize: 12, color: colors.textSecondary }}>CALORIES</ThemedText>
                </View>
                <ThemedText style={{ fontSize: 36, fontWeight: '900' }}>{Math.round(totalMacros.cals)}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>
                   Goal: {data?.macroGoal?.cals} kcal
                </ThemedText>
                
                {/* Progress Bar */}
                <View style={{ height: 4, backgroundColor: colors.surfaceHighlight, marginTop: 8, borderRadius: 2 }}>
                   <View style={{ width: `${Math.min((totalMacros.cals / (data?.macroGoal?.cals || 1)) * 100, 100)}%`, height: '100%', backgroundColor: '#10b981', borderRadius: 2 }} />
                </View>
             </TouchableOpacity>
          </View>

          {/* 2. ACTIVITY: STEPS (Large Card) */}
          <TouchableOpacity 
             onPress={() => setActiveModal('steps')}
             activeOpacity={0.8}
             style={[styles.card, { backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderColor: colors.border }]}
          >
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                   <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <Footprints size={20} color="#3b82f6" />
                      <ThemedText style={{ fontWeight: '700', fontSize: 12, color: colors.textSecondary }}>STEPS</ThemedText>
                   </View>
                   <ThemedText style={{ fontSize: 42, fontWeight: '900', letterSpacing: -1 }}>{data?.stepCount}</ThemedText>
                   <ThemedText style={{ fontSize: 13, color: colors.textSecondary, fontWeight: '600' }}>Target: {data?.stepGoal}</ThemedText>
                </View>
                {/* Visual Circle (CSS Only) */}
                <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 6, borderColor: colors.surfaceHighlight, alignItems: 'center', justifyContent: 'center' }}>
                   <View style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 6, borderColor: '#3b82f6', position: 'absolute', opacity: 0.8, transform: [{rotate: '45deg'}] }} />
                   <Footprints size={20} color={colors.textSecondary} />
                </View>
             </View>
          </TouchableOpacity>

          {/* 3. ROW: WATER & WORKOUT */}
          <View style={{ flexDirection: 'row', gap: 16 }}>
             
             {/* Water */}
             <TouchableOpacity 
                onPress={() => setActiveModal('water')}
                style={[styles.card, { flex: 1, backgroundColor: '#3b82f6', borderColor: '#3b82f6' }]}
             >
                <Droplets size={24} color="white" style={{ marginBottom: 12 }} />
                <ThemedText style={{ fontSize: 28, fontWeight: '900', color: 'white' }}>{data?.waterIntake}</ThemedText>
                <ThemedText style={{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>/ {data?.waterGoal} ml</ThemedText>
             </TouchableOpacity>

             {/* Workout */}
             <TouchableOpacity 
                onPress={() => setActiveModal('workout')}
                style={[styles.card, { flex: 1, backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderColor: colors.border }]}
             >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                   <Dumbbell size={24} color="#a855f7" />
                   <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: data?.sessions?.length ? '#a855f7' : colors.surfaceHighlight }} />
                </View>
                <ThemedText style={{ fontSize: 18, fontWeight: '800' }}>Workouts</ThemedText>
                <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                   {data?.sessions?.length || 0} Sessions
                </ThemedText>
             </TouchableOpacity>
          </View>

          {/* 4. WEIGHT */}
          <TouchableOpacity 
             onPress={() => setActiveModal('weight')}
             style={[styles.card, { backgroundColor: theme === 'dark' ? '#18181b' : '#fff', borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
          >
             <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ padding: 10, backgroundColor: 'rgba(236, 72, 153, 0.1)', borderRadius: 12 }}>
                   <Scale size={20} color="#ec4899" />
                </View>
                <View>
                   <ThemedText style={{ fontWeight: '700' }}>Body Weight</ThemedText>
                   <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Target: {data?.targetWeight || '--'} kg</ThemedText>
                </View>
             </View>
             <ThemedText style={{ fontSize: 24, fontWeight: '900' }}>{data?.bodyWeight || '--'} <ThemedText style={{ fontSize: 14, color: colors.textSecondary }}>kg</ThemedText></ThemedText>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* ================= MODALS ================= */}

      {/* 1. WATER MODAL */}
      <BottomModal visible={activeModal === 'water'} onClose={() => setActiveModal(null)} title="Hydration">
         <View style={{ padding: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
               <ThemedText style={{ fontSize: 60, fontWeight: '900', color: '#3b82f6' }}>{data?.waterIntake}</ThemedText>
               <ThemedText style={{ fontSize: 16, color: colors.textSecondary }}>ml consumed</ThemedText>
            </View>

            {/* Quick Add Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 30 }}>
               {[250, 500, 750].map(amt => (
                  <TouchableOpacity key={amt} onPress={() => updateLocal({ waterIntake: (data?.waterIntake || 0) + amt })} style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight }]}>
                     <Plus size={16} color={colors.text} />
                     <ThemedText style={{ fontWeight: '700' }}>{amt}ml</ThemedText>
                  </TouchableOpacity>
               ))}
            </View>

            {/* Edit Goal */}
            <View style={{ padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
               <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>DAILY GOAL (ML)</ThemedText>
               <TextInput 
                  style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}
                  keyboardType="numeric"
                  value={String(data?.waterGoal || 3000)}
                  onChangeText={(t) => updateLocal({ waterGoal: Number(t) })}
               />
            </View>
            
            <TouchableOpacity onPress={() => updateLocal({ waterIntake: 0 })} style={{ alignItems: 'center', marginTop: 20 }}>
               <ThemedText style={{ color: '#ef4444', fontWeight: '600' }}>Reset Counter</ThemedText>
            </TouchableOpacity>
         </View>
      </BottomModal>

      {/* 2. STEPS MODAL */}
      <BottomModal visible={activeModal === 'steps'} onClose={() => setActiveModal(null)} title="Activity">
         <View style={{ padding: 20 }}>
            <View style={{ alignItems: 'center', marginBottom: 30 }}>
               <Footprints size={50} color="#10b981" style={{ marginBottom: 10 }} />
               <ThemedText style={{ fontSize: 60, fontWeight: '900', color: colors.text }}>{data?.stepCount}</ThemedText>
               <ThemedText style={{ fontSize: 16, color: colors.textSecondary }}>steps walked</ThemedText>
            </View>

            {/* Manual Entry */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
               <TouchableOpacity onPress={() => updateLocal({ stepCount: Math.max(0, (data?.stepCount||0) - 100) })} style={[styles.iconBtn, { backgroundColor: colors.surfaceHighlight }]}>
                  <Minus size={24} color={colors.text} />
               </TouchableOpacity>
               <View style={{ flex: 1, backgroundColor: colors.surfaceHighlight, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}>
                  <TextInput 
                     style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, textAlign: 'center', width: '100%' }}
                     keyboardType="numeric"
                     value={String(data?.stepCount || 0)}
                     onChangeText={(t) => updateLocal({ stepCount: Number(t) })}
                  />
               </View>
               <TouchableOpacity onPress={() => updateLocal({ stepCount: (data?.stepCount||0) + 100 })} style={[styles.iconBtn, { backgroundColor: colors.primary }]}>
                  <Plus size={24} color="white" />
               </TouchableOpacity>
            </View>

            {/* Edit Goal */}
            <View style={{ padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
               <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>DAILY STEP GOAL</ThemedText>
               <TextInput 
                  style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}
                  keyboardType="numeric"
                  value={String(data?.stepGoal || 10000)}
                  onChangeText={(t) => updateLocal({ stepGoal: Number(t) })}
               />
            </View>
         </View>
      </BottomModal>

      {/* 3. DIET MODAL */}
      <BottomModal visible={activeModal === 'diet'} onClose={() => setActiveModal(null)} title="Nutrition">
         <DietView 
            data={data} 
            updateLocal={updateLocal} 
            colors={colors} 
         />
      </BottomModal>

      {/* 4. WORKOUT MODAL */}
      <BottomModal visible={activeModal === 'workout'} onClose={() => setActiveModal(null)} title="Workout Lab">
         <WorkoutView 
            sessions={data?.sessions || []} 
            onSave={(s: WorkoutSession) => updateLocal({ sessions: [...(data?.sessions || []), s] })} 
            colors={colors}
         />
      </BottomModal>

      {/* 5. WEIGHT MODAL */}
      <BottomModal visible={activeModal === 'weight'} onClose={() => setActiveModal(null)} title="Body Weight">
         <View style={{ padding: 20 }}>
            <View style={{ flexDirection: 'row', gap: 15 }}>
               <View style={{ flex: 1, padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
                  <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>CURRENT (KG)</ThemedText>
                  <TextInput 
                     style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
                     keyboardType="numeric"
                     placeholder="0.0"
                     onSubmitEditing={(e) => updateLocal({ bodyWeight: parseFloat(e.nativeEvent.text) })}
                  />
               </View>
               <View style={{ flex: 1, padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
                  <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 8 }}>TARGET (KG)</ThemedText>
                  <TextInput 
                     style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }}
                     keyboardType="numeric"
                     placeholder="0.0"
                     value={String(data?.targetWeight || '')}
                     onChangeText={(t) => updateLocal({ targetWeight: parseFloat(t) })}
                  />
               </View>
            </View>
         </View>
      </BottomModal>

    </ScreenWrapper>
  );
}

// --- SUB COMPONENTS ---

const BottomModal = ({ visible, onClose, title, children }: any) => {
   const { colors, theme } = useTheme();
   return (
      <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme === 'dark' ? '#09090b' : '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, height: '85%', overflow: 'hidden' }}>
               <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.border }}>
                  <ThemedText variant="h2" style={{ marginBottom: 0, fontSize: 24 }}>{title}</ThemedText>
                  <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: colors.surfaceHighlight, borderRadius: 20 }}>
                     <X size={20} color={colors.text} />
                  </TouchableOpacity>
               </View>
               <ScrollView contentContainerStyle={{ paddingBottom: 50 }}>{children}</ScrollView>
            </View>
         </View>
      </Modal>
   );
};

const DietView = ({ data, updateLocal, colors }: any) => {
   const [name, setName] = useState('');
   const [cals, setCals] = useState('');
   
   return (
      <View style={{ padding: 20, gap: 20 }}>
         {/* Goal Setter */}
         <View style={{ padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16, marginBottom: 10 }}>
             <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 5 }}>CALORIE GOAL</ThemedText>
             <TextInput 
                style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }} 
                keyboardType="numeric"
                value={String(data?.macroGoal?.cals || 2500)}
                onChangeText={(t) => updateLocal({ macroGoal: { ...data.macroGoal, cals: Number(t) } })}
             />
         </View>

         {/* Add Food */}
         <View style={{ gap: 10 }}>
            <ThemedText variant="subtitle">Add Meal</ThemedText>
            <TextInput placeholder="Meal Name (e.g. Eggs)" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={name} onChangeText={setName} />
            <TextInput placeholder="Calories" placeholderTextColor={colors.textSecondary} keyboardType="numeric" style={[styles.input, { color: colors.text, borderColor: colors.border }]} value={cals} onChangeText={setCals} />
            <TouchableOpacity 
               onPress={() => {
                  if(name && cals) {
                     const m: FoodItem = { id: Math.random().toString(), name, cals: Number(cals), p: 0, c: 0, f: 0 };
                     updateLocal({ meals: [...(data?.meals || []), m] });
                     setName(''); setCals('');
                  }
               }}
               style={{ backgroundColor: '#10b981', padding: 15, borderRadius: 12, alignItems: 'center' }}
            >
               <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Log Food</ThemedText>
            </TouchableOpacity>
         </View>

         {/* History */}
         <View style={{ gap: 10 }}>
            <ThemedText variant="subtitle">Today&apos;s Logs</ThemedText>
            {data?.meals?.map((m: FoodItem, i: number) => (
               <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 12, alignItems: 'center' }}>
                  <View>
                     <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>{m.name}</ThemedText>
                     <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>{m.cals} kcal</ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => updateLocal({ meals: data.meals.filter((item: FoodItem) => item.id !== m.id) })}>
                     <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
               </View>
            ))}
         </View>
      </View>
   );
};

const WorkoutView = ({ sessions, onSave, colors }: any) => {
   const [name, setName] = useState('');
   
   return (
      <View style={{ padding: 20 }}>
         <TextInput 
            placeholder="Session Name (e.g. Push Day)" 
            placeholderTextColor={colors.textSecondary} 
            style={[styles.input, { color: colors.text, borderColor: colors.border, marginBottom: 15 }]} 
            value={name} 
            onChangeText={setName} 
         />
         <TouchableOpacity 
            onPress={() => {
               if(name) {
                  onSave({ id: Math.random().toString(), name, startTime: Date.now(), exercises: [] });
                  setName('');
               }
            }}
            style={{ backgroundColor: '#a855f7', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 30 }}
         >
            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Log Session</ThemedText>
         </TouchableOpacity>

         {sessions.map((s: any, i: number) => (
            <View key={i} style={{ padding: 15, borderLeftWidth: 4, borderColor: '#a855f7', backgroundColor: colors.surfaceHighlight, marginBottom: 10, borderRadius: 8 }}>
               <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>{s.name}</ThemedText>
               <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>{new Date(s.startTime).toLocaleTimeString()}</ThemedText>
            </View>
         ))}
      </View>
   );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 20, borderRadius: 24, borderWidth: 1 },
  iconBoxOrange: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(249, 115, 22, 0.1)', justifyContent: 'center', alignItems: 'center' },
  iconBoxPurple: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(168, 85, 247, 0.1)', justifyContent: 'center', alignItems: 'center' },
  iconBoxGreen: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(34, 197, 94, 0.1)', justifyContent: 'center', alignItems: 'center' },
  iconBoxPink: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(236, 72, 153, 0.1)', justifyContent: 'center', alignItems: 'center' },
  input: { padding: 16, borderWidth: 1, borderRadius: 12, fontSize: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
});