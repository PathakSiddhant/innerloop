import React, { useEffect, useState, useRef, useMemo } from "react";
import { 
  View, ScrollView, RefreshControl, TouchableOpacity, 
  Modal, TextInput, StyleSheet, Dimensions, Platform, ActivityIndicator, Alert, KeyboardAvoidingView 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { 
  Flame, Dumbbell, Utensils, Droplets, Footprints, Scale, 
  X, Activity, Moon, Sun, Calendar, Plus, Minus, Check, ChevronRight, Save
} from "lucide-react-native";

import { ThemedText } from "../components/ThemedText";
import { useTheme } from "../lib/ThemeContext";
import { api } from "../lib/api";
import { FitnessData, FoodItem, WorkoutSession, Exercise, Set } from "../lib/types";

const { width } = Dimensions.get("window");
const TEST_USER_ID = "user_2s..."; // Ensure this matches exactly with Web

const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function FitnessScreen() {
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // MAIN DATA STATE
  const [data, setData] = useState<FitnessData | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const dateKey = useMemo(() => formatDateKey(selectedDate), [selectedDate]);

  // --- FETCH DATA ---
  const fetchData = React.useCallback(async () => {
    try {
      const res = await api.getFitness(TEST_USER_ID, dateKey);
      if (res) setData(res);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [dateKey]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- ROBUST AUTO SAVE ---
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const updateLocal = (updates: Partial<FitnessData>) => {
    if (!data) return;
    const newData = { ...data, ...updates };
    setData(newData); // Immediate UI Update
    
    // Haptics for feedback
    if(Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await api.updateFitness(TEST_USER_ID, dateKey, newData);
        console.log("✅ Saved to Cloud");
      } catch (err) {
        console.error("❌ Save Failed:", err);
      }
    }, 1000);
  };

  // --- CALCS ---
  const totalMacros = data?.meals?.reduce((acc, m) => ({
    p: acc.p + m.p, c: acc.c + m.c, f: acc.f + m.f, cals: acc.cals + m.cals
  }), { p: 0, c: 0, f: 0, cals: 0 }) || { p:0, c:0, f:0, cals:0 };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const isRest = data?.isRestDay || false;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient
        colors={theme === 'dark' ? ['#1e1b4b', '#000000'] : ['#e0e7ff', '#F2F2F7']}
        style={StyleSheet.absoluteFillObject}
      />

      <ScrollView 
        contentContainerStyle={{ padding: 16, paddingBottom: 120, paddingTop: insets.top + 10 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor={colors.primary} />}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <ThemedText style={{ fontSize: 10, fontWeight: '900', letterSpacing: 1, color: isRest ? colors.textSecondary : colors.primary, textTransform: 'uppercase' }}>
              ATHLETIC OS
            </ThemedText>
            <ThemedText style={{ fontSize: 32, fontWeight: '900', color: colors.text }}>Fitness</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
             <TouchableOpacity onPress={() => updateLocal({ isRestDay: !isRest })} style={[styles.pill, { backgroundColor: isRest ? colors.text : colors.surface }]}>
                {isRest ? <Moon size={16} color={colors.background}/> : <Sun size={16} color={colors.text}/>}
             </TouchableOpacity>
             <View style={[styles.pill, { backgroundColor: colors.surface }]}>
                <Calendar size={16} color={colors.text} />
                <ThemedText style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 6 }}>
                   {selectedDate.getDate()}/{selectedDate.getMonth()+1}
                </ThemedText>
             </View>
          </View>
        </View>

        {/* --- CARDS GRID --- */}
        <View style={{ gap: 12 }}>
          
          {/* ROW 1 */}
          <View style={{ flexDirection: 'row', gap: 12, height: 160 }}>
             {/* STREAK */}
             <BentoCard flex={0.4} color={isRest ? colors.surface : '#18181b'} borderColor={colors.glassBorder}>
                <View style={[styles.iconCircle, { backgroundColor: isRest ? 'transparent' : 'rgba(249,115,22,0.1)' }]}>
                   <Flame size={20} color={isRest ? colors.textSecondary : "#f97316"} />
                </View>
                <View>
                   <ThemedText style={{ fontSize: 32, fontWeight: '900', color: isRest ? colors.textSecondary : 'white' }}>3</ThemedText>
                   <ThemedText style={{ fontSize: 10, fontWeight: '700', color: isRest ? colors.textSecondary : '#fb923c' }}>STREAK</ThemedText>
                </View>
             </BentoCard>

             {/* WORKOUT */}
             <BentoCard flex={0.6} color={isRest ? colors.surface : '#18181b'} onPress={() => setActiveModal('workout')}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                   <View style={[styles.iconCircle, { backgroundColor: isRest ? 'transparent' : 'rgba(168,85,247,0.1)' }]}>
                      <Dumbbell size={20} color={isRest ? colors.textSecondary : "#a855f7"} />
                   </View>
                   {data?.sessions?.length ? (
                      <View style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#a855f7', borderRadius: 6 }}>
                         <ThemedText style={{ fontSize: 10, fontWeight: 'bold', color: 'white' }}>DONE</ThemedText>
                      </View>
                   ) : null}
                </View>
                <View>
                   <ThemedText variant="h2" style={{ fontSize: 20, marginBottom: 4, color: isRest ? colors.textSecondary : 'white' }}>Workout</ThemedText>
                   <ThemedText style={{ fontSize: 11, color: colors.textSecondary }}>{data?.sessions?.length || 0} Sessions Logged</ThemedText>
                </View>
             </BentoCard>
          </View>

          {/* NUTRITION CARD (Fixed Overflow) */}
          <BentoCard onPress={() => setActiveModal('diet')} color={colors.surface}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                   <Utensils size={18} color="#10b981" />
                   <ThemedText style={{ fontWeight: '800', fontSize: 12, color: colors.textSecondary }}>NUTRITION</ThemedText>
                </View>
                <ThemedText style={{ fontWeight: '900', fontSize: 16 }}>{Math.round(totalMacros.cals)} <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>/ {data?.macroGoal?.cals}</ThemedText></ThemedText>
             </View>
             <View style={{ gap: 8 }}>
                <MacroBar label="Protein" val={totalMacros.p} max={data?.macroGoal?.p} color="#3b82f6" bg={colors.surfaceHighlight} />
                <MacroBar label="Carbs" val={totalMacros.c} max={data?.macroGoal?.c} color="#22c55e" bg={colors.surfaceHighlight} />
                <MacroBar label="Fats" val={totalMacros.f} max={data?.macroGoal?.f} color="#eab308" bg={colors.surfaceHighlight} />
             </View>
          </BentoCard>

          {/* ROW 3: WATER & STEPS */}
          <View style={{ flexDirection: 'row', gap: 12, height: 160 }}>
             <BentoCard flex={1} color="#3b82f6" onPress={() => setActiveModal('water')} border={false}>
                <View style={{ justifyContent: 'space-between', height: '100%' }}>
                   <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10 }}>
                         <Droplets size={18} color="white" />
                      </View>
                   </View>
                   <View>
                      <ThemedText style={{ fontSize: 28, fontWeight: '900', color: 'white' }}>{data?.waterIntake}</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' }}>/ {data?.waterGoal} ml</ThemedText>
                   </View>
                </View>
             </BentoCard>

             <BentoCard flex={1} onPress={() => setActiveModal('steps')} color={colors.surface}>
                <View style={{ justifyContent: 'space-between', height: '100%' }}>
                   <View style={[styles.iconCircle, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                      <Footprints size={18} color="#10b981" />
                   </View>
                   <View>
                      <ThemedText style={{ fontSize: 28, fontWeight: '900' }}>{data?.stepCount}</ThemedText>
                      <ThemedText style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>GOAL: {data?.stepGoal}</ThemedText>
                   </View>
                   <View style={{ height: 6, backgroundColor: colors.surfaceHighlight, borderRadius: 3 }}>
                      <View style={{ width: `${Math.min(((data?.stepCount||0)/(data?.stepGoal||1))*100, 100)}%`, height: '100%', backgroundColor: '#10b981' }} />
                   </View>
                </View>
             </BentoCard>
          </View>

          {/* WEIGHT CARD */}
          <BentoCard height={100} onPress={() => setActiveModal('weight')} color={colors.surface}>
             <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', height: '100%' }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                   <View style={[styles.iconCircle, { backgroundColor: 'rgba(236, 72, 153, 0.1)' }]}>
                      <Scale size={20} color="#ec4899" />
                   </View>
                   <View>
                      <ThemedText style={{ fontWeight: '800' }}>Body Weight</ThemedText>
                      <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Target: {data?.targetWeight || '--'} kg</ThemedText>
                   </View>
                </View>
                <ThemedText style={{ fontSize: 24, fontWeight: '900' }}>{data?.bodyWeight || '--'} <ThemedText style={{ fontSize: 14, color: colors.textSecondary }}>kg</ThemedText></ThemedText>
             </View>
          </BentoCard>

        </View>
      </ScrollView>

      {/* --- FUNCTIONAL MODALS --- */}
      
      {/* 1. NUTRITION MODAL (ALL FIELDS) */}
      <FullModal visible={activeModal === 'diet'} onClose={() => setActiveModal(null)} title="Nutrition OS">
         <DietLab data={data} updateLocal={updateLocal} colors={colors} />
      </FullModal>

      {/* 2. WORKOUT MODAL (FULL LAB) */}
      <FullModal visible={activeModal === 'workout'} onClose={() => setActiveModal(null)} title="Workout Lab">
         <WorkoutLab data={data} updateLocal={updateLocal} colors={colors} />
      </FullModal>

      {/* 3. WATER MODAL */}
      <BottomModal visible={activeModal === 'water'} onClose={() => setActiveModal(null)} title="Hydration">
         <HydrationLab data={data} updateLocal={updateLocal} colors={colors} />
      </BottomModal>

      {/* 4. ACTIVITY MODAL */}
      <BottomModal visible={activeModal === 'steps'} onClose={() => setActiveModal(null)} title="Activity">
         <ActivityLab data={data} updateLocal={updateLocal} colors={colors} />
      </BottomModal>

      {/* 5. WEIGHT MODAL */}
      <BottomModal visible={activeModal === 'weight'} onClose={() => setActiveModal(null)} title="Body Weight">
         <WeightLab data={data} updateLocal={updateLocal} colors={colors} />
      </BottomModal>

    </View>
  );
}

// --- SUB-COMPONENTS & LOGIC ---

const BentoCard = ({ children, flex, height, color, onPress, borderColor }: any) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity 
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      style={{
        flex, height, 
        backgroundColor: color, 
        borderRadius: 24, 
        padding: 16,
        borderWidth: borderColor ? 1 : 0,
        borderColor: borderColor,
        overflow: 'hidden'
      }}
    >
      {children}
    </TouchableOpacity>
  );
};

const MacroBar = ({ label, val, max, color, bg }: any) => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
      <ThemedText style={{ fontSize: 11, fontWeight: '700' }}>{label}</ThemedText>
      <ThemedText style={{ fontSize: 11, color: '#9ca3af' }}>{Math.round(val)}/{max}g</ThemedText>
    </View>
    <View style={{ height: 6, backgroundColor: bg, borderRadius: 3 }}>
      <View style={{ width: `${Math.min((val/max)*100, 100)}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </View>
  </View>
);

const FullModal = ({ visible, onClose, title, children }: any) => {
   const { colors } = useTheme();
   return (
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
         <View style={{ flex: 1, backgroundColor: colors.background }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: colors.glassBorder }}>
               <ThemedText variant="h2" style={{ marginBottom: 0 }}>{title}</ThemedText>
               <TouchableOpacity onPress={onClose} style={{ padding: 8, backgroundColor: colors.surfaceHighlight, borderRadius: 20 }}>
                  <X size={20} color={colors.text} />
               </TouchableOpacity>
            </View>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
               <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>{children}</ScrollView>
            </KeyboardAvoidingView>
         </View>
      </Modal>
   );
};

const BottomModal = ({ visible, onClose, title, children }: any) => {
   const { colors, theme } = useTheme();
   return (
      <Modal visible={visible} animationType="slide" transparent>
         <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: theme === 'dark' ? '#09090b' : '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: 40, maxHeight: '85%' }}>
               <View style={{ padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderColor: colors.glassBorder }}>
                  <ThemedText style={{ fontSize: 20, fontWeight: '800', color: colors.text }}>{title}</ThemedText>
                  <TouchableOpacity onPress={onClose} style={{ padding: 5, backgroundColor: colors.surfaceHighlight, borderRadius: 20 }}>
                     <X size={20} color={colors.text} />
                  </TouchableOpacity>
               </View>
               <ScrollView>{children}</ScrollView>
            </View>
         </View>
      </Modal>
   );
};

// --- LOGIC LABS (FIXED) ---

const DietLab = ({ data, updateLocal, colors }: any) => {
   const [name, setName] = useState('');
   const [cals, setCals] = useState('');
   const [p, setP] = useState('');
   const [c, setC] = useState('');
   const [f, setF] = useState('');
   
   return (
      <View style={{ gap: 20 }}>
         {/* Goal */}
         <View style={{ padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
             <ThemedText style={{ fontSize: 12, fontWeight: '700', color: colors.textSecondary }}>CALORIE GOAL</ThemedText>
             <TextInput 
                style={{ fontSize: 32, fontWeight: '900', color: colors.text }} 
                keyboardType="numeric"
                value={String(data?.macroGoal?.cals || 2500)}
                onChangeText={(t) => updateLocal({ macroGoal: { ...data.macroGoal, cals: Number(t) } })}
             />
         </View>

         {/* ADD FOOD - FULL INPUTS */}
         <View style={{ gap: 10, padding: 15, backgroundColor: colors.surface, borderRadius: 16 }}>
            <ThemedText variant="subtitle">Log Meal</ThemedText>
            <TextInput placeholder="Food Name (e.g. Eggs)" placeholderTextColor={colors.textSecondary} style={[styles.input, { color: colors.text, borderColor: colors.glassBorder }]} value={name} onChangeText={setName} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <TextInput placeholder="Cals" placeholderTextColor={colors.textSecondary} keyboardType="numeric" style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.glassBorder }]} value={cals} onChangeText={setCals} />
               <TextInput placeholder="P (g)" placeholderTextColor={colors.textSecondary} keyboardType="numeric" style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.glassBorder }]} value={p} onChangeText={setP} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
               <TextInput placeholder="C (g)" placeholderTextColor={colors.textSecondary} keyboardType="numeric" style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.glassBorder }]} value={c} onChangeText={setC} />
               <TextInput placeholder="F (g)" placeholderTextColor={colors.textSecondary} keyboardType="numeric" style={[styles.input, { flex: 1, color: colors.text, borderColor: colors.glassBorder }]} value={f} onChangeText={setF} />
            </View>
            <TouchableOpacity 
               onPress={() => {
                  if(name && cals) {
                     const m = { id: generateId(), name, cals: Number(cals), p: Number(p), c: Number(c), f: Number(f) };
                     updateLocal({ meals: [...(data?.meals || []), m] });
                     setName(''); setCals(''); setP(''); setC(''); setF('');
                  }
               }}
               style={{ backgroundColor: '#10b981', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 5 }}
            >
               <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Add to Diary</ThemedText>
            </TouchableOpacity>
         </View>

         {/* LIST */}
         <View style={{ gap: 10 }}>
            <ThemedText variant="subtitle">Today's Meals</ThemedText>
            {data?.meals?.map((m: any, i: number) => (
               <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 15, backgroundColor: colors.surface, borderRadius: 12, alignItems: 'center' }}>
                  <View>
                     <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>{m.name}</ThemedText>
                     <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>{m.cals} kcal • P:{m.p} C:{m.c} F:{m.f}</ThemedText>
                  </View>
                  <TouchableOpacity onPress={() => updateLocal({ meals: data.meals.filter((item: any) => item.id !== m.id) })}>
                     <X size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
               </View>
            ))}
         </View>
      </View>
   );
};

const WorkoutLab = ({ data, updateLocal, colors }: any) => {
   const [sessionName, setSessionName] = useState('');
   const [exercises, setExercises] = useState<Exercise[]>([]);

   const addExercise = () => {
      setExercises([...exercises, { id: generateId(), name: '', sets: [{ id: generateId(), weight: 0, reps: 0, completed: false }] }]);
   };

   const updateEx = (idx: number, field: string, val: any) => {
      const newEx = [...exercises];
      // @ts-ignore
      newEx[idx][field] = val;
      setExercises(newEx);
   };

   const updateSet = (exIdx: number, setIdx: number, field: string, val: any) => {
      const newEx = [...exercises];
      // @ts-ignore
      newEx[exIdx].sets[setIdx][field] = val;
      setExercises(newEx);
   };

   const saveSession = () => {
      if(!sessionName) return Alert.alert("Name Required", "Please name your session");
      const newSession: WorkoutSession = {
         id: generateId(),
         name: sessionName,
         startTime: Date.now(),
         endTime: Date.now() + 3600000, 
         exercises
      };
      updateLocal({ sessions: [...(data?.sessions || []), newSession] });
      setSessionName(''); setExercises([]);
      Alert.alert("Success", "Workout Logged!");
   };

   return (
      <View style={{ gap: 20 }}>
         <TextInput 
            placeholder="Session Name (e.g. Push Day)" 
            placeholderTextColor={colors.textSecondary}
            style={[styles.input, { color: colors.text, borderColor: colors.glassBorder }]} 
            value={sessionName} onChangeText={setSessionName}
         />
         
         {exercises.map((ex, i) => (
            <View key={ex.id} style={{ padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16, gap: 10 }}>
               <TextInput 
                  placeholder="Exercise Name" 
                  placeholderTextColor={colors.textSecondary}
                  style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, borderBottomWidth: 1, borderColor: colors.glassBorder, paddingBottom: 5 }}
                  value={ex.name} onChangeText={t => updateEx(i, 'name', t)}
               />
               {ex.sets.map((set, j) => (
                  <View key={set.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                     <ThemedText style={{ width: 20, color: colors.textSecondary }}>{j+1}</ThemedText>
                     <TextInput 
                        placeholder="kg" keyboardType="numeric" 
                        style={[styles.smallInput, { color: colors.text, backgroundColor: colors.background }]}
                        onChangeText={t => updateSet(i, j, 'weight', Number(t))}
                     />
                     <TextInput 
                        placeholder="reps" keyboardType="numeric" 
                        style={[styles.smallInput, { color: colors.text, backgroundColor: colors.background }]}
                        onChangeText={t => updateSet(i, j, 'reps', Number(t))}
                     />
                     <TouchableOpacity onPress={() => updateSet(i, j, 'completed', !set.completed)}>
                        <Check size={20} color={set.completed ? '#10b981' : colors.textSecondary} />
                     </TouchableOpacity>
                  </View>
               ))}
               <TouchableOpacity onPress={() => {
                  const newEx = [...exercises];
                  newEx[i].sets.push({ id: generateId(), weight: 0, reps: 0, completed: false });
                  setExercises(newEx);
               }}>
                  <ThemedText style={{ fontSize: 12, color: colors.primary, textAlign: 'center', marginTop: 5 }}>+ Add Set</ThemedText>
               </TouchableOpacity>
            </View>
         ))}

         <TouchableOpacity onPress={addExercise} style={{ padding: 15, borderWidth: 1, borderColor: colors.primary, borderRadius: 12, alignItems: 'center', borderStyle: 'dashed' }}>
            <ThemedText style={{ color: colors.primary, fontWeight: 'bold' }}>+ Add Exercise</ThemedText>
         </TouchableOpacity>

         <TouchableOpacity onPress={saveSession} style={{ padding: 16, backgroundColor: colors.primary, borderRadius: 12, alignItems: 'center', marginTop: 10 }}>
            <ThemedText style={{ color: 'white', fontWeight: 'bold' }}>Finish & Save</ThemedText>
         </TouchableOpacity>

         {/* History */}
         <ThemedText variant="subtitle" style={{ marginTop: 20 }}>History</ThemedText>
         {data?.sessions?.map((s: WorkoutSession, i: number) => (
            <View key={i} style={{ padding: 15, backgroundColor: colors.surface, borderRadius: 12, borderLeftWidth: 4, borderColor: colors.primary }}>
               <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>{s.name}</ThemedText>
               <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>{s.exercises.length} Exercises • {new Date(s.startTime).toLocaleTimeString()}</ThemedText>
            </View>
         ))}
      </View>
   );
};

const HydrationLab = ({ data, updateLocal, colors }: any) => {
   return (
      <View style={{ alignItems: 'center' }}>
         <ThemedText style={{ fontSize: 64, fontWeight: '900', color: '#3b82f6' }}>{data?.waterIntake}</ThemedText>
         <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: colors.textSecondary }}>MILLILITERS</ThemedText>

         <View style={{ flexDirection: 'row', gap: 15, marginVertical: 30 }}>
            {[250, 500, 1000].map(amt => (
               <TouchableOpacity key={amt} onPress={() => updateLocal({ waterIntake: (data?.waterIntake||0) + amt })} style={{ paddingVertical: 15, paddingHorizontal: 25, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
                  <ThemedText style={{ fontWeight: 'bold', color: colors.text }}>+{amt}</ThemedText>
               </TouchableOpacity>
            ))}
         </View>

         <View style={{ width: '100%', padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 5 }}>DAILY GOAL</ThemedText>
            <TextInput 
               keyboardType="numeric" 
               style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }} 
               value={String(data?.waterGoal || 3000)}
               onChangeText={t => updateLocal({ waterGoal: Number(t) })}
            />
         </View>
         <TouchableOpacity onPress={() => updateLocal({ waterIntake: 0 })} style={{ marginTop: 20 }}>
            <RotateCcw size={16} color="#ef4444" />
         </TouchableOpacity>
      </View>
   );
};

const ActivityLab = ({ data, updateLocal, colors }: any) => {
   return (
      <View style={{ alignItems: 'center', gap: 30 }}>
         <ThemedText style={{ fontSize: 64, fontWeight: '900', color: colors.text }}>{data?.stepCount}</ThemedText>
         <View style={{ flexDirection: 'row', gap: 20 }}>
            <TouchableOpacity onPress={() => updateLocal({ stepCount: Math.max(0, (data?.stepCount||0)-500) })} style={[styles.roundBtn, { backgroundColor: colors.surfaceHighlight }]}>
               <Minus size={24} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => updateLocal({ stepCount: (data?.stepCount||0)+500 })} style={[styles.roundBtn, { backgroundColor: '#10b981' }]}>
               <Plus size={24} color="white" />
            </TouchableOpacity>
         </View>
         <View style={{ width: '100%', padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
            <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>STEP GOAL</ThemedText>
            <TextInput 
               keyboardType="numeric" style={{ fontSize: 24, fontWeight: 'bold', color: colors.text }} 
               value={String(data?.stepGoal || 10000)} onChangeText={t => updateLocal({ stepGoal: Number(t) })}
            />
         </View>
      </View>
   );
};

const WeightLab = ({ data, updateLocal, colors }: any) => {
   return (
      <View style={{ gap: 20 }}>
         <View style={{ flexDirection: 'row', gap: 15 }}>
            <View style={{ flex: 1, padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
               <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>CURRENT (KG)</ThemedText>
               <TextInput 
                  keyboardType="numeric" style={{ fontSize: 32, fontWeight: '900', color: colors.text }} placeholder="0.0"
                  value={String(data?.bodyWeight || '')}
                  onChangeText={t => updateLocal({ bodyWeight: parseFloat(t) })}
               />
            </View>
            <View style={{ flex: 1, padding: 15, backgroundColor: colors.surfaceHighlight, borderRadius: 16 }}>
               <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>TARGET (KG)</ThemedText>
               <TextInput 
                  keyboardType="numeric" style={{ fontSize: 32, fontWeight: '900', color: colors.text }} 
                  value={String(data?.targetWeight || '')} onChangeText={t => updateLocal({ targetWeight: parseFloat(t) })}
               />
            </View>
         </View>
      </View>
   );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingVertical: 8, paddingHorizontal: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  input: { padding: 15, borderWidth: 1, borderRadius: 12, fontSize: 16 },
  smallInput: { padding: 10, borderRadius: 8, width: 60, textAlign: 'center' },
  roundBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});